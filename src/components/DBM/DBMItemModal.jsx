import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UnifiedRelationalSelectorModal } from './UnifiedRelationalSelectorModal';
import { ALL_CANONICAL_SKILLS, SKILL_CATEGORY_SECTIONS } from '../../data/skillsData';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';
import { Backpack, Gem, Check, Sparkles, AlertCircle, Cpu, Bot, RotateCcw, Calculator, Coins, Hammer, TrendingUp, Layers, Wrench, Shield, Zap } from 'lucide-react';
import * as econEngine from '../../engines/tangentEconEngine';
import * as techEngine from '../../engines/tangentTechEngine';
import * as uduEngine from '../../engines/tangentUDUEngine';
import { CodexIngestionModal } from '../../pages/Codex/CodexIngestionModal';

export const getDatasetKeyForCollection = (colKey) => {
  if (!colKey) return 'species';
  const k = colKey.toLowerCase();
  if (k === 'species' || k === 'species_type' || k === 'species_size' || k === 'species_movement') return 'species';
  if (k === 'features' || k === 'trait' || k === 'traits') return 'features';
  if (k === 'skills' || k === 'skill') return 'skills';
  if (k === 'disadvantages' || k === 'disadvantage') return 'disadvantages';
  if (k === 'factions' || k === 'faction' || k === 'societies') return 'factions';
  if (k === 'occupations' || k === 'occupation' || k === 'origins' || k === 'archetypes') return 'occupations';
  if (k === 'invocations' || k === 'invocation' || k === 'special_abilities' || k === 'disciplines') return 'invocations';
  if (k === 'augmentations' || k === 'augmentation' || k === 'augmentation_type' || k === 'body_location') return 'augmentations';
  if (k === 'gear' || k === 'equipment' || k === 'personal_property' || k === 'meta-tech') return 'gear';
  if (k === 'weaponry' || k === 'weapons' || k === 'weapon') return 'weaponry';
  if (k === 'armoring' || k === 'armor') return 'armoring';
  if (k === 'mecha' || k === 'vehicles' || k === 'starships') return 'mecha';
  if (k === 'architecture' || k === 'facilities' || k === 'stations') return 'architecture';
  return 'other';
};

// Specialized Sub-Widgets
import { CostEconomyWidget } from './widgets/CostEconomyWidget';
import { UniversalModifiersWidget } from './widgets/UniversalModifiersWidget';
import { ModificationsWidget } from './widgets/ModificationsWidget';
import { CriticalDetailsWidget } from './widgets/CriticalDetailsWidget';
import { SocketsAllocationWidget } from './widgets/SocketsAllocationWidget';

// Category Field Ordering
import { getSortedCategoryFieldKeys } from './categoryConfig';

// Schema Normalization Adapters
import {
  normalizeOmnicortexItem,
  exportOmnicortexItem,
  getItemCosts,
  getItemModifiers,
  getItemModifications,
  getItemCriticalDetails,
  getItemSockets
} from '../../utils/tangentSchemaAdapters';

