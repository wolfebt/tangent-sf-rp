import React, { useState } from 'react';
import { categoryConfig } from '../../components/DBM/categoryConfig';
import { useAuth } from '../../context/AuthContext';
import { useDBM } from '../../context/DBMContext';
import { useFirestoreSync } from '../../components/DBM/hooks/useFirestoreSync';
import { DBMWikiView } from '../../components/DBM/DBMWikiView';
import { DBMItemModal } from '../../components/DBM/DBMItemModal';
import { BastionChatModal } from '../../components/DBM/BastionChatModal';
import { Toast } from '../../components/UI/Toast';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';
import { sendBastionChatMessage, getGeminiApiKey } from '../../services/bastionService';
import { AudioService } from '../../services/audioService';

export const CompendiumApp = () => {
  const { currentUser, isAdmin } = useAuth();
  const dbm = useDBM() || {};

  const currentKey = 'compendium';
  const currentConfig = categoryConfig[currentKey] || {
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

  const { dbData, saveEntry, deleteEntry, toastMessage, clearToast } = useFirestoreSync(currentKey, currentUser);
  const currentItems = dbData[currentKey] || [];

  // Item Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Bastion AI Modal State
  const [isBastionOpen, setIsBastionOpen] = useState(false);
  const [bastionMessages, setBastionMessages] = useState([
    { role: 'model', text: 'Bastion Lore & Compendium Engine initialized. Greetings! How may I assist with setting lore, canonical rules, game mechanics, or faction architecture today?' }
  ]);
  const [bastionInput, setBastionInput] = useState('');
  const [apiKey] = useState(localStorage.getItem('geminiApiKey') || '');

  // Handle open item for viewing / editing
  const handleOpenItem = (item, edit = isAdmin) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setSelectedItem(item);
    setEditFormData(item ? { ...item } : { name: '', description: '' });
    setIsEditMode(isAdmin && edit ? true : false);
    setIsEntryModalOpen(true);
  };

  // Handle create new compendium article
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

    const success = await saveEntry(payload, currentKey);
    if (success) {
      setSelectedItem(payload);
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
      alert('You must be signed in to save compendium articles.');
      return;
    }
    if (!isAdmin) {
      alert('Administrator privileges are required to save canonical compendium entries.');
      return;
    }

    const currentData = customPayload || editFormData;
    if (!currentData.name || !currentData.name.trim()) {
      alert('Article title is required!');
      return;
    }

    const docId = selectedItem?.id || currentData.id || `compendium_${Date.now()}`;
    const payload = { ...currentData, name: currentData.name.trim(), id: docId, updatedAt: new Date().toISOString() };

    const success = await saveEntry(payload, currentKey);
    if (success && closeOnSuccess) {
      setIsEntryModalOpen(false);
    }
  };

  // Handle delete entry
  const handleDeleteEntry = async (itemToDelete = selectedItem) => {
    const target = itemToDelete || selectedItem;
    if (!target) return;
    if (!isAdmin) {
      alert('Administrator privileges are required to delete compendium articles.');
      return;
    }

    const entryName = target.name || target.title || 'this article';
    if (!confirmTypedDeletion(entryName, 'compendium article')) return;

    setIsEntryModalOpen(false);
    setSelectedItem(null);

    const success = await deleteEntry(target.id, currentKey);
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
            text: `🤖 **BASTION LORE ASSISTANT**: No Gemini API Key configured in User Settings (⚙️). Regarding "${userPrompt}", you can browse the full articles in the left directory tree.`
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
          activeDatabaseCategory: 'compendium',
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

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 font-sans overflow-hidden">
      {/* Main Compendium Workspace */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 pb-4 sm:pb-5">
        <DBMWikiView
          currentConfig={currentConfig}
          handleCreateNew={handleCreateNew}
          currentItems={currentItems}
          handleOpenItem={handleOpenItem}
          isAdmin={isAdmin}
          handleDeleteEntry={handleDeleteEntry}
        />
      </div>

      {/* Article Detail / Edit Modal */}
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

      {/* Bastion Lore & Rules Chat Modal */}
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

      {/* Global Toast Alerts */}
      <Toast toast={toastMessage} onClose={clearToast} />
    </div>
  );
};

export default CompendiumApp;
