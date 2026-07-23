import React, { useState, useEffect } from 'react';
import { categoryConfig } from './categoryConfig';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

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
import { fetchGeminiContent } from '../../services/bastionService';

const EMPTY_CONFIG = {};

export const DBMContainer = () => {
  const [devMode, setDevMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    activeCategory, setActiveCategory,
    activeSubcategory, setActiveSubcategory,
    history, historyIndex,
    navigateToCategory, handleBack, handleForward
  } = useDBMHistory('rules_codex', () => setSearchTerm(''));

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

  // Currently active configuration
  const currentKey = activeSubcategory || activeCategory;
  const parentConfig = categoryConfig[activeCategory];
  const currentConfig = (activeSubcategory && parentConfig?.subcategories?.[activeSubcategory])
    || categoryConfig[currentKey]
    || EMPTY_CONFIG;

  const { dbData, saveEntry, deleteEntry, importJSON } = useFirestoreSync(currentKey);
  const currentItems = dbData[currentKey] || [];

  // Filter & Sort Items
  const filteredItems = currentItems.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.type && item.type.toLowerCase().includes(term))
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
    setIsEditMode(edit);
    setIsEntryModalOpen(true);
  };

  const handleCreateNew = () => {
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
    if (!editFormData.name || !editFormData.name.trim()) {
      alert('Entry name is required!');
      return;
    }
    const docId = selectedItem?.id || editFormData.id || `entry_${Date.now()}`;
    const payload = { ...editFormData, name: editFormData.name.trim(), id: docId, updatedAt: new Date().toISOString() };
    
    await saveEntry(payload, currentKey);
    setIsEntryModalOpen(false);
  };

  const handleDeleteEntry = async () => {
    if (!selectedItem) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) return;

    await deleteEntry(selectedItem.id, currentKey);
    setIsEntryModalOpen(false);
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

    const key = apiKey || localStorage.getItem('geminiApiKey') || import.meta.env.VITE_GEMINI_API_KEY;

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
      const data = await fetchGeminiContent(key, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `You are Bastion, a tactical AI assistant for the Tangent Science Fantasy Roleplaying Game (SFF RPG). Always address the user as "ARCHITECT" (the Game Master / referee / universe creator). Answer concisely, in character, with clear game mechanics and database management guidance based on the following user prompt: ${userPrompt}` }]
          }
        ]
      });

      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to parse response from Bastion AI.";

      setBastionMessages(prev => [
        ...prev,
        { role: 'model', text: replyText }
      ]);
    } catch (err) {
      console.warn("Bastion Gemini API error:", err);
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
    key => categoryConfig[key].hideFromMenu
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1117] text-slate-100 font-sans overflow-hidden">
      {/* Top Header */}
      <DBMHeader
        historyIndex={historyIndex}
        historyLength={history.length}
        handleBack={handleBack}
        handleForward={handleForward}
        devMode={devMode}
        setDevMode={setDevMode}
        setIsBastionOpen={setIsBastionOpen}
        handleExportMasterJSON={handleExportMasterJSON}
        handleImportMasterJSON={handleImportMasterJSON}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <DBMSidebar
          mainCategories={mainCategories}
          devCategories={devCategories}
          devMode={devMode}
          activeCategory={activeCategory}
          currentKey={currentKey}
          navigateToCategory={navigateToCategory}
          onOpenBastion={() => setIsBastionOpen(true)}
        />

        {/* Right Main Content Panel */}
        <main className="flex-1 bg-[#0d1117] flex flex-col overflow-hidden relative p-6">
          {/* Subcategory Pills Bar (if available and not parent landing) */}
          {categoryConfig[activeCategory]?.subcategories && (
            <div className="flex gap-2 mb-4 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveSubcategory(null)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  !activeSubcategory
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              {Object.keys(categoryConfig[activeCategory].subcategories).map(subKey => {
                const subConfig = categoryConfig[activeCategory].subcategories[subKey];
                const isSubActive = activeSubcategory === subKey;
                return (
                  <button
                    key={subKey}
                    onClick={() => setActiveSubcategory(subKey)}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
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
          )}

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
              devMode={devMode}
              handleCreateNew={handleCreateNew}
              currentItems={currentItems}
              handleOpenItem={handleOpenItem}
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
              devMode={devMode}
              sortField={sortField}
              setSortField={setSortField}
              sortAsc={sortAsc}
              setSortAsc={setSortAsc}
              filteredItems={filteredItems}
              handleOpenItem={handleOpenItem}
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