export const DBMItemTransferBar = ({ item, categoryKey }) => {
  const folio = useFolio() || {};
  const { activeCharacter, activeHeroName, addItemToInventory, addAbility } = folio;
  const story = useStory() || {};
  const { universeState, updateScenario, activeScenarioId } = story;

  const [transferStatus, setTransferStatus] = useState(null); // 'hero_success' | 'scenario_success' | 'cp_warning'
  const [statusMessage, setStatusMessage] = useState('');

  if (!item || !item.name) return null;

  const heroName = activeHeroName || activeCharacter?.name || 'Active Hero';

  const handleEquipToHero = () => {
    if (!activeCharacter && !addItemToInventory) {
      alert('No active character loaded in Persona Folio. Please open Folio to create or select a character.');
      return;
    }

    const cat = (categoryKey || item.category || '').toLowerCase();
    const isPowerOrAbility = ['psionics', 'psionic', 'cybernetics', 'augmentations', 'invocations', 'special_abilities', 'features', 'awakened'].includes(cat);

    if (isPowerOrAbility && addAbility) {
      addAbility({
        id: `power_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        type: cat,
        metaLevel: item.metaLevel || item.level || item.ml || 1,
        apCost: item.apCost || item.ap || 2,
        damage: item.damage || '',
        description: item.description || '',
        cpCost: parseInt(item.cpCost || item.cp || item.cost_cp || item.costs?.bp || 5, 10),
        ...item
      });
      setStatusMessage(`Equipped to ${heroName}!`);
    } else if (addItemToInventory) {
      addItemToInventory({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        category: cat || 'gear',
        damage: item.damage || '',
        score: item.score || item.attack || '',
        armor: item.armor || item.resistance || 0,
        resistance: item.resistance || item.armor || '',
        weight: item.weight || item.wt || 1,
        techLevel: item.techLevel || item.tl || 1,
        cpCost: parseInt(item.cpCost || item.cp || item.cost_cp || item.costs?.bp || 0, 10),
        notes: item.description || item.notes || '',
        ...item
      });
      setStatusMessage(`Equipped to ${heroName}!`);
    }

    AudioService.playTerminalBeep(1200, 0.05);
    setTransferStatus('hero_success');
    setTimeout(() => {
      setTransferStatus(null);
      setStatusMessage('');
    }, 3000);
  };

  const handleAddToScenarioLoot = () => {
    const scenarios = universeState?.scenarios || [];
    const targetScenario = (activeScenarioId && scenarios.find(s => s.id === activeScenarioId)) || scenarios[0];

    if (!targetScenario) {
      alert('No active story scenario found in ADE Studio. Please create or open a story scenario first.');
      return;
    }

    const cat = categoryKey || item.category || 'Gear';
    const existingContent = targetScenario.content || '';
    const itemCost = item.costs?.credits || item.cost || item.cp || '';
    const itemEntry = `<li><strong>${item.name}</strong> (${cat}${item.damage ? ` • Damage: ${item.damage}` : ''}${item.armor ? ` • Armor: ${item.armor}` : ''}${itemCost ? ` • Cost: ${itemCost}` : ''})</li>`;
    
    let updatedContent = existingContent;
    if (existingContent.includes('<h3>Rewards</h3>') || existingContent.includes('<h3>Scenario Rewards</h3>')) {
      updatedContent = existingContent.replace(/(<h3>(?:Scenario )?Rewards<\/h3>\s*<ul>?)/i, `$1\n${itemEntry}`);
    } else {
      updatedContent = `${existingContent}\n<h3>Scenario Rewards & Loot Cache</h3>\n<ul>\n${itemEntry}\n</ul>`;
    }

    const existingRewards = targetScenario.fields?.rewards || '';
    const updatedRewards = existingRewards 
      ? `${existingRewards}\n- ${item.name} (${cat}${item.damage ? `, Dmg: ${item.damage}` : ''})` 
      : `- ${item.name} (${cat}${item.damage ? `, Dmg: ${item.damage}` : ''})`;

    if (updateScenario) {
      updateScenario(targetScenario.id, {
        content: updatedContent,
        fields: {
          ...(targetScenario.fields || {}),
          rewards: updatedRewards
        }
      });
      setStatusMessage(`Stashed into "${targetScenario.title || 'Scenario'}" reward cache!`);
      AudioService.playTerminalBeep(900, 0.05);
      setTransferStatus('scenario_success');
      setTimeout(() => {
        setTransferStatus(null);
        setStatusMessage('');
      }, 3000);
    }
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 my-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
        <Sparkles size={14} className="text-amber-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-300">Folio & Story Integration:</span>{' '}
          <span className="text-slate-400">Transfer this item directly to active gameplay.</span>
          {statusMessage && (
            <div className="text-emerald-400 font-bold text-[11px] animate-pulse mt-0.5">
              ✓ {statusMessage}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        {/* Equip to Persona Folio Character */}
        <button
          type="button"
          onClick={handleEquipToHero}
          className="flex-1 sm:flex-none py-1.5 px-3 bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          title={`Equip ${item.name} directly to ${heroName}'s Folio Inventory`}
        >
          <Backpack size={14} />
          <span>Equip to Hero</span>
        </button>

        {/* Add to Scenario Rewards */}
        <button
          type="button"
          onClick={handleAddToScenarioLoot}
          className="flex-1 sm:flex-none py-1.5 px-3 bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          title={`Add ${item.name} to the active ADE Studio scenario reward chest`}
        >
          <Gem size={14} />
          <span>Add to Scenario Loot</span>
        </button>
      </div>
    </div>
  );
};

export const CANONICAL_ATTRIBUTES_LIST = [
  {
    group: 'Physical Attributes',
    icon: '🏃',
    pairs: [
      {
        primary: { name: 'Strength', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Might', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Agility', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Reflex', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Stamina', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Fortitude', type: 'Sub-Attribute' }]
      }
    ]
  },
  {
    group: 'Mental Attributes',
    icon: '🧠',
    pairs: [
      {
        primary: { name: 'Intellect', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Logic', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Wisdom', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Will', type: 'Sub-Attribute' }]
      },
      {
        primary: { name: 'Charisma', type: 'Primary Attribute' },
        subAttributes: [{ name: 'Etiquette', type: 'Sub-Attribute' }]
      }
    ]
  }
];

const DEFAULT_FIELDS = {
  name: { type: 'text', required: true },
  description: { type: 'textarea' }
};

export const DBMItemModal = ({
  isOpen,
  onClose,
  isEditMode = false,
  setIsEditMode = () => {},
  selectedItem = null,
  editFormData = {},
  setEditFormData = () => {},
  currentConfig = {},
  currentKey,
  onSave = () => {},
  onDelete = () => {},
  dbData = {},
  saveEntry = null,
  devMode = true,
  isAdmin = true
}) => {
  const [relationalData, setRelationalData] = useState({});
  const [activeSelectorField, setActiveSelectorField] = useState(null);
  const fetchedRef = useRef({});

  // Custom freeform entry state per field
  const [customInputModes, setCustomInputModes] = useState({});
  const [customInputValues, setCustomInputValues] = useState({});

  // Tab state
  const [activeModalTab, setActiveModalTab] = useState('all');
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);

  const toggleCustomInputMode = (fieldKey) => {
    setCustomInputModes(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const saveTimeoutRef = useRef(null);
  const isDeletingRef = useRef(false);

  // Normalize form data on modal open or item selection change
  useEffect(() => {
    if (isOpen) {
      isDeletingRef.current = false;
      setActiveModalTab('all');
      if (selectedItem) {
        setEditFormData(normalizeOmnicortexItem(selectedItem));
      }
    } else {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }
  }, [isOpen, selectedItem]);

  const handleAddCustomValue = (fieldKey, isMulti = false) => {
    const rawVal = (customInputValues[fieldKey] || '').trim();
    if (!rawVal) return;

    if (isMulti) {
      const currentArr = Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : [];
      if (!currentArr.includes(rawVal)) {
        setEditFormData(prev => ({ ...prev, [fieldKey]: [...currentArr, rawVal] }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [fieldKey]: rawVal }));
      setCustomInputModes(prev => ({ ...prev, [fieldKey]: false }));
    }

    setCustomInputValues(prev => ({ ...prev, [fieldKey]: '' }));
  };

  const handleRemoveCustomValue = (fieldKey, valToRemove) => {
    const currentArr = Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : [];
    setEditFormData(prev => ({ ...prev, [fieldKey]: currentArr.filter(v => v !== valToRemove) }));
  };

  // Fetch relational data when modal opens
  useEffect(() => {
    const fields = currentConfig?.fields || DEFAULT_FIELDS;
    if (!isOpen || !fields) return;

    const fetchRelations = async () => {
      const newRelData = {};
      let updated = false;

      for (const [fKey, fDef] of Object.entries(fields)) {
        if (fDef.type === 'multiselect' || fDef.type === 'select' || fDef.type === 'skill_bonus_list' || fDef.manageable) {
          const src = fDef.source || fKey;
          if (dbData[src] && dbData[src].length > 0) {
            newRelData[src] = dbData[src];
            updated = true;
          } else if (!fetchedRef.current[src]) {
            try {
              const snap = await getDocs(collection(db, src));
              const items = snap.docs.map(d => ({ ...d.data(), id: d.id }));
              newRelData[src] = items;
              fetchedRef.current[src] = true;
              updated = true;
            } catch (err) {
              console.warn(`Failed to prefetch relational data for ${src}:`, err);
            }
          }
        }
      }

      if (updated) {
        setRelationalData(prev => ({ ...prev, ...newRelData }));
      }
    };
    fetchRelations();
  }, [isOpen, currentConfig, dbData]);

  // Recalculate Design DC whenever relevant form fields change
  useEffect(() => {
    if (!isEditMode || !isAdmin) return;
    if (['invocations', 'special_abilities', 'augmentations', 'weaponry', 'armoring', 'mecha'].includes(currentKey)) {
      let dc = 0;
      dc += (Number(editFormData.tech_level ?? editFormData.tl ?? editFormData.techLevel) || 0) * 2;
      dc += (Number(editFormData.meta_level ?? editFormData.ml ?? editFormData.metaLevel) || 0) * 3;

      ['area', 'effect', 'range', 'target', 'component', 'modes'].forEach(relKey => {
        const selected = editFormData[relKey];
        if (Array.isArray(selected)) {
          selected.forEach(val => {
            const items = relationalData[relKey] || [];
            const match = items.find(i => (i.name || i.id) === val);
            if (match && match.dc) dc += Number(match.dc);
          });
        }
      });

      if (editFormData.design_dc !== dc && dc > 0) {
        setEditFormData(prev => ({ ...prev, design_dc: dc }));
      }
    }
  }, [editFormData.tech_level, editFormData.tl, editFormData.techLevel, editFormData.meta_level, editFormData.ml, editFormData.metaLevel, editFormData.area, editFormData.effect, editFormData.range, editFormData.target, editFormData.component, editFormData.modes, editFormData.design_dc, isEditMode, currentKey, relationalData, isAdmin]);

  if (!isOpen) return null;

  const fieldsObj = currentConfig.fields || DEFAULT_FIELDS;
  const fieldKeys = getSortedCategoryFieldKeys(fieldsObj);
  const isDenseForm = fieldKeys.length > 6;

  const isNonCraftedCategory = ['species', 'archetypes', 'features', 'skills', 'origins', 'occupations', 'universe', 'world', 'setting', 'philosophy', 'scene'].includes((currentKey || '').toLowerCase());

  const getFieldTabGroup = (fKey) => {
    const k = fKey.toLowerCase();
    const fDef = fieldsObj[fKey] || {};
    if (['costs_map', 'modifiers_list', 'modifications_list', 'critical_details', 'sockets_group'].includes(fDef.type)) {
      return 'mechanics';
    }
    if (['name', 'title', 'parent_species', 'lineage', 'homeworld', 'stigma', 'description', 'type', 'tl', 'ml', 'tech_level', 'meta_level', 'techlevel', 'metalevel', 'availability', 'rarity', 'category', 'price', 'cost_credits', 'size', 'movement', 'prerequisite', 'society', 'is_specialization', 'base_skill', 'subtype', 'cp', 'bp'].includes(k)) {
      return 'general';
    }
    if (['body', 'laws_of_physics', 'history', 'geography', 'biosphere', 'culture', 'points_of_interest', 'inhabitants', 'origin', 'practices', 'attitude', 'goals', 'social_strengths', 'social_weaknesses', 'note', 'mechanic', 'core_beliefs', 'social_structure', 'outsider_view', 'law_order', 'military_doctrine', 'design_language', 'architecture', 'gear_aesthetic', 'lighting_mood', 'image_prompt'].includes(k)) {
      return 'narrative';
    }
    return 'mechanics';
  };

  const getSectionHeader = (fKey) => {
    const fDef = fieldsObj[fKey] || {};
    if (fDef.type === 'costs_map' && !isNonCraftedCategory) {
      return { title: '💰 Economy, Currency & Resource Expenditures', color: 'text-amber-400', border: 'border-amber-500/30' };
    }
    if (fDef.type === 'modifiers_list') {
      return { title: '⚡ Universal Modifiers & Attribute/Skill Bonuses', color: 'text-cyan-400', border: 'border-cyan-500/30' };
    }
    if (fDef.type === 'modifications_list') {
      return { title: '🔧 Modifications, Upgrades & Modules', color: 'text-blue-400', border: 'border-blue-500/30' };
    }
    if (fDef.type === 'critical_details') {
      return { title: '💥 Critical Strike & Precision Metrics', color: 'text-rose-400', border: 'border-rose-500/30' };
    }
    if (fDef.type === 'sockets_group') {
      return { title: '🔌 Sockets & System Allocation', color: 'text-purple-400', border: 'border-purple-500/30' };
    }
    return null;
  };

  const handleSaveModal = (closeOnSuccess = true) => {
    const cleaned = exportOmnicortexItem(editFormData);
    onSave(closeOnSuccess, cleaned);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 md:p-6 pt-10 sm:pt-14 md:pt-16 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">
                {isEditMode && isAdmin ? `MANAGE ${currentConfig.label}` : `VIEW ${currentConfig.label}`}
              </h2>
              {!isAdmin && (
                <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
                  🔒 Read-Only
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              ID: {selectedItem?.id || editFormData.id || 'NEW_ENTRY'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  setIsIngestionModalOpen(true);
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title={`Open BASTION Ingestion Studio for ${currentConfig.label}`}
              >
                <Bot size={13} className="text-cyan-400" />
                <span>AI Ingestion Studio</span>
              </button>
            )}

            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        </div>

        {/* Dense Form Category Sub-Tab Navigation Bar */}
        {isDenseForm && (
          <div className="bg-slate-950 px-2 sm:px-4 py-1.5 border-b border-slate-800 flex flex-wrap items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModalTab('general')}
              className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider border transition-colors flex-1 sm:flex-none text-center whitespace-nowrap ${
                activeModalTab === 'general'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              📋 General
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('mechanics')}
              className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider border transition-colors flex-1 sm:flex-none text-center whitespace-nowrap ${
                activeModalTab === 'mechanics'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Mechanics & Economy
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('narrative')}
              className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider border transition-colors flex-1 sm:flex-none text-center whitespace-nowrap ${
                activeModalTab === 'narrative'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              📖 Narrative & Lore
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('all')}
              className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider border transition-colors flex-1 sm:flex-none text-center whitespace-nowrap ${
                activeModalTab === 'all'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              🔍 All ({fieldKeys.length})
            </button>
          </div>
        )}

        {/* Modal Body Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldKeys.map(fieldKey => {
                if (isDenseForm && activeModalTab !== 'all' && getFieldTabGroup(fieldKey) !== activeModalTab) {
                  return null;
                }

                const fieldDef = currentConfig.fields[fieldKey];
                const label = fieldDef.label || fieldKey.replace(/_/g, ' ').toUpperCase();
                const isFullWidth = fieldDef.type === 'textarea' ||
                  fieldDef.type === 'json_list' ||
                  fieldDef.type === 'multiselect' ||
                  fieldDef.type === 'costs_map' ||
                  fieldDef.type === 'modifiers_list' ||
                  fieldDef.type === 'modifications_list' ||
                  fieldDef.type === 'critical_details' ||
                  fieldDef.type === 'sockets_group' ||
                  fieldDef.manageable;
                const isCustomActive = Boolean(customInputModes[fieldKey]);
                const sectionHeader = getSectionHeader(fieldKey);

                return (
                  <React.Fragment key={fieldKey}>
                    {sectionHeader && (
                      <div className="col-span-1 md:col-span-2 pt-3 pb-1 border-b border-slate-800 flex items-center gap-2 mt-2">
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${sectionHeader.color}`}>
                          {sectionHeader.title}
                        </span>
                      </div>
                    )}
                    <div className={isFullWidth ? 'md:col-span-2' : ''}>
                      {/* Field Top Bar */}
                      {!['costs_map', 'modifiers_list', 'modifications_list', 'critical_details', 'sockets_group'].includes(fieldDef.type) && (
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-400 uppercase">
                            {label} {fieldDef.required && '*'}
                          </label>
                          <button
                            type="button"
                            onClick={() => toggleCustomInputMode(fieldKey)}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
                          >
                            {isCustomActive ? '✕ Cancel Custom' : '✍️ Custom Entry'}
                          </button>
                        </div>
                      )}

                      {/* INLINE CUSTOM ENTRY MODE */}
                      {isCustomActive ? (
                        <div className="flex gap-2 items-center bg-slate-950 p-2 border border-amber-500/50 rounded-lg">
                          <input
                            type="text"
                            placeholder={`Enter custom ${label}...`}
                            value={customInputValues[fieldKey] || ''}
                            onChange={e => setCustomInputValues({ ...customInputValues, [fieldKey]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomValue(fieldKey, fieldDef.type === 'multiselect');
                              }
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 text-white p-1.5 rounded text-xs outline-none focus:border-amber-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomValue(fieldKey, fieldDef.type === 'multiselect')}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ) : fieldDef.type === 'costs_map' ? (
                        !isNonCraftedCategory ? (
                          <CostEconomyWidget
                            costs={editFormData.costs || getItemCosts(editFormData)}
                            onChange={newCosts => setEditFormData(prev => ({ ...prev, costs: newCosts }))}
                            isEditMode={true}
                          />
                        ) : null
                      ) : fieldDef.type === 'modifiers_list' ? (
                        <UniversalModifiersWidget
                          modifiers={editFormData.modifiers || getItemModifiers(editFormData)}
                          onChange={newMods => setEditFormData(prev => ({ ...prev, modifiers: newMods }))}
                          relationalData={relationalData}
                          isEditMode={true}
                        />
                      ) : fieldDef.type === 'modifications_list' ? (
                        <ModificationsWidget
                          modifications={editFormData.modifications || getItemModifications(editFormData)}
                          onChange={newMods => setEditFormData(prev => ({ ...prev, modifications: newMods }))}
                          isEditMode={true}
                        />
                      ) : fieldDef.type === 'critical_details' ? (
                        <CriticalDetailsWidget
                          criticalDetails={editFormData.critical_details || getItemCriticalDetails(editFormData)}
                          onChange={newCrit => setEditFormData(prev => ({ ...prev, critical_details: newCrit }))}
                          isEditMode={true}
                        />
                      ) : fieldDef.type === 'sockets_group' ? (
                        <SocketsAllocationWidget
                          sockets={editFormData.sockets || getItemSockets(editFormData)}
                          onChange={newSockets => setEditFormData(prev => ({ ...prev, sockets: newSockets }))}
                          isEditMode={true}
                        />
                      ) : fieldDef.type === 'textarea' ? (
                        <textarea
                          rows={fieldKey === 'body' ? 12 : 4}
                          value={editFormData[fieldKey] ?? ''}
                          onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                          placeholder={fieldDef.aiEnabled ? 'Lore, sociometrics, design markdown...' : ''}
                          className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded text-xs outline-none focus:border-amber-500 font-mono leading-relaxed"
                        />
                      ) : fieldDef.type === 'select' ? (
                        <div className="flex gap-2">
                          <select
                            value={editFormData[fieldKey] ?? ''}
                            onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                          >
                            <option value="">-- None / Default --</option>
                            {(fieldDef.options || (relationalData[fieldDef.source || fieldKey] || []).map(i => i.name || i.id)).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {fieldDef.manageable && (
                            <button
                              type="button"
                              onClick={() => setActiveSelectorField(fieldKey)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-xs font-mono font-bold shrink-0"
                              title="Open Relational Entity Manager"
                            >
                              ⚙️ Manage
                            </button>
                          )}
                        </div>
                      ) : fieldDef.type === 'multiselect' || fieldDef.manageable ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveSelectorField(fieldKey)}
                              className="flex-1 py-1.5 px-3 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono font-bold flex items-center justify-between transition-colors"
                            >
                              <span>Select {label} ({Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey].length : 0})</span>
                              <span>⚙️ Browse</span>
                            </button>
                          </div>
                          {Array.isArray(editFormData[fieldKey]) && editFormData[fieldKey].length > 0 && (
                            <div className="flex flex-wrap gap-1 bg-slate-950 p-2 rounded border border-slate-800">
                              {editFormData[fieldKey].map((val, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono flex items-center gap-1.5"
                                >
                                  <span>{typeof val === 'object' ? (val.name || val.id) : String(val)}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomValue(fieldKey, val)}
                                    className="text-cyan-400 hover:text-rose-400 font-bold"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : fieldDef.type === 'boolean' ? (
                        <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={Boolean(editFormData[fieldKey])}
                            onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.checked })}
                            className="accent-amber-500 w-4 h-4"
                          />
                          Enable {label}
                        </label>
                      ) : (
                        <input
                          type={fieldDef.type === 'number' ? 'number' : 'text'}
                          value={editFormData[fieldKey] ?? ''}
                          onChange={e => setEditFormData({
                            ...editFormData,
                            [fieldKey]: fieldDef.type === 'number' ? Number(e.target.value) : e.target.value
                          })}
                          className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                        />
                      )}
                    </div>
                  </React.Fragment>
                );
              })}

              {!currentConfig.fields?.tags && (
                <div className="space-y-1 pt-2 border-t border-slate-800/80 md:col-span-2">
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <span>🏷️</span> Tags
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editFormData.tags) ? editFormData.tags.join(', ') : (editFormData.tags || '')}
                    onChange={e => {
                      const val = e.target.value;
                      const tagArr = val.split(',').map(t => t.trim()).filter(Boolean);
                      setEditFormData({ ...editFormData, tags: tagArr });
                    }}
                    placeholder="e.g. Energy, Heavy Weapon, Prototype"
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 italic">
                    Comma-separated classification tags for compendium search and filtering.
                  </p>
                </div>
              )}

              {/* Architect Computed Metrics Override & Recalculate */}
              {isAdmin && !isNonCraftedCategory && (
                <div className="space-y-2 pt-3 border-t border-slate-800/80 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Cpu size={13} />
                      <span>Omnicortex Formula Synchronization</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const dc = Number(editFormData.craft_dc ?? editFormData.design_dc ?? editFormData.dc ?? 10) || 10;
                        const creditVal = econEngine.calculateCreditValue(dc);
                        const computed = {
                          credit_value: creditVal,
                          material_cost: econEngine.calculateMaterialCost(creditVal),
                          ws_threshold: dc,
                          financial_status: econEngine.getFinancialStatus(dc)?.name || 'Standard',
                          complexity_tier: econEngine.getComplexityTier(dc),
                          crafting_days: econEngine.calculateAllCraftingTiers(creditVal),
                          _computed_override: false,
                          computed_at: new Date().toISOString()
                        };
                        setEditFormData(prev => ({
                          ...prev,
                          _computed: computed,
                          _computed_override: false
                        }));
                        AudioService.playTerminalBeep(1300, 0.04);
                      }}
                      className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={11} />
                      <span>Recalculate Metrics</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-white">{selectedItem?.name || 'Unnamed Entry'}</h3>
                {selectedItem?.title && selectedItem.title !== selectedItem.name && (
                  <span className="text-xs text-slate-400 font-mono italic">({selectedItem.title})</span>
                )}
              </div>

              {/* Badges Bar */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedItem?.parent_species && (
                  <span className="px-2.5 py-0.5 bg-purple-950/90 border border-purple-500/50 text-purple-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <span>🧬</span> {selectedItem.parent_species}
                  </span>
                )}
                {selectedItem?.homeworld && (
                  <span className="px-2.5 py-0.5 bg-blue-950/90 border border-blue-500/50 text-blue-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <span>🪐</span> {selectedItem.homeworld}
                  </span>
                )}
                {selectedItem?.stigma && selectedItem.stigma !== 'None' && (
                  <span className="px-2.5 py-0.5 bg-amber-950/90 border border-amber-500/50 text-amber-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <span>⚠️</span> {selectedItem.stigma}
                  </span>
                )}
                {(selectedItem?.costs?.bp !== undefined || selectedItem?.cp !== undefined || selectedItem?.bp_cost !== undefined || selectedItem?.bp !== undefined) && (
                  <span className="px-2.5 py-0.5 bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <span>⚡</span> {selectedItem?.costs?.bp ?? selectedItem.cp ?? selectedItem.bp ?? selectedItem.bp_cost} CP
                  </span>
                )}
                {(selectedItem?.tech_level !== undefined || selectedItem?.tl !== undefined || selectedItem?.techLevel !== undefined) && (
                  <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-cyan-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <span>TL</span> {selectedItem.tech_level ?? selectedItem.tl ?? selectedItem.techLevel}
                  </span>
                )}
                {(selectedItem?.meta_level !== undefined || selectedItem?.ml !== undefined || selectedItem?.metaLevel !== undefined) && (
                  <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-purple-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <span>ML</span> {selectedItem.meta_level ?? selectedItem.ml ?? selectedItem.metaLevel}
                  </span>
                )}
                {((Array.isArray(selectedItem?.tags) && selectedItem.tags.length > 0) || (typeof selectedItem?.tags === 'string' && selectedItem.tags.trim())) && (
                  (Array.isArray(selectedItem.tags) ? selectedItem.tags : selectedItem.tags.split(',').map(t => t.trim())).filter(Boolean).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                      <span>🏷️</span> {tag}
                    </span>
                  ))
                )}
              </div>

              {selectedItem?.description && (
                <p className="text-sm text-slate-300 whitespace-pre-line bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  {selectedItem.description}
                </p>
              )}
              
              {/* 1-Click Cross-Module Item Importer & Exporter Transfer Bar */}
              <DBMItemTransferBar item={selectedItem} categoryKey={currentKey} />

              {/* Omnicortex Computed Game Metrics (For Craftable / Market Goods only) */}
              {!isNonCraftedCategory && (selectedItem?._computed || selectedItem?.craft_dc || selectedItem?.design_dc) && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 my-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                      <Cpu size={14} className="text-cyan-400" />
                      <span>Omnicortex Formula Metrics</span>
                    </div>
                    {selectedItem?._computed?._computed_override && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold uppercase">
                        ⚠️ Architect Override
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="block text-[9px] text-slate-400 uppercase">Market Value</span>
                      <span className="text-amber-300 font-extrabold">
                        {Number(selectedItem?._computed?.credit_value ?? econEngine.calculateCreditValue(selectedItem?.craft_dc ?? 10)).toLocaleString()} Cr
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="block text-[9px] text-slate-400 uppercase">Material Cost (50%)</span>
                      <span className="text-emerald-400 font-extrabold">
                        {Number(selectedItem?._computed?.material_cost ?? econEngine.calculateMaterialCost(econEngine.calculateCreditValue(selectedItem?.craft_dc ?? 10))).toLocaleString()} Cr
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="block text-[9px] text-slate-400 uppercase">Wealth Score</span>
                      <span className="text-cyan-300 font-extrabold">
                        {selectedItem?._computed?.financial_status || econEngine.getFinancialStatus(selectedItem?.craft_dc ?? 10)?.name}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="block text-[9px] text-slate-400 uppercase">Complexity Tier</span>
                      <span className="text-purple-300 font-extrabold">
                        {selectedItem?._computed?.complexity_tier || econEngine.getComplexityTier(selectedItem?.craft_dc ?? 10)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* All Populated Fields Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {(() => {
                  const renderedKeys = new Set(['name', 'description', 'id', '_computed', '_computed_override', 'updatedAt', 'createdAt', 'searchTerms']);
                  if (isNonCraftedCategory) {
                    renderedKeys.add('costs');
                  }
                  const fieldsConfig = currentConfig.fields || {};
                  
                  // Collect all keys from currentConfig.fields followed by any extra populated keys in selectedItem
                  const allCandidateKeys = [
                    ...Object.keys(fieldsConfig),
                    ...Object.keys(selectedItem || {}).filter(k => !fieldsConfig[k])
                  ];

                  return allCandidateKeys.map(fKey => {
                    if (renderedKeys.has(fKey)) return null;
                    if (fKey === 'costs' && isNonCraftedCategory) return null;
                    renderedKeys.add(fKey);

                    const val = selectedItem?.[fKey];
                    // Skip empty / null / undefined / empty arrays / empty objects
                    if (val === undefined || val === null || val === '') return null;
                    if (Array.isArray(val) && val.length === 0) return null;
                    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return null;

                    const fDef = fieldsConfig[fKey] || {
                      type: typeof val === 'number' ? 'number' : Array.isArray(val) ? 'multiselect' : typeof val === 'boolean' ? 'boolean' : 'text'
                    };
                    const label = fDef.label || fKey.replace(/_/g, ' ').toUpperCase();
                    const isFullWidth = fDef.type === 'textarea' ||
                      fDef.type === 'json_list' ||
                      fDef.type === 'multiselect' ||
                      fDef.type === 'costs_map' ||
                      fDef.type === 'modifiers_list' ||
                      fDef.type === 'modifications_list' ||
                      fDef.type === 'critical_details' ||
                      fDef.type === 'sockets_group' ||
                      fDef.manageable ||
                      fKey === 'body' || fKey === 'laws_of_physics' || fKey === 'history' || fKey === 'note' || fKey === 'mechanic';
                    const sectionHeader = getSectionHeader(fKey);

                    return (
                      <React.Fragment key={fKey}>
                        {sectionHeader && (
                          <div className="col-span-1 sm:col-span-2 pt-3 pb-1 border-b border-slate-800 flex items-center gap-2 mt-1">
                            <span className={`text-xs font-extrabold uppercase tracking-wider ${sectionHeader.color}`}>
                              {sectionHeader.title}
                            </span>
                          </div>
                        )}
                        <div className={`bg-slate-950 p-3 rounded border border-slate-800 ${isFullWidth ? 'sm:col-span-2' : ''}`}>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                          <div className="mt-1">
                            {fDef.type === 'costs_map' ? (
                              !isNonCraftedCategory ? <CostEconomyWidget costs={val || getItemCosts(selectedItem)} isEditMode={false} /> : null
                            ) : fDef.type === 'modifiers_list' ? (
                              <UniversalModifiersWidget modifiers={val || getItemModifiers(selectedItem)} isEditMode={false} relationalData={relationalData} />
                            ) : fDef.type === 'modifications_list' ? (
                              <ModificationsWidget modifications={val || getItemModifications(selectedItem)} isEditMode={false} />
                            ) : fDef.type === 'critical_details' ? (
                              <CriticalDetailsWidget criticalDetails={val || getItemCriticalDetails(selectedItem)} isEditMode={false} />
                            ) : fDef.type === 'sockets_group' ? (
                              <SocketsAllocationWidget sockets={val || getItemSockets(selectedItem)} isEditMode={false} />
                            ) : Array.isArray(val) ? (
                              <div className="flex flex-wrap gap-1">
                                {val.map((v, i) => {
                                  const isGroup = typeof v === 'string' && (v.includes('Skill') || v.includes('Feature') || v.includes('Special Ability') || v.startsWith('Any '));
                                  return (
                                    <span
                                      key={i}
                                      className={`px-2 py-0.5 rounded text-xs font-mono inline-flex items-center gap-1 ${
                                        isGroup
                                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                      }`}
                                    >
                                      {isGroup && <span>📂</span>}
                                      {typeof v === 'object' ? (v.name || v.id || JSON.stringify(v)) : String(v)}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : fDef.type === 'boolean' || typeof val === 'boolean' ? (
                              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${val ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                                {val ? '✓ Yes / Enabled' : '✕ No / Disabled'}
                              </span>
                            ) : (fKey === 'body' || fKey === 'laws_of_physics' || fKey === 'history' || fDef.type === 'textarea') && String(val).includes('\n') ? (
                              <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-800 w-full overflow-x-auto">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(val)}</ReactMarkdown>
                              </div>
                            ) : (
                              <span className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">{val.toString()}</span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div>
            {isEditMode && selectedItem && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  isDeletingRef.current = true;
                  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                  onDelete(selectedItem);
                }}
                className="px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                🗑️ Delete Entry
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isEditMode ? 'Cancel' : 'Close'}
            </button>
            {isEditMode && isAdmin && (
              <button
                type="button"
                onClick={() => handleSaveModal(true)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                💾 Save Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Relational Selector Sub-Modal */}
      {activeSelectorField && (
        <UnifiedRelationalSelectorModal
          isOpen={Boolean(activeSelectorField)}
          onClose={() => setActiveSelectorField(null)}
          sourceCollection={currentConfig.fields?.[activeSelectorField]?.source || activeSelectorField}
          isMulti={currentConfig.fields?.[activeSelectorField]?.type === 'multiselect' || currentConfig.fields?.[activeSelectorField]?.manageable}
          selectedValues={Array.isArray(editFormData[activeSelectorField]) ? editFormData[activeSelectorField] : (editFormData[activeSelectorField] ? [editFormData[activeSelectorField]] : [])}
          fieldLabel={currentConfig.fields?.[activeSelectorField]?.label || activeSelectorField.replace(/_/g, ' ').toUpperCase()}
          onSelect={(newValues) => {
            setEditFormData(prev => ({ ...prev, [activeSelectorField]: newValues }));
          }}
          onItemCreated={(sourceCol, newItem) => {
            setRelationalData(prev => ({
              ...prev,
              [sourceCol]: [...(prev[sourceCol] || []), newItem]
            }));
          }}
          dbData={dbData}
          saveEntry={saveEntry}
          devMode={true}
        />
      )}

      {/* Omnicortex Ingestion Studio Modal */}
      <CodexIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        initialDatasetKey={getDatasetKeyForCollection(currentKey)}
        focusedMode={true}
        onApplyEntry={(appliedItem) => {
          const normalized = normalizeOmnicortexItem(appliedItem);
          setEditFormData(prev => ({
            ...prev,
            ...normalized,
            id: prev.id || normalized.id
          }));
          AudioService.playTerminalBeep(1400, 0.05);
        }}
      />
    </div>
  );
};
