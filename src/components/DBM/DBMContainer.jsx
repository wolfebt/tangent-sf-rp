import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryConfig } from './categoryConfig';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

// Extracted Components
import { DBMHeader } from './DBMHeader';
import { DBMSidebar } from './DBMSidebar';
import { DBMWikiView } from './DBMWikiView';
import { DBMGuideView } from './DBMGuideView';
import { DBMTableView } from './DBMTableView';
import { DBMLandingView } from './DBMLandingView';
import { BastionChatModal } from './BastionChatModal';
import { DBMItemModal } from './DBMItemModal';
import { ArchitectDevFieldsModal } from './ArchitectDevFieldsModal';
import { UserSettingsModal } from '../UserSettingsModal';
import { Toast } from '../UI/Toast';

import { useDBMHistory } from './hooks/useDBMHistory';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { fetchGeminiContent, getGeminiApiKey, sendBastionChatMessage } from '../../services/bastionService';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';

const EMPTY_CONFIG = {};

export const DBMContainer = () => {
  const { currentUser, userHandle, loginWithGoogle, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchitectModalOpen, setIsArchitectModalOpen] = useState(false);

  const {
    activeCategory, setActiveCategory,
    activeSubcategory, setActiveSubcategory,
    history, historyIndex,
    navigateToCategory, handleBack, handleForward
  } = useDBMHistory('compendium', () => setSearchTerm(''));

  // Auto-navigate to user guide if ?guide=1 is in URL
  useEffect(() => {
    if (searchParams.get('guide') === '1') {
      navigateToCategory('user_guide');
    }
  }, [searchParams]);

  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Bastion Modal States
  const [isBastionOpen, setIsBastionOpen] = useState(false);
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
  const currentConfig = (activeSubcategory && parentConfig?.subcategories?.[activeSubcategory])
    || categoryConfig[currentKey]
    || EMPTY_CONFIG;

  const { dbData, saveEntry, deleteEntry, importJSON, toastMessage, clearToast, showToast } = useFirestoreSync(currentKey, currentUser);
  const currentItems = dbData[currentKey] || [];

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

      // 2. Filter by Subtypes / Disciplines / Society / Aspect
      if (filterSubtypes.length > 0) {
        const sub = item.subtype || item.discipline || item.society || item.aspect || item.aspect_subtype;
        const subs = Array.isArray(sub) ? sub : (sub ? [sub] : []);
        const matchesSub = filterSubtypes.some(s => subs.includes(s));
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
  const handleOpenItem = (item, edit = false) => {
    setSelectedItem(item);
    setEditFormData(item ? { ...item } : { name: '', description: '' });
    // Non-admins can only view (read-only mode)
    setIsEditMode(isAdmin ? edit : false);
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

  const handleSaveEntry = async (closeOnSuccess = false) => {
    if (!currentUser) {
      alert('You must be logged in to save entries. Please sign in using the Login button in the header.');
      return;
    }
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to save database entries.');
      return;
    }
    if (!editFormData.name || !editFormData.name.trim()) {
      alert('Entry name is required!');
      return;
    }
    const docId = selectedItem?.id || editFormData.id || `entry_${Date.now()}`;
    const payload = { ...editFormData, name: editFormData.name.trim(), id: docId, updatedAt: new Date().toISOString() };

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


  // Master Database Backup Export & Restore Import
  const handleExportMasterJSON = async () => {
    try {
      const allKeys = Object.keys(categoryConfig).filter(
        k => !categoryConfig[k].isParent && categoryConfig[k].viewType !== 'guide'
      );
      const masterCollections = {};
      
      for (const colKey of allKeys) {
        if (dbData[colKey] && dbData[colKey].length > 0) {
          masterCollections[colKey] = dbData[colKey];
        } else {
          try {
            const snap = await getDocs(collection(db, colKey));
            masterCollections[colKey] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          } catch (e) {
            masterCollections[colKey] = [];
          }
        }
      }

      const backup = {
        type: "OmnicortexMasterDatabase",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        collections: masterCollections
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnicortex_universe_master_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Master Export error:", err);
      alert("Failed to export Master Database: " + err.message);
    }
  };

  const handleImportMasterJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const collections = parsed.collections || (parsed.type === "OmnicortexMasterDatabase" ? parsed : null);
        if (!collections) {
          alert("Invalid master database format. Expected 'collections' map.");
          return;
        }
        let totalCount = 0;
        for (const [colKey, items] of Object.entries(collections)) {
          if (Array.isArray(items) && items.length > 0) {
            await importJSON(items, colKey);
            totalCount += items.length;
          }
        }
        alert(`Successfully imported Master Backup (${totalCount} entries across ${Object.keys(collections).length} collections)!`);
      } catch (err) {
        console.error("Master Import error:", err);
        alert("Invalid Master JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  // Auth gate — show login screen if user is not authenticated
  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#0d1117] text-slate-100 font-sans items-center justify-center">
        <div className="text-center max-w-md px-8 py-10 bg-slate-900 border border-cyan-900/60 rounded-2xl shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse mb-6">
            <span className="text-[2rem] font-bold leading-none">TANGENT</span>
            <span className="text-[1rem] leading-none">SCIENCE FANTASY ROLEPLAY</span>
            <span className="text-[1.5rem] font-bold leading-none">OMNICORTEX</span>
          </div>
          <p className="text-slate-400 text-sm mb-2">
            The OmniCortex Database Manager requires authentication.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            Sign in to create, edit, and save RPG database entries to the shared universe.
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full px-6 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg text-sm uppercase tracking-wider transition-colors shadow-lg shadow-cyan-900/40"
          >
            🔐 Sign In with Google
          </button>
          <p className="text-slate-600 text-[11px] mt-4">
            Read access is public. Write access requires authentication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1117] text-slate-100 font-sans overflow-hidden">
      {/* Top Header */}
      <DBMHeader
        historyIndex={historyIndex}
        historyLength={history.length}
        handleBack={handleBack}
        handleForward={handleForward}
        setIsBastionOpen={setIsBastionOpen}
        handleExportMasterJSON={handleExportMasterJSON}
        handleImportMasterJSON={handleImportMasterJSON}
        navigateToCategory={navigateToCategory}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        onOpenArchitectModal={() => setIsArchitectModalOpen(true)}
      />

      {/* Mobile Sidebar Overlay Toggle */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Navigation */}
        <div className={`fixed md:relative z-40 h-full transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <DBMSidebar
            mainCategories={mainCategories}
            activeCategory={activeCategory}
            currentKey={currentKey}
            navigateToCategory={(catKey, subKey) => {
              navigateToCategory(catKey, subKey);
              setIsSidebarOpen(false);
            }}
            onOpenBastion={() => {
              setIsBastionOpen(true);
              setIsSidebarOpen(false);
            }}
          />
        </div>

        {/* Right Main Content Panel */}
        <main className="flex-1 bg-[#0d1117] flex flex-col overflow-hidden relative p-6">

          {/* Subcategory Pills Bar (if available and not parent landing) */}
          {(() => {
            const catForPills = categoryConfig[activeCategory]?.subcategories ? categoryConfig[activeCategory] : (categoryConfig[currentKey]?.subcategories ? categoryConfig[currentKey] : null);
            if (!catForPills?.subcategories || catForPills.hideSubcategoryNav) return null;
            // Hide tabs for Property sub-items (Gear, Weaponry, Armoring, Mecha, Other)
            if (catForPills.parent === 'personal_property') return null;
            const parentKeyForNav = catForPills === categoryConfig[activeCategory] ? activeCategory : currentKey;

            return (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 border-b border-slate-800 pb-2 shrink-0">
                <button
                  onClick={() => navigateToCategory(parentKeyForNav, null)}
                  className={`px-2.5 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider rounded transition-all shrink-0 whitespace-nowrap ${
                    !activeSubcategory || activeSubcategory === parentKeyForNav
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                {Object.keys(catForPills.subcategories).map(subKey => {
                  const subConfig = catForPills.subcategories[subKey];
                  const isSubActive = activeSubcategory === subKey;
                  return (
                    <button
                      key={subKey}
                      onClick={() => navigateToCategory(parentKeyForNav, subKey)}
                      className={`px-2.5 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider rounded transition-all shrink-0 whitespace-nowrap ${
                        isSubActive
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {subConfig.label}
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
