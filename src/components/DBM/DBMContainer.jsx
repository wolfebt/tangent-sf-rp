import React, { useState, useEffect } from 'react';
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

import { useDBMHistory } from './hooks/useDBMHistory';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { fetchGeminiContent, getGeminiApiKey, sendBastionChatMessage } from '../../services/bastionService';
import { attachCreatorTag } from '../../utils/creatorUtils';

const EMPTY_CONFIG = {};

export const DBMContainer = () => {
  const { currentUser, userHandle, loginWithGoogle, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const {
    activeCategory, setActiveCategory,
    activeSubcategory, setActiveSubcategory,
    history, historyIndex,
    navigateToCategory, handleBack, handleForward
  } = useDBMHistory('rules_codex', () => setSearchTerm(''));

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

  const [filterTL, setFilterTL] = useState('ALL');
  const [filterML, setFilterML] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Currently active configuration
  const currentKey = activeSubcategory || activeCategory;

  // Reset filters when switching active category or subcategory
  useEffect(() => {
    setFilterTL('ALL');
    setFilterML('ALL');
    setFilterType('ALL');
  }, [currentKey]);

  const parentConfig = categoryConfig[activeCategory];
  const currentConfig = (activeSubcategory && parentConfig?.subcategories?.[activeSubcategory])
    || categoryConfig[currentKey]
    || EMPTY_CONFIG;

  const { dbData, saveEntry, deleteEntry, importJSON } = useFirestoreSync(currentKey, currentUser);
  const currentItems = dbData[currentKey] || [];

  // Filter & Sort Items
  const filteredItems = currentItems.filter(item => {
    if (filterTL !== 'ALL' && Number(item.tl) !== Number(filterTL)) return false;
    if (filterML !== 'ALL' && Number(item.ml) !== Number(filterML)) return false;
    if (filterType !== 'ALL' && item.type !== filterType && item.category !== filterType) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.type && item.type.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (Array.isArray(item.tags) && item.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(term))) ||
      (typeof item.tags === 'string' && item.tags.toLowerCase().includes(term))
    );
  }).sort((a, b) => {
    const valA = (a[sortField] || '').toString().toLowerCase();
    const valB = (b[sortField] || '').toString().toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Entry Management Logic
  const handleOpenItem = (item, edit = false) => {
    setSelectedItem(item);
    setEditFormData(item ? { ...item } : { name: '', description: '' });
    // Non-admins can only view (read-only mode)
    setIsEditMode(isAdmin ? edit : false);
    setIsEntryModalOpen(true);
  };

  const handleCreateNew = () => {
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to create new database entries.');
      return;
    }
    setSelectedItem(null);
    const initialData = { name: '', description: '' };
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
    setEditFormData(initialData);
    setIsEditMode(true);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async () => {
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
    const taggedData = attachCreatorTag(editFormData, userHandle, currentUser);
    const payload = { ...taggedData, name: taggedData.name.trim(), id: docId, updatedAt: new Date().toISOString() };

    const success = await saveEntry(payload, currentKey);
    if (success) {
      setIsEntryModalOpen(false);
    } else {
      alert('Save failed. You may not have administrative privileges, or a network error occurred. Check browser console for details.');
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedItem) return;
    if (!currentUser) {
      alert('You must be logged in to delete entries. Please sign in using the Login button in the header.');
      return;
    }
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to delete database entries.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) return;

    const success = await deleteEntry(selectedItem.id, currentKey);
    if (success) {
      setIsEntryModalOpen(false);
    } else {
      alert('Delete failed. You may not have permission or a network error occurred. Check the browser console for details.');
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
            masterCollections[colKey] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  const devCategories = Object.keys(categoryConfig).filter(
    key => categoryConfig[key].hideFromMenu && !categoryConfig[key].hideFromDevMenu
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
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <DBMSidebar
          mainCategories={mainCategories}
          devCategories={devCategories}
          activeCategory={activeCategory}
          currentKey={currentKey}
          navigateToCategory={navigateToCategory}
          onOpenBastion={() => setIsBastionOpen(true)}
        />

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
              <div className="flex gap-2 mb-4 border-b border-slate-800 pb-3 overflow-x-auto shrink-0">
                <button
                  onClick={() => navigateToCategory(parentKeyForNav, null)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all shrink-0 ${
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
                      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all shrink-0 ${
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
          {(currentConfig.isParent || currentConfig.viewType === 'landing') && (
            <DBMLandingView
              parentKey={activeCategory}
              onNavigateToSubItem={(subKey) => navigateToCategory(subKey)}
            />
          )}

          {/* VIEW TYPE: WIKI (Rules Codex) */}
          {!currentConfig.isParent && currentConfig.viewType === 'wiki' && (
            <DBMWikiView
              currentConfig={currentConfig}
              handleCreateNew={handleCreateNew}
              currentItems={currentItems}
              handleOpenItem={handleOpenItem}
              isAdmin={isAdmin}
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
              filterTL={filterTL}
              setFilterTL={setFilterTL}
              filterML={filterML}
              setFilterML={setFilterML}
              filterType={filterType}
              setFilterType={setFilterType}
              currentItems={currentItems}
              isAdmin={isAdmin}
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
    </div>
  );
};

export default DBMContainer;
