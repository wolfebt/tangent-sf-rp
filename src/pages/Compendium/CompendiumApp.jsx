import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryConfig } from '../../components/DBM/categoryConfig';
import { useAuth } from '../../context/AuthContext';
import { useDBM } from '../../context/DBMContext';
import { useFirestoreSync } from '../../components/DBM/hooks/useFirestoreSync';
import { DBMWikiView } from '../../components/DBM/DBMWikiView';
import { OmnicortexCatalogView } from './OmnicortexCatalogView';
import { DBMItemModal, DBMItemTransferBar } from '../../components/DBM/DBMItemModal';
import { BastionChatModal } from '../../components/DBM/BastionChatModal';
import { Toast } from '../../components/UI/Toast';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';
import { sendBastionChatMessage, getGeminiApiKey } from '../../services/bastionService';
import { AudioService } from '../../services/audioService';
import {
  BookOpen,
  Database,
  Columns2,
  Sparkles,
  Bot,
  RefreshCw,
  Search,
  Layers,
  HelpCircle
} from 'lucide-react';

export const CompendiumApp = () => {
  const { currentUser, isAdmin } = useAuth();
  const dbm = useDBM() || {};
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Compendium Module Mode: 'rules' | 'omnicortex' | 'split'
  const initialMode = searchParams.get('tab') === 'omnicortex' || searchParams.get('module') === 'omnicortex'
    ? 'omnicortex'
    : (searchParams.get('tab') === 'split' || searchParams.get('module') === 'split' ? 'split' : 'rules');

  const [compendiumMode, setCompendiumMode] = useState(initialMode);

  // Sync mode with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('module');
    if (tabParam === 'omnicortex' || tabParam === 'rules' || tabParam === 'split') {
      setCompendiumMode(tabParam);
    }
  }, [searchParams]);

  const handleSwitchMode = (mode) => {
    AudioService.playTerminalBeep(1150, 0.02);
    setCompendiumMode(mode);
    setSearchParams({ tab: mode });
  };

  const currentRulesKey = 'compendium';
  const rulesConfig = categoryConfig[currentRulesKey] || {
    label: 'COMPENDIUM',
    viewType: 'wiki',
    fields: {
      name: { type: 'text', required: true },
      entry_type: {
        type: 'select',
        label: 'Entry Type',
        options: ['General Lore', 'Core Rule', 'Game Mechanic', 'System Guide', 'Worldbuilding', 'Primary Faction', 'Generic Template'],
        default: 'General Lore'
      },
      description: { type: 'textarea', aiEnabled: true, label: 'Description / Overview' },
      mechanic: { type: 'textarea', label: 'Mechanics (BASTION Rules)' },
      guide: { type: 'textarea', label: 'Gameplay Instructions' },
      note: { type: 'textarea', label: 'Designer / Architect Notes' },
      parent: { type: 'text', label: 'Parent Article / Section Folder' },
      perspective: { type: 'select', label: 'Perspective', options: ['both', 'operator', 'architect'], default: 'both' },
      order: { type: 'number', label: 'Display Order', default: 0 }
    }
  };

  // Firestore sync for compendium wiki rules
  const { dbData: firestoreDbData, saveEntry, deleteEntry, toastMessage, clearToast } = useFirestoreSync(currentRulesKey, currentUser);

  // Consolidate full dbData from DBMContext (with all reference collections & seed fallbacks)
  const fullDbData = dbm.dbData || firestoreDbData || {};
  const currentRulesItems = fullDbData[currentRulesKey] || [];

  // Item Inspection / Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeItemCategoryKey, setActiveItemCategoryKey] = useState(currentRulesKey);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Bastion AI Chat Modal State
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [bastionMessages, setBastionMessages] = useState([
    { role: 'model', text: 'Bastion Lore & Omnicortex Catalog Engine initialized. Greetings! How may I assist with game rules, canonical mechanics, species profiles, equipment, or lore today?' }
  ]);
  const [bastionInput, setBastionInput] = useState('');
  const [apiKey] = useState(localStorage.getItem('geminiApiKey') || '');

  // Handle open item for viewing / inspecting
  const handleOpenItem = (item, catKey = currentRulesKey, edit = false) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setSelectedItem(item);
    setActiveItemCategoryKey(catKey);
    setEditFormData(item ? { ...item } : { name: '', description: '' });
    setIsEditMode(isAdmin && edit ? true : false);
    setIsEntryModalOpen(true);
  };

  // Handle create new compendium article (for rules)
  const handleCreateNew = async () => {
    if (!isAdmin) {
      alert('Administrator or GM privileges are required to create new compendium articles.');
      return;
    }

    const newName = window.prompt('Enter title for the new Compendium article:', '');
    if (!newName || !newName.trim()) return;

    AudioService.playTerminalBeep(1200, 0.03);
    const initialData = {
      name: newName.trim(),
      entry_type: 'General Lore',
      description: '',
      mechanic: '',
      guide: '',
      note: '',
      perspective: 'both',
      parent: '',
      order: 0
    };

    const docId = `compendium_${Date.now()}`;
    const payload = { ...initialData, id: docId, updatedAt: new Date().toISOString() };

    const success = await saveEntry(payload, currentRulesKey);
    if (success) {
      setSelectedItem(payload);
      setActiveItemCategoryKey(currentRulesKey);
      setEditFormData(payload);
      setIsEditMode(true);
      setIsEntryModalOpen(true);
    } else {
      alert('Failed to create new article. Check console or network.');
    }
  };

  // Handle save entry
  const handleSaveEntry = async (closeOnSuccess = false, customPayload = null) => {
    if (!currentUser) {
      alert('You must be signed in to save entries.');
      return;
    }
    if (!isAdmin) {
      alert('Administrator privileges are required to save canonical database entries.');
      return;
    }

    const currentData = customPayload || editFormData;
    if (!currentData.name || !currentData.name.trim()) {
      alert('Article / Item name is required!');
      return;
    }

    const targetKey = activeItemCategoryKey || currentRulesKey;
    const docId = selectedItem?.id || currentData.id || `${targetKey}_${Date.now()}`;
    const payload = { ...currentData, name: currentData.name.trim(), id: docId, updatedAt: new Date().toISOString() };

    const saver = dbm.saveEntry || saveEntry;
    const success = await saver(payload, targetKey);
    if (success && closeOnSuccess) {
      setIsEntryModalOpen(false);
    }
  };

  // Handle delete entry
  const handleDeleteEntry = async (itemToDelete = selectedItem) => {
    const target = itemToDelete || selectedItem;
    if (!target) return;
    if (!isAdmin) {
      alert('Administrator privileges are required to delete entries.');
      return;
    }

    const entryName = target.name || target.title || 'this entry';
    const targetKey = activeItemCategoryKey || currentRulesKey;
    if (!confirmTypedDeletion(entryName, `${targetKey} entry`)) return;

    setIsEntryModalOpen(false);
    setSelectedItem(null);

    const deleter = dbm.deleteEntry || deleteEntry;
    const success = await deleter(target.id, targetKey);
    if (!success) {
      alert('Delete failed. Check browser console for details.');
    }
  };

  // Send message to Bastion AI
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
            text: `🤖 **BASTION LORE ASSISTANT**: No Gemini API Key configured in User Settings (⚙️). Regarding "${userPrompt}", you can browse the full articles in the Game Rules and the Omnicortex Catalog.`
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
          activeDatabaseCategory: activeItemCategoryKey || 'compendium',
          selectedEntryData: editFormData
        }
      });

      setBastionMessages(prev => [
        ...prev,
        { role: 'model', text: response.text }
      ]);
    } catch (err) {
      console.warn('Bastion API error:', err);
      setBastionMessages(prev => [
        ...prev,
        { role: 'model', text: `🤖 **Bastion Error**: ${err.message}` }
      ]);
    }
  };

  // Config for current active item in modal
  const activeItemConfig = categoryConfig[activeItemCategoryKey] || rulesConfig;

  // Calculate total counts for badge counters
  const totalRulesCount = currentRulesItems.length;
  const totalOmnicortexCount = Object.keys(fullDbData).reduce((acc, k) => {
    return k !== 'compendium' && Array.isArray(fullDbData[k]) ? acc + fullDbData[k].length : acc;
  }, 0);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Compendium Navigation & Module Switcher Bar */}
      <div className="px-3 sm:px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <BookOpen size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
                COMPENDIUM ARCHIVE
              </h1>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold hidden xs:inline">
                OFFICIAL CODEX
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Unified rules wiki and complete Omnicortex game asset catalog.
            </p>
          </div>
        </div>

        {/* Center: Module Mode Switcher Pills */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 font-mono text-[11px] shadow-inner">
          {/* 1. Game Rules & Lore */}
          <button
            type="button"
            onClick={() => handleSwitchMode('rules')}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              compendiumMode === 'rules'
                ? 'bg-sky-950 text-sky-200 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/50'
            }`}
            title="Browse Canonical Game Rules, Lore, Mechanics & Factions"
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">GAME RULES</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-sky-900/80 rounded font-mono text-sky-300">
              {totalRulesCount}
            </span>
          </button>

          {/* 2. Omnicortex Asset Catalog */}
          <button
            type="button"
            onClick={() => handleSwitchMode('omnicortex')}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              compendiumMode === 'omnicortex'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
            }`}
            title="Browse viewable read-only catalog of all game assets in the Omnicortex"
          >
            <Database size={13} />
            <span className="hidden sm:inline">OMNICORTEX</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-900/80 rounded font-mono text-emerald-300">
              {totalOmnicortexCount}
            </span>
          </button>

          {/* 3. Split Reference View (Desktop) */}
          <button
            type="button"
            onClick={() => handleSwitchMode('split')}
            className={`hidden md:flex px-3 py-1.5 rounded-lg font-bold uppercase transition-all items-center gap-1.5 cursor-pointer ${
              compendiumMode === 'split'
                ? 'bg-purple-950 text-purple-200 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
            title="Side-by-side split screen to reference Game Rules and Omnicortex Assets simultaneously"
          >
            <Columns2 size={13} />
            <span>SPLIT VIEW</span>
          </button>
        </div>

        {/* Right: Bastion AI & Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              setIsBastionOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Open Bastion AI Rules & Lore Assistant"
          >
            <Bot size={14} className="text-sky-400" />
            <span className="hidden md:inline">BASTION AI</span>
          </button>
        </div>
      </div>

      {/* Main Compendium Workspace Workspace (Dynamic Modes) */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-3 pb-3 sm:pb-4 gap-3">
        {/* MODE 1: GAME RULES WIKI ONLY */}
        {compendiumMode === 'rules' && (
          <div className="flex-1 flex overflow-hidden">
            <DBMWikiView
              currentConfig={rulesConfig}
              handleCreateNew={handleCreateNew}
              currentItems={currentRulesItems}
              handleOpenItem={(item, edit) => handleOpenItem(item, 'compendium', edit)}
              isAdmin={isAdmin}
              handleDeleteEntry={handleDeleteEntry}
            />
          </div>
        )}

        {/* MODE 2: OMNICORTEX ASSET CATALOG ONLY */}
        {compendiumMode === 'omnicortex' && (
          <div className="flex-1 flex overflow-hidden">
            <OmnicortexCatalogView
              dbData={fullDbData}
              onOpenItem={(item, catKey) => handleOpenItem(item, catKey, false)}
              onOpenWikiArticle={(articleName) => {
                handleSwitchMode('rules');
              }}
            />
          </div>
        )}

        {/* MODE 3: SPLIT SIDE-BY-SIDE REFERENCE VIEW */}
        {compendiumMode === 'split' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-3">
            {/* Left Column: Game Rules Wiki */}
            <div className="flex-1 flex overflow-hidden min-w-0 border-r border-slate-800/80 pr-1">
              <DBMWikiView
                currentConfig={rulesConfig}
                handleCreateNew={handleCreateNew}
                currentItems={currentRulesItems}
                handleOpenItem={(item, edit) => handleOpenItem(item, 'compendium', edit)}
                isAdmin={isAdmin}
                handleDeleteEntry={handleDeleteEntry}
              />
            </div>

            {/* Right Column: Omnicortex Asset Catalog */}
            <div className="flex-1 flex overflow-hidden min-w-0 pl-1">
              <OmnicortexCatalogView
                dbData={fullDbData}
                onOpenItem={(item, catKey) => handleOpenItem(item, catKey, false)}
                onOpenWikiArticle={(articleName) => {
                  handleSwitchMode('rules');
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Complete Item Detail / Read-Only Dossier Modal */}
      <DBMItemModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        selectedItem={selectedItem}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        currentConfig={activeItemConfig}
        currentKey={activeItemCategoryKey}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        dbData={fullDbData}
        saveEntry={dbm.saveEntry || saveEntry}
        devMode={isAdmin}
        isAdmin={isAdmin}
      />

      {/* Bastion Lore & Rules Chat Modal */}
      <BastionChatModal
        isOpen={isBastionOpen}
        onClose={() => setIsBastionOpen(false)}
        messages={bastionMessages}
        input={bastionInput}
        setInput={setBastionInput}
        onSend={handleSendBastion}
        currentKey={activeItemCategoryKey || 'compendium'}
        currentConfig={activeItemConfig}
        selectedItem={selectedItem}
        isEntryModalOpen={isEntryModalOpen}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleCreateNew={handleCreateNew}
      />

      {/* Global Toast Alerts */}
      <Toast toast={toastMessage} onClose={clearToast} />
    </div>
  );
};

export default CompendiumApp;
