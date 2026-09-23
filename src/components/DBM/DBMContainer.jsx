import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  categoryConfig, 
  DEVELOPMENT_FIELDS_GROUPS, 
  DEVELOPMENT_FIELDS_REGISTRY, 
  isDevelopmentField, 
  getDevelopmentField 
} from './categoryConfig';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

// Extracted Components
import { DBMHeader } from './DBMHeader';
import { DBMWikiView } from './DBMWikiView';
import { DBMGuideView } from './DBMGuideView';
import { DBMTableView } from './DBMTableView';
import { DBMLandingView } from './DBMLandingView';
import { BastionChatModal } from './BastionChatModal';
import { DBMItemModal } from './DBMItemModal';
import { ArchitectDevFieldsModal } from './ArchitectDevFieldsModal';
import { UserSettingsModal } from '../UserSettingsModal';
import { Toast } from '../UI/Toast';

import { useDBM } from '../../context/DBMContext';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { fetchGeminiContent, getGeminiApiKey, sendBastionChatMessage } from '../../services/bastionService';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';

import { PanelLeftOpen, ChevronRight, Menu } from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { OmnicortexNavRail } from './OmnicortexNavRail';

const EMPTY_CONFIG = {};

export const DBMContainer = () => {
  const { currentUser, userHandle, loginWithGoogle, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dbm = useDBM() || {};
  const {
    activeCategory, setActiveCategory,
    activeSubcategory, setActiveSubcategory,
    history, historyIndex,
    navigateToCategory, handleBack, handleForward,
    isSidebarOpen, setIsSidebarOpen,
    isBastionOpen, setIsBastionOpen,
    isArchitectModalOpen, setIsArchitectModalOpen,
    handleExportMasterJSON, handleImportMasterJSON,
    syncMasterSpeciesMatrix, syncCanonicalCompendium, syncCanonicalFactions
  } = dbm;

  // Reset search term on category/subcategory change
  useEffect(() => {
    setSearchTerm('');
  }, [activeCategory, activeSubcategory]);

  // Auto-navigate to user guide if ?guide=1 is in URL
  useEffect(() => {
    if (searchParams.get('guide') === '1' && navigateToCategory) {
      navigateToCategory('user_guide');
    }
  }, [searchParams, navigateToCategory]);

  // Global hotkey '[' or ']' to toggle compendium category drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        if (setIsSidebarOpen) setIsSidebarOpen(prev => !prev);
        AudioService.playTerminalBeep(1100, 0.02);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSidebarOpen]);

  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Bastion Modal States
  const [bastionMessages, setBastionMessages] = useState([
    { role: 'model', text: 'Bastion initialized. Greetings, ARCHITECT! How may I assist with database entries, rules, mechanics, or universe architecture today?' }
  ]);
  const [bastionInput, setBastionInput] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');

  // Multi-select & facet filter states
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterSubtypes, setFilterSubtypes] = useState([]);
  const [filterTLs, setFilterTLs] = useState([]);
  const [filterMLs, setFilterMLs] = useState([]);
  const [filterTags, setFilterTags] = useState([]);

  // Currently active configuration
  const currentKey = activeSubcategory || activeCategory;

  // Reset filters and sort when switching active category or subcategory
  useEffect(() => {
    setFilterTypes([]);
    setFilterSubtypes([]);
    setFilterTLs([]);
    setFilterMLs([]);
    setFilterTags([]);
    setSortField('name');
    setSortAsc(true);
  }, [currentKey]);

  const parentConfig = categoryConfig[activeCategory];
  const subConfig = activeSubcategory && parentConfig?.subcategories?.[activeSubcategory];
  const directConfig = categoryConfig[currentKey];
  const currentConfig = (subConfig && subConfig.directory_columns ? subConfig : directConfig)
    || subConfig
    || directConfig
    || EMPTY_CONFIG;

  const syncHook = useFirestoreSync(currentKey, currentUser);
  const dbData = dbm.dbData || syncHook.dbData;
  const saveEntry = dbm.saveEntry || syncHook.saveEntry;
  const deleteEntry = dbm.deleteEntry || syncHook.deleteEntry;
  const importJSON = dbm.importJSON || syncHook.importJSON;
  const toastMessage = dbm.toastMessage || syncHook.toastMessage;
  const clearToast = dbm.clearToast || syncHook.clearToast;
  const showToast = dbm.showToast || syncHook.showToast;
  const currentItems = dbData[currentKey] || [];

  const totalAssetsCount = useMemo(() => {
    return Object.keys(dbData).reduce((acc, k) => {
      return k !== 'compendium' && Array.isArray(dbData[k]) ? acc + dbData[k].length : acc;
    }, 0);
  }, [dbData]);

  // Helper for natural sorting value parsing
  const getSortableValue = (item, field) => {
    if (!item) return null;
    const val = item[field];
    if (val === undefined || val === null || val === '') return null;
    return val;
  };

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    return currentItems.filter(item => {
      // 1. Filter by Types (Multi-select)
      if (filterTypes.length > 0) {
        const itemType = item.type;
        const itemCat = item.category;
        const types = Array.isArray(itemType) ? itemType : (itemType ? [itemType] : []);
        if (itemCat && !types.includes(itemCat)) types.push(itemCat);
        const matchesType = filterTypes.some(t => types.includes(t));
        if (!matchesType) return false;
      }

      // 2. Filter by Subtypes / Disciplines / Society / Aspect / Lineage (Species)
      if (filterSubtypes.length > 0) {
        const sub = item.subtype || item.discipline || item.society || item.aspect || item.aspect_subtype || item.parent_species || item.lineage;
        const subs = Array.isArray(sub) ? sub : (sub ? [sub] : []);
        const matchesSub = filterSubtypes.some(s => subs.some(subItem => String(subItem).toLowerCase().includes(String(s).toLowerCase().split(' ')[0])));
        if (!matchesSub) return false;
      }

      // 3. Filter by Tech Level (TL)
      if (filterTLs.length > 0) {
        const itemTL = item.tl !== undefined ? item.tl : item.tech_level;
        if (itemTL === undefined || itemTL === null) return false;
        const matchesTL = filterTLs.some(tl => Number(tl) === Number(itemTL) || String(tl) === String(itemTL));
        if (!matchesTL) return false;
      }

      // 4. Filter by Meta Level (ML)
      if (filterMLs.length > 0) {
        const itemML = item.ml !== undefined ? item.ml : item.meta_level;
        if (itemML === undefined || itemML === null) return false;
        const matchesML = filterMLs.some(ml => Number(ml) === Number(itemML) || String(ml) === String(itemML));
        if (!matchesML) return false;
      }

      // 5. Filter by Tags / Creator
      if (filterTags.length > 0) {
        const tags = Array.isArray(item.tags)
          ? item.tags
          : (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : []);
        const matchesTag = filterTags.some(tag => tags.includes(tag));
        if (!matchesTag) return false;
      }

      // 6. Search Term (full-text search across multiple fields)
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matches = (
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.title && item.title.toLowerCase().includes(term)) ||
          (item.parent_species && item.parent_species.toLowerCase().includes(term)) ||
          (item.homeworld && item.homeworld.toLowerCase().includes(term)) ||
          (item.stigma && item.stigma.toLowerCase().includes(term)) ||
          (item.description && item.description.toLowerCase().includes(term)) ||
          (item.type && (Array.isArray(item.type) ? item.type.some(t => String(t).toLowerCase().includes(term)) : String(item.type).toLowerCase().includes(term))) ||
          (item.category && String(item.category).toLowerCase().includes(term)) ||
          (item.subtype && String(item.subtype).toLowerCase().includes(term)) ||
          (item.discipline && String(item.discipline).toLowerCase().includes(term)) ||
          (item.society && String(item.society).toLowerCase().includes(term)) ||
          (item.trait && (Array.isArray(item.trait) ? item.trait.some(t => String(t).toLowerCase().includes(term)) : String(item.trait).toLowerCase().includes(term))) ||
          (Array.isArray(item.tags) && item.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(term))) ||
          (typeof item.tags === 'string' && item.tags.toLowerCase().includes(term))
        );
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = getSortableValue(a, sortField);
      let valB = getSortableValue(b, sortField);

      // Handle null/empty sorting to bottom
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      // Handle arrays
      if (Array.isArray(valA)) {
        valA = valA.map(v => typeof v === 'object' ? (v.name || v.id || JSON.stringify(v)) : v).join(', ');
      }
      if (Array.isArray(valB)) {
        valB = valB.map(v => typeof v === 'object' ? (v.name || v.id || JSON.stringify(v)) : v).join(', ');
      }

      // Numeric comparison
      const cleanNum = (v) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const trimmed = v.trim();
          if (trimmed !== '' && !isNaN(Number(trimmed))) return Number(trimmed);
          const stripped = trimmed.replace(/[^0-9.-]+/g, '');
          if (stripped !== '' && !isNaN(Number(stripped))) return Number(stripped);
        }
        return null;
      };

      const numA = cleanNum(valA);
      const numB = cleanNum(valB);

      if (numA !== null && numB !== null) {
        return sortAsc ? numA - numB : numB - numA;
      }

      // String / Alphanumeric comparison
      const strA = String(valA);
      const strB = String(valB);
      const comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
      return sortAsc ? comparison : -comparison;
    });
  }, [currentItems, filterTypes, filterSubtypes, filterTLs, filterMLs, filterTags, searchTerm, sortField, sortAsc]);

  // Entry Management Logic
  const handleOpenItem = (item, edit = isAdmin) => {
    setSelectedItem(item);
    setEditFormData(item ? { ...item } : { name: '', description: '' });
    // In Dev Mode (isAdmin), directly open in Manage mode. Non-admins open in read-only View mode.
    setIsEditMode(isAdmin ? true : false);
    setIsEntryModalOpen(true);
  };

  const handleCreateNew = async () => {
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to create new database entries.');
      return;
    }

    const newName = window.prompt(`Enter a name for the new ${currentConfig?.label || 'Entry'}:`, '');
    if (!newName || !newName.trim()) return;

    setSelectedItem(null);
    const initialData = { name: newName.trim(), description: '' };
    if (currentConfig?.fields) {
      Object.keys(currentConfig.fields).forEach(fKey => {
        const fDef = currentConfig.fields[fKey];
        if (fDef.default !== undefined) {
          initialData[fKey] = fDef.default;
        } else if (fDef.type === 'number') {
          initialData[fKey] = 0;
        } else if (fDef.type === 'boolean') {
          initialData[fKey] = false;
        } else if (fDef.type === 'multiselect' || fDef.type === 'json_list') {
          initialData[fKey] = [];
        }
      });
    }

    const docId = `entry_${Date.now()}`;
    const payload = { ...initialData, name: newName.trim(), id: docId, updatedAt: new Date().toISOString() };

    const success = await saveEntry(payload, currentKey);
    if (success) {
      setSelectedItem(payload);
      setEditFormData(payload);
      setIsEditMode(true);
      setIsEntryModalOpen(true);
    } else {
      alert('Failed to create new entry. Check console or network.');
    }
  };

  const handleDuplicateEntry = async (itemToDuplicate) => {
    const target = itemToDuplicate || selectedItem;
    if (!target) return;
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to duplicate database entries.');
      return;
    }
    const baseName = target.name || target.title || 'Entry';
    const clonedName = `${baseName} (Copy)`;
    const newDocId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const clonedPayload = {
      ...target,
      name: clonedName,
      id: newDocId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const success = await saveEntry(clonedPayload, currentKey);
    if (success) {
      setSelectedItem(clonedPayload);
      setEditFormData(clonedPayload);
      setIsEditMode(true);
      setIsEntryModalOpen(true);
      showToast && showToast(`Duplicated "${baseName}" as "${clonedName}"`, 'success');
    } else {
      alert('Failed to clone entry.');
    }
  };

  const handleSaveEntry = async (closeOnSuccess = false, customPayload = null) => {
    if (!currentUser && !isAdmin) {
      alert('You must be logged in to save entries. Please sign in using the Login button in the header.');
      return;
    }
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to save database entries.');
      return;
    }
    const currentData = customPayload || editFormData;
    if (!currentData.name || !currentData.name.trim()) {
      alert('Entry name is required!');
      return;
    }
    const docId = selectedItem?.id || currentData.id || `entry_${Date.now()}`;
    const payload = { ...currentData, name: currentData.name.trim(), id: docId, updatedAt: new Date().toISOString() };

    const success = await saveEntry(payload, currentKey);
    if (success) {
      if (closeOnSuccess === true) {
        setIsEntryModalOpen(false);
      }
    } else {
      alert('Save failed. You may not have administrative privileges, or a network error occurred. Check browser console for details.');
    }
  };

  const handleDeleteEntry = async (itemToDelete = selectedItem) => {
    const target = itemToDelete || selectedItem;
    if (!target) return;
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to delete database entries.');
      return;
    }
    const entryName = target.name || target.title || 'this entry';
    if (!confirmTypedDeletion(entryName, currentConfig?.label || 'database entry')) return;

    // Close modal & clear selection immediately to prevent any auto-saves
    setIsEntryModalOpen(false);
    setSelectedItem(null);

    const success = await deleteEntry(target.id, currentKey);
    if (!success) {
      alert('Delete failed. Check the browser console for details.');
    }
  };

  // Local JSON Import / Export
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(dbData[currentKey] || [], null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentKey}_database.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to import entries.');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        await importJSON(list, currentKey);
        alert(`Successfully imported ${list.length} entries into ${currentConfig.label || currentKey}!`);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };


  // Bastion Chat Send (Gemini API Integration)
  const handleSendBastion = async () => {
    if (!bastionInput.trim()) return;
    const userPrompt = bastionInput.trim();
    const userMsg = { role: 'user', text: userPrompt };
    setBastionMessages(prev => [...prev, userMsg]);
    setBastionInput('');

    const key = apiKey || getGeminiApiKey();

    if (!key) {
      setTimeout(() => {
        setBastionMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: `🤖 **BASTION TACTICAL AI**: No Gemini API Key configured in Settings (⚙️). Regarding "${userPrompt}", refer to the **Rules Codex** in Omnicortex.`
          }
        ]);
      }, 500);
      return;
    }

    try {
      const response = await sendBastionChatMessage({
        prompt: userPrompt,
        history: bastionMessages,
        contextData: { 
          activeDatabaseCategory: currentKey,
          selectedEntryData: editFormData
        }
      });

      setBastionMessages(prev => [
        ...prev,
        { role: 'model', text: response.text }
      ]);
    } catch (err) {
      console.warn("Bastion API error:", err);
      setBastionMessages(prev => [
        ...prev,
        { role: 'model', text: `🤖 **Bastion Connection Error**: ${err.message}` }
      ]);
    }
  };

  const mainCategories = Object.keys(categoryConfig).filter(
    key => !categoryConfig[key].hideFromMenu && !categoryConfig[key].parent
  );

  // Auth gate — if not authenticated and not in admin/master developer override mode, offer login with option to proceed as Master Developer
  if (!currentUser && !isAdmin) {
    return (
      <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 font-sans items-center justify-center p-4">
        <div className="text-center max-w-md px-8 py-10 bg-slate-900 border border-cyan-900/60 rounded-2xl shadow-2xl space-y-4">
          {/* Logo */}
          <div className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse mb-2">
            <span className="text-[2rem] font-bold leading-none">TANGENT</span>
            <span className="text-[1rem] leading-none">SCIENCE FANTASY ROLEPLAY</span>
            <span className="text-[1.5rem] font-bold leading-none">OMNICORTEX</span>
          </div>
          <p className="text-slate-400 text-sm">
            Sign in to sync database changes to the cloud, or proceed with Key Developer Master Access.
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full px-6 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg text-sm uppercase tracking-wider transition-colors shadow-lg shadow-cyan-900/40 cursor-pointer"
          >
            🔐 Sign In with Google
          </button>
          <button
            onClick={() => {
              if (toggleAdminOverride) toggleAdminOverride();
            }}
            className="w-full px-4 py-2.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 text-amber-300 font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            👑 Proceed with Key Developer Master Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 font-sans overflow-hidden">
      {/* Omnicortex DBM System Header Bar */}
      <DBMHeader
        historyIndex={historyIndex}
        historyLength={history ? history.length : 0}
        handleBack={handleBack}
        handleForward={handleForward}
        isBastionOpen={isBastionOpen}
        setIsBastionOpen={setIsBastionOpen}
        handleExportMasterJSON={handleExportMasterJSON}
        handleImportMasterJSON={handleImportMasterJSON}
        syncMasterSpeciesMatrix={syncMasterSpeciesMatrix}
        syncCanonicalCompendium={syncCanonicalCompendium}
        syncCanonicalFactions={syncCanonicalFactions}
        navigateToCategory={navigateToCategory}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        onOpenArchitectModal={() => setIsArchitectModalOpen && setIsArchitectModalOpen(true)}
      />

      {/* Main App Layout with Standardized Omnicortex Navigation Rail */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Standardized Omnicortex Navigation Rail (Replaces legacy DBMSidebar drawer) */}
        <OmnicortexNavRail
          activeSectionKey={activeCategory || currentKey}
          onSelectSection={(sectionKey) => {
            navigateToCategory(sectionKey, null);
          }}
          dbData={dbData}
          isAdmin={isAdmin}
          onOpenDevFields={() => setIsArchitectModalOpen && setIsArchitectModalOpen(true)}
          onOpenUserGuide={() => navigateToCategory('user_guide', null)}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen && setIsSidebarOpen(false)}
        />

        {/* Right Main Content Panel */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0 p-3 sm:p-4 pb-4 sm:pb-5">

          {/* Subcategory Pills Bar (Handles both Canonical Parent Categories AND Developer Field Groups) */}
          {(() => {
            const activeKey = currentKey || activeCategory;

            // Developer fields use dedicated docked vertical navigation rail — suppress horizontal pills
            if (isDevelopmentField(activeKey)) {
              return null;
            }

            // Species studio does not show subcategory pills (types, sizes, movements, traits, disadvantages are managed in entry and dev fields)
            if (activeKey === 'species' || activeCategory === 'species') {
              return null;
            }

            // Find parent key if currently on a child item
            let parentKey = null;
            let pConfig = null;

            if (categoryConfig[activeCategory]?.isParent || categoryConfig[activeCategory]?.subItems || categoryConfig[activeCategory]?.subcategories) {
              parentKey = activeCategory;
              pConfig = categoryConfig[activeCategory];
            } else if (categoryConfig[activeCategory]?.parent) {
              parentKey = categoryConfig[activeCategory].parent;
              pConfig = categoryConfig[parentKey];
            } else if (categoryConfig[currentKey]?.parent) {
              parentKey = categoryConfig[currentKey].parent;
              pConfig = categoryConfig[parentKey];
            }

            if (!pConfig || parentKey === 'species') return null;

            // Determine child keys list
            let pillKeys = [];
            if (pConfig.subItems && Array.isArray(pConfig.subItems)) {
              pillKeys = pConfig.subItems;
            } else if (pConfig.subcategories) {
              pillKeys = Object.keys(pConfig.subcategories);
            }

            if (!pillKeys.length) return null;

            const isOverviewActive = (activeCategory === parentKey && !activeSubcategory) || currentKey === parentKey;

            return (
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 border-b border-slate-800/80 pb-2.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
                {/* Parent Overview Tab (if parent has landing view or separate overview) */}
                {pConfig.isParent && (
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      navigateToCategory(parentKey, null);
                    }}
                    className={`px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isOverviewActive
                        ? 'bg-amber-500/20 border border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>Overview</span>
                  </button>
                )}

                {/* Subcategory / Sub-item Pills */}
                {pillKeys.map(subKey => {
                  const subCfg = categoryConfig[subKey] || pConfig.subcategories?.[subKey] || {};
                  const isPillActive = activeCategory === subKey || activeSubcategory === subKey || currentKey === subKey;
                  const count = Array.isArray(dbData[subKey]) ? dbData[subKey].length : null;

                  return (
                    <button
                      key={subKey}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1150, 0.02);
                        if (pConfig.subcategories?.[subKey]) {
                          navigateToCategory(parentKey, subKey);
                        } else {
                          navigateToCategory(subKey, null);
                        }
                      }}
                      className={`px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isPillActive
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                          : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{subCfg.label || subKey}</span>
                      {count !== null && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isPillActive ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* VIEW TYPE: PARENT LANDING PAGE */}
          {(currentConfig.viewType === 'landing' || (currentConfig.isParent && !currentConfig.viewType)) && (
            <DBMLandingView
              parentKey={activeCategory}
              onNavigateToSubItem={navigateToCategory}
            />
          )}

          {/* VIEW TYPE: WIKI */}
          {currentConfig.viewType === 'wiki' && (
            <DBMWikiView
              currentConfig={currentConfig}
              handleCreateNew={handleCreateNew}
              currentItems={currentItems}
              handleOpenItem={handleOpenItem}
              isAdmin={isAdmin}
              handleDeleteEntry={handleDeleteEntry}
              handleDuplicateEntry={handleDuplicateEntry}
            />
          )}

          {/* VIEW TYPE: USER GUIDE */}
          {!currentConfig.isParent && currentConfig.viewType === 'guide' && (
            <DBMGuideView />
          )}

          {/* VIEW TYPE: TABLE DIRECTORY (Default for Species, Factions, Skills, Equipment) */}
          {!currentConfig.isParent && (currentConfig.viewType === 'table' || !currentConfig.viewType) && (
            <DBMTableView
              currentConfig={currentConfig}
              currentKey={currentKey}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleImportJSON={handleImportJSON}
              handleExportJSON={handleExportJSON}
              handleCreateNew={handleCreateNew}
              sortField={sortField}
              setSortField={setSortField}
              sortAsc={sortAsc}
              setSortAsc={setSortAsc}
              filteredItems={filteredItems}
              handleOpenItem={handleOpenItem}
              filterTypes={filterTypes}
              setFilterTypes={setFilterTypes}
              filterSubtypes={filterSubtypes}
              setFilterSubtypes={setFilterSubtypes}
              filterTLs={filterTLs}
              setFilterTLs={setFilterTLs}
              filterMLs={filterMLs}
              setFilterMLs={setFilterMLs}
              filterTags={filterTags}
              setFilterTags={setFilterTags}
              currentItems={currentItems}
              isAdmin={isAdmin}
              handleDeleteEntry={handleDeleteEntry}
              handleDuplicateEntry={handleDuplicateEntry}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <DBMItemModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        selectedItem={selectedItem}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        currentConfig={currentConfig}
        currentKey={currentKey}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        onDuplicate={handleDuplicateEntry}
        dbData={dbData}
        saveEntry={saveEntry}
        devMode={true}
        isAdmin={isAdmin}
      />


      <BastionChatModal
        isOpen={isBastionOpen}
        onClose={() => setIsBastionOpen(false)}
        messages={bastionMessages}
        input={bastionInput}
        setInput={setBastionInput}
        onSend={handleSendBastion}
        currentKey={currentKey}
        currentConfig={currentConfig}
        selectedItem={selectedItem}
        isEntryModalOpen={isEntryModalOpen}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleCreateNew={handleCreateNew}
      />

      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ArchitectDevFieldsModal
        isOpen={isArchitectModalOpen}
        onClose={() => setIsArchitectModalOpen(false)}
        dbData={dbData}
        saveEntry={saveEntry}
        deleteEntry={deleteEntry}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />

      {/* Global DBM Notifications */}
      <Toast toast={toastMessage} onClose={clearToast} />
    </div>
  );
};

export default DBMContainer;
