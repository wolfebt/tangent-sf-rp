import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
import { useToast, showToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

// Extracted Components
import { DBMWikiView } from './DBMWikiView';
import { DBMGuideView } from './DBMGuideView';
import { DBMTableView } from './DBMTableView';
import { DBMLandingView } from './DBMLandingView';
import { BastionChatModal } from './BastionChatModal';
import { DBMItemModal } from './DBMItemModal';
import { ArchitectDevFieldsModal } from './ArchitectDevFieldsModal';
import { UserSettingsModal } from '../UserSettingsModal';
import { Toast } from '../UI/Toast';
import { BreadcrumbNav } from '../UI/BreadcrumbNav';

import { useDBM } from '../../context/DBMContext';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { fetchGeminiContent, getGeminiApiKey, sendBastionChatMessage } from '../../services/bastionService';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';

import { PanelLeftOpen, ChevronRight, Menu, Crown, Bot } from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { OmnicortexNavRail } from './OmnicortexNavRail';

const EMPTY_CONFIG = {};

export const DBMContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser, userHandle, loginWithGoogle, isAdmin, toggleAdminOverride } = useAuth();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');

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
  const [filterDirectives, setFilterDirectives] = useState([]);
  const [filterRailguards, setFilterRailguards] = useState([]);

  // Currently active configuration
  const currentKey = activeSubcategory || activeCategory;

  // Reset filters and sort when switching active category or subcategory
  useEffect(() => {
    setFilterTypes([]);
    setFilterSubtypes([]);
    setFilterTLs([]);
    setFilterMLs([]);
    setFilterTags([]);
    setFilterDirectives([]);
    setFilterRailguards([]);
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

  // Extract available unique Directives and Railguards for filter options
  const availableDirectives = useMemo(() => {
    const set = new Set();
    currentItems.forEach(item => {
      if (item.keywords) {
        String(item.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).forEach(k => set.add(k));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [currentItems]);

  const availableRailguards = useMemo(() => {
    const set = new Set();
    currentItems.forEach(item => {
      if (item.negative_keywords) {
        String(item.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).forEach(k => set.add(k));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [currentItems]);

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

      // 6. Filter by Directives (Positive Keywords) Category
      if (filterDirectives.length > 0) {
        const kws = item.keywords ? String(item.keywords).toLowerCase().split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
        const matchesDirective = filterDirectives.some(d => kws.includes(d.toLowerCase()));
        if (!matchesDirective) return false;
      }

      // 7. Filter by Railguards (Negative Keywords) Category
      if (filterRailguards.length > 0) {
        const negs = item.negative_keywords ? String(item.negative_keywords).toLowerCase().split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
        const matchesRailguard = filterRailguards.some(r => negs.includes(r.toLowerCase()));
        if (!matchesRailguard) return false;
      }

      // 8. Search Term (full-text search across multiple fields)
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
          (typeof item.tags === 'string' && item.tags.toLowerCase().includes(term)) ||
          (item.keywords && String(item.keywords).toLowerCase().includes(term)) ||
          (item.negative_keywords && String(item.negative_keywords).toLowerCase().includes(term)) ||
          (Array.isArray(item.recommended_factions) && item.recommended_factions.some(f => String(f).toLowerCase().includes(term))) ||
          (Array.isArray(item.recommended_origins) && item.recommended_origins.some(o => String(o).toLowerCase().includes(term))) ||
          (Array.isArray(item.recommended_occupations) && item.recommended_occupations.some(oc => String(oc).toLowerCase().includes(term)))
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
  }, [currentItems, filterTypes, filterSubtypes, filterTLs, filterMLs, filterTags, filterDirectives, filterRailguards, searchTerm, sortField, sortAsc]);

  // Synchronize category, subcategory, and active item with URL query parameters
  useEffect(() => {
    const catParam = searchParams.get('cat');
    const subParam = searchParams.get('sub');
    const itemParam = searchParams.get('item');

    if (catParam && catParam !== activeCategory) {
      setActiveCategory?.(catParam);
    }
    if (subParam !== undefined && subParam !== activeSubcategory) {
      setActiveSubcategory?.(subParam || null);
    }

    if (itemParam) {
      const targetList = dbData[subParam || catParam || currentKey] || [];
      const matched = targetList.find(i => (i.id === itemParam || i.name === itemParam || encodeURIComponent(i.name) === itemParam));
      if (matched && selectedItem?.id !== matched.id) {
        setSelectedItem(matched);
        setEditFormData({ ...matched });
        setIsEditMode(isAdmin ? true : false);
        setIsEntryModalOpen(true);
      }
    } else if (!itemParam && isEntryModalOpen) {
      setIsEntryModalOpen(false);
      setSelectedItem(null);
    }
  }, [searchParams, activeCategory, activeSubcategory, dbData, currentKey, isAdmin, setActiveCategory, setActiveSubcategory, selectedItem?.id, isEntryModalOpen]);

  const handleNavigateCategory = useCallback((catKey, subKey = null, pushHistory = true) => {
    navigateToCategory?.(catKey, subKey);
    const newParams = new URLSearchParams();
    newParams.set('cat', catKey);
    if (subKey) newParams.set('sub', subKey);

    const newSearch = `?${newParams.toString()}`;
    if (location.search !== newSearch) {
      if (pushHistory) {
        navigate({ pathname: location.pathname, search: newSearch });
      } else {
        navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
      }
    }
    setIsEntryModalOpen(false);
    setSelectedItem(null);
  }, [navigateToCategory, navigate, location.pathname, location.search]);

  // Entry Management Logic
  const handleOpenItem = (item, edit = isAdmin) => {
    setSelectedItem(item);
    setEditFormData(item ? { ...item } : { name: '', description: '' });
    setIsEditMode(isAdmin ? true : false);
    setIsEntryModalOpen(true);

    const newParams = new URLSearchParams(location.search);
    if (!newParams.get('cat')) {
      newParams.set('cat', activeCategory || 'species');
    }
    if (activeSubcategory && !newParams.get('sub')) {
      newParams.set('sub', activeSubcategory);
    }
    if (item?.id) {
      newParams.set('item', item.id);
    }
    const newSearch = `?${newParams.toString()}`;
    if (location.search !== newSearch) {
      navigate({ pathname: location.pathname, search: newSearch });
    }
  };

  const handleCloseItem = useCallback(() => {
    setIsEntryModalOpen(false);
    setSelectedItem(null);
    if (searchParams.get('item')) {
      const newParams = new URLSearchParams(location.search);
      newParams.delete('item');
      navigate({ pathname: location.pathname, search: `?${newParams.toString()}` });
    }
  }, [searchParams, location.search, location.pathname, navigate]);

  const handleDBMBack = useCallback(() => {
    if (isEntryModalOpen || selectedItem) {
      handleCloseItem();
      return;
    }
    if (activeSubcategory) {
      handleNavigateCategory(activeCategory, null);
      return;
    }
    if (activeCategory && activeCategory !== 'species') {
      handleNavigateCategory('species', null);
      return;
    }
    navigate('/');
  }, [isEntryModalOpen, selectedItem, handleCloseItem, activeSubcategory, activeCategory, handleNavigateCategory, navigate]);

  const getDBMBreadcrumbs = useCallback(() => {
    const crumbs = [
      { label: 'Tangent RP', to: '/' },
      { 
        label: 'Omnicortex DBM', 
        to: '/dbm?cat=species', 
        onClick: (activeCategory !== 'species' || activeSubcategory || selectedItem) ? () => handleNavigateCategory('species', null) : undefined 
      }
    ];

    const catLabel = parentConfig?.label || categoryConfig[activeCategory]?.label || activeCategory;
    crumbs.push({
      label: catLabel,
      onClick: (activeSubcategory || selectedItem) ? () => handleNavigateCategory(activeCategory, null) : undefined,
      active: !activeSubcategory && !selectedItem,
      badge: (!activeSubcategory && !selectedItem && currentItems?.length) ? `${currentItems.length}` : undefined
    });

    if (activeSubcategory) {
      const subLabel = subConfig?.label || categoryConfig[activeSubcategory]?.label || activeSubcategory;
      crumbs.push({
        label: subLabel,
        onClick: selectedItem ? () => handleNavigateCategory(activeCategory, activeSubcategory) : undefined,
        active: !selectedItem,
        badge: (!selectedItem && currentItems?.length) ? `${currentItems.length}` : undefined
      });
    }

    if (selectedItem) {
      crumbs.push({
        label: selectedItem.name || selectedItem.title || 'Entry Studio',
        active: true,
        badge: selectedItem.type || undefined
      });
    }

    return crumbs;
  }, [activeCategory, activeSubcategory, selectedItem, parentConfig, subConfig, currentItems, handleNavigateCategory]);

  const handleCreateNew = async () => {
    if (!isAdmin) {
      showToast({ type: 'error', title: 'Access Denied', text: 'Administrator or GM privileges are required to create new database entries.' });
      return;
    }

    const res = await confirm({
      title: `Create New ${currentConfig?.label || 'Entry'}`,
      message: `Specify an identifier or name for the new ${currentConfig?.label || 'database entry'}:`,
      inputLabel: 'Entry Name',
      inputValue: '',
      confirmLabel: 'Create Entry'
    });
    const newName = typeof res === 'object' ? res?.value : (typeof res === 'string' ? res : '');
    if (!res || !newName || !newName.trim()) return;

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
      showToast({ type: 'success', title: 'Entry Created', text: `Created new entry: "${newName.trim()}"` });
    } else {
      showToast({ type: 'error', title: 'Creation Failed', text: 'Failed to create new entry. Check console or network.' });
    }
  };

  const handleDuplicateEntry = async (itemToDuplicate) => {
    const target = itemToDuplicate || selectedItem;
    if (!target) return;
    if (!isAdmin) {
      showToast({ type: 'error', title: 'Access Denied', text: 'Administrator or GM privileges are required to duplicate database entries.' });
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
      showToast({ type: 'success', title: 'Entry Duplicated', text: `Duplicated "${baseName}" as "${clonedName}"` });
    } else {
      showToast({ type: 'error', title: 'Clone Failed', text: 'Failed to clone entry. Check console for details.' });
    }
  };

  const handleSaveEntry = async (closeOnSuccess = false, customPayload = null) => {
    if (!currentUser && !isAdmin) {
      showToast({ type: 'error', title: 'Authentication Required', text: 'You must be logged into Terran Net to save database entries.' });
      return;
    }
    if (!isAdmin) {
      showToast({ type: 'error', title: 'Access Denied', text: 'Administrator or GM privileges are required to save database entries.' });
      return;
    }
    const currentData = customPayload || editFormData;
    if (!currentData.name || !currentData.name.trim()) {
      showToast({ type: 'warn', title: 'Validation Warning', text: 'Entry name is mandatory before saving.' });
      return;
    }
    const docId = selectedItem?.id || currentData.id || `entry_${Date.now()}`;
    const payload = { ...currentData, name: currentData.name.trim(), id: docId, updatedAt: new Date().toISOString() };

    const success = await saveEntry(payload, currentKey);
    if (success) {
      showToast({ type: 'success', title: 'Entry Saved', text: `Saved "${payload.name}" successfully.` });
      if (closeOnSuccess === true) {
        setIsEntryModalOpen(false);
      }
    } else {
      showToast({ type: 'error', title: 'Save Failed', text: 'Save failed. You may not have administrative privileges, or a network error occurred.' });
    }
  };

  const handleDeleteEntry = async (itemToDelete = selectedItem) => {
    const target = itemToDelete || selectedItem;
    if (!target) return;
    if (!isAdmin) {
      showToast({ type: 'error', title: 'Access Denied', text: 'Administrator or GM privileges are required to delete database entries.' });
      return;
    }
    const entryName = target.name || target.title || 'this entry';
    const ok = await confirmTypedDeletion(confirm, entryName, currentConfig?.label || 'database entry');
    if (!ok) return;

    // Close modal & clear selection immediately to prevent any auto-saves
    setIsEntryModalOpen(false);
    setSelectedItem(null);

    const success = await deleteEntry(target.id, currentKey);
    if (success) {
      showToast({ type: 'success', title: 'Entry Deleted', text: `Deleted "${entryName}" successfully.` });
    } else {
      showToast({ type: 'error', title: 'Delete Failed', text: 'Delete failed. Check browser console for details.' });
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
      showToast({ type: 'error', title: 'Access Denied', text: 'Administrator or GM privileges are required to import entries.' });
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
        showToast({ type: 'success', title: 'Import Complete', text: `Successfully imported ${list.length} entries into ${currentConfig.label || currentKey}!` });
      } catch (err) {
        showToast({ type: 'error', title: 'Import Error', text: 'Invalid JSON file format. Please check file structure.' });
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
      {/* Main App Layout with Standardized Omnicortex Navigation Rail */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Standardized Omnicortex Navigation Rail (Replaces legacy DBMSidebar drawer) */}
        <OmnicortexNavRail
          activeSectionKey={activeCategory || currentKey}
          onSelectSection={(sectionKey) => {
            handleNavigateCategory(sectionKey, null);
          }}
          dbData={dbData}
          isAdmin={isAdmin}
          onOpenDevFields={() => setIsArchitectModalOpen && setIsArchitectModalOpen(true)}
          onOpenUserGuide={() => handleNavigateCategory('user_guide', null)}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen && setIsSidebarOpen(false)}
        />

        {/* Right Main Content Panel */}
        <section className={`flex-1 flex flex-col overflow-hidden relative min-w-0 ${isEntryModalOpen ? 'p-0' : 'p-3 sm:p-4 pb-4 sm:pb-5'}`}>
          {/* Breadcrumb Navigation Bar */}
          <BreadcrumbNav
            items={getDBMBreadcrumbs()}
            onBack={handleDBMBack}
            backTitle={
              isEntryModalOpen || selectedItem
                ? `Return to ${activeSubcategory ? (subConfig?.label || activeSubcategory) : (parentConfig?.label || activeCategory)} Directory`
                : activeSubcategory
                ? `Return to ${parentConfig?.label || activeCategory} Overview`
                : activeCategory !== 'species'
                ? 'Return to Species Directory'
                : 'Return to Tangent Dashboard'
            }
            className="mb-2 rounded-xl"
            rightSlot={
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Mobile Rail Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen && setIsSidebarOpen(prev => !prev)}
                  className="md:hidden px-2 py-1 bg-slate-900 border border-cyan-900/60 rounded text-cyan-400 text-xs font-bold cursor-pointer"
                  title="Toggle Omnicortex Navigation Rail"
                >
                  <Menu size={13} />
                </button>

                {/* Master Access Badge */}
                <button
                  type="button"
                  onClick={() => toggleAdminOverride && toggleAdminOverride()}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center gap-1 cursor-pointer ${
                    isAdmin
                      ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  title={isAdmin ? 'Master Developer Access Active' : 'Player View (Read Only)'}
                >
                  <Crown size={11} className={isAdmin ? 'text-amber-400' : 'text-slate-500'} />
                  <span className="hidden sm:inline">{isAdmin ? 'ADMIN' : 'VIEW'}</span>
                </button>

                {/* Bastion AI Assistant Button */}
                <button
                  type="button"
                  onClick={() => setIsBastionOpen(true)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open Bastion AI"
                >
                  <Bot size={11} className="text-emerald-400" />
                  <span className="hidden sm:inline">Bastion</span>
                </button>
              </div>
            }
          />

          {/* Subcategory Pills Bar (Handles both Canonical Parent Categories AND Developer Field Groups) */}
          {(() => {
            // When an asset studio is active, suppress subcategory pills to maximize vertical space
            if (isEntryModalOpen) {
              return null;
            }

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
                      handleNavigateCategory(parentKey, null);
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
                          handleNavigateCategory(parentKey, subKey);
                        } else {
                          handleNavigateCategory(subKey, null);
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

          {/* VIEW: ASSET STUDIO (IN-PLACE WHEN AN ITEM OR BLUEPRINT IS SELECTED) */}
          {isEntryModalOpen ? (
            <DBMItemModal
              isOpen={isEntryModalOpen}
              onClose={handleCloseItem}
              isModal={false}
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
          ) : (
            <>
              {/* VIEW TYPE: PARENT LANDING PAGE */}
              {(currentConfig.viewType === 'landing' || (currentConfig.isParent && !currentConfig.viewType)) && (
                <DBMLandingView
                  parentKey={activeCategory}
                  onNavigateToSubItem={(subKey) => {
                    if (currentConfig?.subcategories?.[subKey]) {
                      handleNavigateCategory(activeCategory, subKey);
                    } else {
                      handleNavigateCategory(subKey, null);
                    }
                  }}
                  dbData={dbData}
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
                  filterDirectives={filterDirectives}
                  setFilterDirectives={setFilterDirectives}
                  filterRailguards={filterRailguards}
                  setFilterRailguards={setFilterRailguards}
                  availableDirectives={availableDirectives}
                  availableRailguards={availableRailguards}
                  currentItems={currentItems}
                  isAdmin={isAdmin}
                  handleDeleteEntry={handleDeleteEntry}
                  handleDuplicateEntry={handleDuplicateEntry}
                />
              )}
            </>
          )}
        </section>
      </div>

      {/* Embedded Dialog Modals */}


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
