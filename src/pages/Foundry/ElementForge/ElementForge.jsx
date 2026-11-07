import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaign } from '../../../context/CampaignContext';
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
import { Sparkles, Palette, BookOpen, Plus, Search, Wand2, X, Trash2, Upload, Download, Database, CheckSquare, Square, RefreshCw, ChevronDown, Pin, ExternalLink } from 'lucide-react';
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
  resolveTargetCortexCollection,
  consolidateAdeElementToCortexPayload,
  convertPersonaElementToFolio,
  ADE_TYPE_TO_CORTEX_COLLECTIONS,
  CORTEX_BACKED_ADE_TYPES
} from '../../../utils/cortexAdeAssetBridge.js';

export const ElementForge = ({ onBackToStory, activeType: propActiveType, onSelectType, hideSidebar = false }) => {
  const navigate = useNavigate();
  const { elementsCatalog, updateSavedElement, deleteSavedElement, saveElementToCloud, universeState, activeScenarioId } = useCampaign();
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
    const results = await batchIngestAimeFiles(files);
    let count = 0;
    for (const res of results) {
      if (res.success && res.element) {
        const normalizedElem = {
          ...res.element,
          type: normalizeElementType(res.element.type)
        };
        await updateSavedElement(normalizedElem.id, normalizedElem);
        await saveElementToCloud(normalizedElem);
        count++;
      }
    }
    if (count > 0) {
      showToast({ type: 'success', text: `Ingested ${count} AIME portable asset(s)!` });
    } else {
      showToast({ type: 'warning', text: 'No valid element files could be ingested.' });
    }
  };

  // Omnicortex DBM & Persona Folio Live State
  const { dbData = {}, saveEntry, deleteEntry } = useDBM() || {};
  const {
    roster: folioRoster = [],
    personaRoster = [],
    publicPersonas = [],
    saveToRoster,
    loadCharacter
  } = useFolio() || {};
  const liveFolioRoster = useMemo(
    () => (Array.isArray(folioRoster) && folioRoster.length > 0 ? folioRoster : (Array.isArray(personaRoster) ? personaRoster : [])),
    [folioRoster, personaRoster]
  );

  const [isDbmImportOpen, setIsDbmImportOpen] = useState(false);
  const [selectedDbmIds, setSelectedDbmIds] = useState(new Set());
  const [dbmSearchTerm, setDbmSearchTerm] = useState('');

  // Discover matching DBM canonical records for the active element type (for bulk Story Module pinning)
  const matchingDbmItems = useMemo(() => {
    if (!dbData) return [];
    const cols = ADE_TYPE_TO_CORTEX_COLLECTIONS[activeType] || [];
    const items = [];
    for (const col of cols) {
      for (const entry of dbData[col] || []) {
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
    if (selectedDbmIds.size === 0) return;
    const itemsToImport = matchingDbmItems.filter(item => selectedDbmIds.has(item.id));
    let count = 0;
    for (const item of itemsToImport) {
      const newElem = {
        id: `elem_dbm_${item.dbmCategory}_${item.id || Date.now()}`,
        title: item.title || item.name || 'Omnicortex Element',
        type: activeType,
        ...(activeType === 'Property' ? { propertySubcategory: item.dbmCategory } : {}),
        ...(activeType === 'Metaphysics' ? { metaphysicsSubcategory: item.dbmCategory } : {}),
        ...(activeType === 'Persona' && item.dbmCategory === 'modular_characters' ? { personaSubcategory: 'mcm' } : {}),
        content: item.description || item.concept || item.notes || item.summary || '',
        dbmSyncStatus: 'synced',
        dbmCategory: item.dbmCategory,
        dbmId: item.id,
        fields: {
          dbmRef: item.id,
          dbmId: item.id,
          dbmCategory: item.dbmCategory,
          ...(activeType === 'Property' ? { propertySubcategory: item.dbmCategory } : {}),
          ...(activeType === 'Metaphysics' ? { metaphysicsSubcategory: item.dbmCategory } : {}),
          ...item
        }
      };
      await updateSavedElement(newElem.id, newElem);
      await saveElementToCloud(newElem);
      count++;
    }
    showToast({ type: 'success', text: `Pinned ${count} ${activeType} element(s) from OmniCortex into Story Module!` });
    setSelectedDbmIds(new Set());
    setIsDbmImportOpen(false);
  };

  const handleRefreshAllDbmLinks = async () => {
    const linked = (elementsCatalog || []).filter(el => el.fields?.dbmRef || el.dbmRef || el.dbmId || el.fields?.dbmId);
    if (linked.length === 0) {
      showToast({ type: 'info', text: 'No DBM-linked elements found in this Story Module.' });
      return;
    }
    let updatedCount = 0;
    for (const el of linked) {
      const updated = pullElementFromOmnicortexDBM(el, dbData);
      if (updated) {
        await updateSavedElement(updated.id, updated);
        await saveElementToCloud(updated);
        updatedCount++;
      }
    }
    showToast({ type: 'success', text: `Refreshed ${updatedCount} element(s) with canonical OmniCortex DBM records!` });
  };

  // Unified Cortex + Codex + Folio + MCM + Story Module Catalog
  const unifiedCatalog = useMemo(
    () =>
      buildUnifiedAdeCatalog({
        elementsCatalog: elementsCatalog || [],
        dbData,
        folioRoster: liveFolioRoster,
        publicPersonas: Array.isArray(publicPersonas) ? publicPersonas : []
      }),
    [elementsCatalog, dbData, liveFolioRoster, publicPersonas]
  );

  const typeElements = useMemo(
    () => unifiedCatalog.filter(el => normalizeElementType(el.type) === activeType),
    [unifiedCatalog, activeType]
  );

  // Filter elements by source scope, subcategory, and search term
  const filteredElements = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return typeElements.filter((el) => {
      if (sourceFilter === 'module' && !el.isPinnedToModule) return false;
      if (sourceFilter === 'cortex' && !el.isCortexAsset && !el.isFolioPersona) return false;

      if (activeType === 'Property' && activePropertySubcategory !== 'all') {
        const sub = el.propertySubcategory || inferPropertySubcategory(el);
        if (sub !== activePropertySubcategory) return false;
      }

      if (activeType === 'Persona' && activePersonaSource !== 'all') {
        const pSub = el.personaSubcategory || (el.isFolioPersona ? 'folio' : el.dbmCategory === 'modular_characters' ? 'mcm' : el.dbmCategory === 'archetypes' ? 'archetypes' : 'story');
        if (pSub !== activePersonaSource) return false;
      }

      if (activeType === 'Metaphysics' && activeMetaphysicsSubcategory !== 'all') {
        const mSub = el.metaphysicsSubcategory || inferMetaphysicsSubcategory(el);
        if (mSub !== activeMetaphysicsSubcategory) return false;
      }

      if (q) {
        const haystack = [
          el.title,
          el.name,
          el.dbmCategory,
          el.propertySubcategory,
          el.metaphysicsSubcategory,
          el.fields?.oneLinePitch,
          el.fields?.summary,
          el.fields?.archetype,
          el.fields?.discipline,
          el.fields?.faction_type
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [typeElements, sourceFilter, activeType, activePropertySubcategory, activePersonaSource, activeMetaphysicsSubcategory, searchTerm]);

  const handleTogglePinToModule = async (el, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1160, 0.025);

    if (el.isPinnedToModule && (el.isCortexAsset || el.isFolioPersona)) {
      const targetModuleId = el.moduleElementId || el.id;
      deleteSavedElement(targetModuleId);
      showToast({
        type: 'info',
        text: `Unpinned "${el.title || el.name}" from active Story Module (Cortex/Folio asset preserved).`
      });
      return;
    }

    const pinId = el.moduleElementId || `pin_${el.id}`;
    const pinnedElem = {
      ...el,
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
    await updateSavedElement(pinnedElem.id, pinnedElem);
    await saveElementToCloud(pinnedElem);
    showToast({
      type: 'success',
      text: `Pinned "${pinnedElem.title || pinnedElem.name}" into active Story Module!`
    });
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

  const handleSave = async (updatedElement) => {
    const normalized = {
      ...updatedElement,
      type: normalizeElementType(updatedElement.type)
    };

    // 1. Persona Folio Character Synchronization
    if (
      normalized.type === 'Persona' &&
      (normalized.isFolioPersona || normalized.personaSubcategory === 'folio' || normalized.fields?.personaSubcategory === 'folio')
    ) {
      if (typeof saveToRoster === 'function') {
        const folioPayload = convertPersonaElementToFolio(normalized, normalized.personaData || {});
        if (folioPayload) {
          await saveToRoster(folioPayload);
          showToast({
            type: 'success',
            text: `Saved "${normalized.title}" to Persona Folio Roster!`
          });
        }
      }
      if (normalized.isPinnedToModule || (elementsCatalog || []).some(e => e.id === normalized.id)) {
        await updateSavedElement(normalized.id, normalized);
        await saveElementToCloud(normalized);
      }
      setIsEditModalOpen(false);
      setSelectedElement(null);
      return;
    }

    // 2. OmniCortex / Codex Consolidated Asset Persistence
    const targetCortexCollection = resolveTargetCortexCollection(normalized);
    if (targetCortexCollection && typeof saveEntry === 'function') {
      const consolidated = consolidateAdeElementToCortexPayload(normalized, {
        targetCollection: targetCortexCollection
      });
      if (consolidated) {
        const res = await saveEntry(consolidated.payload, consolidated.targetCollection);
        if (res?.ok !== false) {
          showToast({
            type: 'success',
            text: `Consolidated "${normalized.title}" to OmniCortex (${consolidated.targetCollection})!`
          });
        }
        // Also update Story Module pin if already pinned or explicitly Story-scoped
        const existsInModule = (elementsCatalog || []).some(
          e => e.id === normalized.id || e.id === normalized.moduleElementId
        );
        if (normalized.isPinnedToModule || existsInModule) {
          const syncedPin = {
            ...normalized,
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
          await updateSavedElement(syncedPin.id, syncedPin);
          await saveElementToCloud(syncedPin);
        }
        setIsEditModalOpen(false);
        setSelectedElement(null);
        return;
      }
    }

    // 3. Campaign-Scoped Narrative Elements (Story Arc, Adventure, Encounter, Clue, Handout, Map, Story Persona, etc.)
    await updateSavedElement(normalized.id, normalized);
    await saveElementToCloud(normalized);
    setIsEditModalOpen(false);
    setSelectedElement(null);
  };

  const handleDeleteAsset = async (el) => {
    const inModule = (elementsCatalog || []).some(e => e.id === el.id || e.id === el.moduleElementId);
    if (inModule) {
      deleteSavedElement(el.moduleElementId || el.id);
    }
    if (el.isCortexAsset && el.dbmId && el.dbmCategory && typeof deleteEntry === 'function' && !inModule) {
      await deleteEntry(el.dbmId, el.dbmCategory);
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
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs focus:outline-none focus:border-amber-500/60 text-slate-200 placeholder-slate-500 w-52 sm:w-60 transition-colors shadow-inner"
              />
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
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
                  {/* Group 1: Creation & AI Studio */}
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">
                      Creation &amp; AI Studio
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        handleCreateNew();
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/60 text-slate-200 hover:text-amber-200 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Plus size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-200 group-hover:text-amber-300">Create {activeType}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">New</span>
                    </button>

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
                  {((matchingDbmItems && matchingDbmItems.length > 0) || (elementsCatalog || []).some(el => el.fields?.dbmRef || el.dbmRef)) && (
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

                      {(elementsCatalog || []).some(el => el.fields?.dbmRef || el.dbmRef) && (
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
          {/* Row 1: Source Scope Filter (Cortex / Folio / Story Module) */}
          {CORTEX_BACKED_ADE_TYPES.has(activeType) && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 uppercase font-bold text-[10px] mr-1">Source:</span>
                {[
                  { id: 'all', label: `All ${activeType}`, count: typeElements.length },
                  { id: 'cortex', label: activeType === 'Persona' ? 'OmniCortex & Folio' : 'OmniCortex / Codex', count: typeElements.filter(e => e.isCortexAsset || e.isFolioPersona).length },
                  { id: 'module', label: 'Pinned in Story Module', count: typeElements.filter(e => e.isPinnedToModule).length }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1080, 0.02);
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
          )}

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
                const count = typeElements.filter(e => (e.propertySubcategory || inferPropertySubcategory(e)) === sub.id).length;
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
                const count = typeElements.filter((e) => {
                  const pSub = e.personaSubcategory || (e.isFolioPersona ? 'folio' : e.dbmCategory === 'modular_characters' ? 'mcm' : e.dbmCategory === 'archetypes' ? 'archetypes' : 'story');
                  return pSub === sub.id;
                }).length;
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
                const count = typeElements.filter(e => (e.metaphysicsSubcategory || inferMetaphysicsSubcategory(e)) === sub.id).length;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max pb-8">
              {filteredElements.map(el => {
                const subLabel =
                  el.type === 'Property'
                    ? (el.propertySubcategory || inferPropertySubcategory(el)).toUpperCase()
                    : el.type === 'Metaphysics'
                    ? (el.metaphysicsSubcategory || inferMetaphysicsSubcategory(el)).toUpperCase()
                    : el.type === 'Persona'
                    ? (el.isFolioPersona ? 'FOLIO' : el.dbmCategory === 'modular_characters' ? 'MCM' : el.dbmCategory === 'archetypes' ? 'ARCHETYPE' : 'STORY')
                    : (el.dbmCategory ? el.dbmCategory.toUpperCase() : '');
                const previewPitch = el.fields?.oneLinePitch || el.fields?.summary || '';

                return (
                <div 
                  key={el.id} 
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
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
                            : (el.isCortexAsset || el.fields?.dbmRef || el.dbmRef || el.dbmSyncStatus === 'synced')
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm' 
                            : el.dbmSyncStatus === 'local_override'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}>
                          {el.isFolioPersona
                            ? '🪪 Folio'
                            : (el.isCortexAsset || el.fields?.dbmRef || el.dbmRef || el.dbmSyncStatus === 'synced')
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
                    
                    {el.content && !previewPitch && (
                      <div 
                        className="text-xs text-slate-400 line-clamp-2 mb-3 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(el.content.substring(0, 120)) }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 mt-3 shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono truncate max-w-[115px]">
                      {el.isPinnedToModule ? '📌 In Module' : el.isFolioPersona ? 'Folio Roster' : el.isCortexAsset ? 'OmniCortex' : 'Module Draft'}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Pin / Unpin Cortex or Folio Asset to Active Story Module */}
                      {(el.isCortexAsset || el.isFolioPersona) && (
                        <button
                          type="button"
                          onClick={(e) => handleTogglePinToModule(el, e)}
                          className={`p-1.5 rounded border transition-colors cursor-pointer ${
                            el.isPinnedToModule
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border-slate-700/70'
                          }`}
                          title={el.isPinnedToModule ? 'Pinned in Story Module (Click to unpin)' : 'Pin to active Story Module'}
                        >
                          <Pin size={12} />
                        </button>
                      )}

                      {/* Open in Persona Folio or Codex Studio */}
                      {el.isFolioPersona && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (el.folioDocId && typeof loadCharacter === 'function') {
                              loadCharacter(el.folioDocId);
                            }
                            navigate('/folio');
                          }}
                          className="p-1.5 rounded text-purple-300 hover:text-purple-100 hover:bg-purple-950/70 border border-purple-500/30 transition-colors cursor-pointer"
                          title="Open character sheet in Persona Folio"
                        >
                          <ExternalLink size={12} />
                        </button>
                      )}

                      {!el.isFolioPersona && el.codexMatrixId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/codex?matrix=${el.codexMatrixId}`);
                          }}
                          className="p-1.5 rounded text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/70 border border-cyan-500/30 transition-colors cursor-pointer"
                          title={`Open in Codex Studio (${el.codexMatrixId})`}
                        >
                          <ExternalLink size={12} />
                        </button>
                      )}

                      {/* Pull Canon Updates from Omnicortex DBM */}
                      {el.isPinnedToModule && (el.fields?.dbmRef || el.dbmRef || el.dbmId || el.dbmSyncStatus === 'synced') && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const updated = pullElementFromOmnicortexDBM(el, dbData);
                            if (updated) {
                              await updateSavedElement(updated.id, updated);
                              await saveElementToCloud(updated);
                              showToast({ type: 'success', text: `Pulled canonical updates from DBM for ${updated.title}!` });
                            } else {
                              showToast({ type: 'warning', text: `No matching record found in Omnicortex DBM for ${el.title}.` });
                            }
                          }}
                          className="p-1.5 rounded text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/70 border border-cyan-500/30 transition-colors cursor-pointer"
                          title="Pull canonical updates from Omnicortex DBM"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}

                      {/* AIME Portable Asset Export Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAimeAssetFile(el);
                          showToast({ type: 'success', text: `Exported ${el.title || el.name} as portable ${getElementFileExtension(el.type, el.propertySubcategory)} asset!` });
                        }}
                        className="p-1.5 rounded text-amber-400 hover:text-amber-200 hover:bg-amber-950/60 border border-amber-500/30 transition-colors"
                        title={`Export AIME Asset (${getElementFileExtension(el.type, el.propertySubcategory)})`}
                      >
                        <Sparkles size={12} />
                      </button>

                      {/* Markdown Export Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadElementMarkdownFile({ ...el, name: el.title || el.name });
                          showToast({ type: 'info', text: `Exported ${el.title || el.name} to ELEMENTS.md markdown.` });
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                        title="Export as ELEMENTS.md Markdown"
                      >
                        <Download size={12} />
                      </button>

                      {!el.isFolioPersona && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const targetName = el.title || 'Untitled Element';
                            if (await confirmTypedDeletion(targetName, (el.type || 'story element').toLowerCase())) {
                              await handleDeleteAsset(el);
                            }
                          }}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete Element"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <span className="text-[10px] text-cyan-400 group-hover:text-amber-300 transition-colors ml-1 font-bold">
                        Edit ✏️
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Artist Hub Modal */}
      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setIsArtistHubOpen(false)}
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

      {/* Omnicortex DBM Import Modal */}
      {isDbmImportOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
          <div className="w-full max-w-2xl bg-[#0d1117] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Sync {activeType}s from Omnicortex DBM
                  </h3>
                  <p className="text-xs text-slate-400">
                    Import existing canonical compendium data directly into your adventure element catalog.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDbmImportOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search & Selection Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Search ${matchingDbmItems.length} available DBM entries...`}
                  value={dbmSearchTerm}
                  onChange={(e) => setDbmSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <Search size={14} className="absolute left-3 top-2 text-slate-500" />
              </div>

              <button
                type="button"
                onClick={() => {
                  const visibleIds = matchingDbmItems
                    .filter(i => !dbmSearchTerm || (i.title || i.name || '').toLowerCase().includes(dbmSearchTerm.toLowerCase()))
                    .map(i => i.id);
                  if (selectedDbmIds.size === visibleIds.length) {
                    setSelectedDbmIds(new Set());
                  } else {
                    setSelectedDbmIds(new Set(visibleIds));
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors shrink-0"
              >
                {selectedDbmIds.size > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[50vh]">
              {matchingDbmItems
                .filter(i => !dbmSearchTerm || (i.title || i.name || '').toLowerCase().includes(dbmSearchTerm.toLowerCase()))
                .map(item => {
                  const isSelected = selectedDbmIds.has(item.id);
                  const alreadyImported = (elementsCatalog || []).some(el => el.fields?.dbmRef === item.id || el.id === `elem_dbm_${item.id}`);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedDbmIds(prev => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-100'
                          : alreadyImported
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-75'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 text-cyan-400">
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold truncate text-sm">{item.title || item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-400 uppercase font-mono">
                              {item.dbmCategory || activeType}
                            </span>
                            {alreadyImported && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                                In Catalog
                              </span>
                            )}
                          </div>
                          {(item.description || item.concept || item.notes || item.summary) && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 pt-0.5">
                              {item.description || item.concept || item.notes || item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                {selectedDbmIds.size} of {matchingDbmItems.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDbmImportOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedDbmIds.size === 0}
                  onClick={handleImportSelectedDbm}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <Database size={13} />
                  <span>Import {selectedDbmIds.size} Elements</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Dual-Mode Guided + Sheet Studio) */}
      {isEditModalOpen && (
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          element={selectedElement}
          onSave={handleSave}
          onDelete={(id) => (selectedElement ? handleDeleteAsset(selectedElement) : deleteSavedElement(id))}
          initialMode={modalInitialMode}
          initialSeedTab={modalInitialSeedTab}
          activeScenario={activeScenario}
        />
      )}
    </div>
  );
};

export default ElementForge;
