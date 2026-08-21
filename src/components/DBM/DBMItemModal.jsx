import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UnifiedRelationalSelectorModal } from './UnifiedRelationalSelectorModal';
import { ALL_CANONICAL_SKILLS, SKILL_CATEGORY_SECTIONS } from '../../data/skillsData';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';
import { Backpack, Gem, Check, Sparkles, AlertCircle } from 'lucide-react';

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
        cpCost: parseInt(item.cpCost || item.cp || item.cost_cp || 5, 10),
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
        cpCost: parseInt(item.cpCost || item.cp || item.cost_cp || 0, 10),
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
      alert('No active story scenario found in Story Foundry. Please create or open a story scenario first.');
      return;
    }

    const cat = categoryKey || item.category || 'Gear';
    const existingContent = targetScenario.content || '';
    const itemEntry = `<li><strong>${item.name}</strong> (${cat}${item.damage ? ` • Damage: ${item.damage}` : ''}${item.armor ? ` • Armor: ${item.armor}` : ''}${item.cp || item.cpCost ? ` • CP: ${item.cp || item.cpCost}` : ''})</li>`;
    
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
    }

    AudioService.playTerminalBeep(1000, 0.05);
    setTransferStatus('scenario_success');
    setStatusMessage(`Added to ${targetScenario.title || 'Scenario Loot'}!`);
    setTimeout(() => {
      setTransferStatus(null);
      setStatusMessage('');
    }, 3000);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 my-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400" />
          <span>Cross-Module Transfer:</span>
        </span>
        {transferStatus === 'hero_success' && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold animate-pulse">
            <Check size={14} /> {statusMessage || 'Equipped!'}
          </span>
        )}
        {transferStatus === 'scenario_success' && (
          <span className="text-xs font-mono text-amber-400 flex items-center gap-1 font-bold animate-pulse">
            <Check size={14} /> {statusMessage || 'Added to Loot!'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Equip to Hero */}
        <button
          type="button"
          onClick={handleEquipToHero}
          className="flex-1 sm:flex-none py-1.5 px-3 bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          title={`Equip ${item.name} directly to ${heroName}'s inventory/abilities`}
        >
          <Backpack size={14} />
          <span>Equip to {heroName}</span>
        </button>

        {/* Add to Scenario Rewards */}
        <button
          type="button"
          onClick={handleAddToScenarioLoot}
          className="flex-1 sm:flex-none py-1.5 px-3 bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          title={`Add ${item.name} to the active Story Foundry scenario reward chest`}
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
  const [newSkillBonusState, setNewSkillBonusState] = useState({});
  const [newAttrBonusState, setNewAttrBonusState] = useState({});

  // Tab state must be declared before any early returns (Rules of Hooks)
  const [activeModalTab, setActiveModalTab] = useState('general');

  const toggleCustomInputMode = (fieldKey) => {
    setCustomInputModes(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleAddAttrBonusItem = (fieldKey) => {
    const state = newAttrBonusState[fieldKey] || { attribute: '', bonus: 1 };
    const attrName = (state.attribute || '').trim();
    const bonusVal = parseInt(state.bonus ?? 1, 10);
    if (!attrName) {
      alert('Please select an attribute or sub-attribute.');
      return;
    }

    const currentList = Array.isArray(editFormData[fieldKey])
      ? [...editFormData[fieldKey]]
      : [];

    const existingIdx = currentList.findIndex(item => 
      (typeof item === 'object' && (item.attribute || item.name || '').toLowerCase() === attrName.toLowerCase()) ||
      (typeof item === 'string' && item.toLowerCase().startsWith(attrName.toLowerCase()))
    );

    if (existingIdx >= 0) {
      currentList[existingIdx] = { attribute: attrName, bonus: bonusVal };
    } else {
      currentList.push({ attribute: attrName, bonus: bonusVal });
    }

    setEditFormData(prev => ({ ...prev, [fieldKey]: currentList }));
    setNewAttrBonusState(prev => ({
      ...prev,
      [fieldKey]: { attribute: '', bonus: 1 }
    }));
  };

  const handleRemoveAttrBonusItem = (fieldKey, index) => {
    const currentList = Array.isArray(editFormData[fieldKey]) ? [...editFormData[fieldKey]] : [];
    currentList.splice(index, 1);
    setEditFormData(prev => ({ ...prev, [fieldKey]: currentList }));
  };

  const handleAddSkillBonusItem = (fieldKey) => {
    const state = newSkillBonusState[fieldKey] || { skill: '', bonus: 1 };
    const skillName = (state.skill || '').trim();
    const bonusVal = parseInt(state.bonus || 1, 10) || 1;
    if (!skillName) {
      alert('Please select or enter a skill name.');
      return;
    }

    const currentList = Array.isArray(editFormData[fieldKey])
      ? [...editFormData[fieldKey]]
      : [];

    const existingIdx = currentList.findIndex(item => 
      (typeof item === 'object' && (item.skill || item.name || '').toLowerCase() === skillName.toLowerCase()) ||
      (typeof item === 'string' && item.toLowerCase().startsWith(skillName.toLowerCase()))
    );

    if (existingIdx >= 0) {
      currentList[existingIdx] = { skill: skillName, bonus: bonusVal };
    } else {
      currentList.push({ skill: skillName, bonus: bonusVal });
    }

    setEditFormData(prev => ({ ...prev, [fieldKey]: currentList }));
    setNewSkillBonusState(prev => ({
      ...prev,
      [fieldKey]: { skill: '', bonus: 1 }
    }));
  };

  const handleRemoveSkillBonusItem = (fieldKey, index) => {
    const currentList = Array.isArray(editFormData[fieldKey]) ? [...editFormData[fieldKey]] : [];
    currentList.splice(index, 1);
    setEditFormData(prev => ({ ...prev, [fieldKey]: currentList }));
  };

  const saveTimeoutRef = useRef(null);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isDeletingRef.current = false;
    } else {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }
  }, [isOpen]);

  const triggerAutoSave = React.useCallback(() => {
    if (!isEditMode || !isAdmin || isDeletingRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (!isDeletingRef.current) {
        onSave(false); // pass false to closeOnSuccess so it saves silently
      }
    }, 1000);
  }, [isEditMode, isAdmin, onSave]);

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

  // Reset activeModalTab when modal opens or selected item changes
  useEffect(() => {
    if (isOpen) {
      setActiveModalTab('general');
    }
  }, [isOpen, selectedItem]);

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

  // Normalize editFormData so all multiselect / manageable fields default to arrays
  useEffect(() => {
    const fields = currentConfig?.fields || DEFAULT_FIELDS;
    if (!isOpen || !fields) return;

    setEditFormData(prev => {
      let needsUpdate = false;
      const updated = { ...prev };
      Object.entries(fields).forEach(([fKey, fDef]) => {
        if (fDef.type === 'multiselect' || fDef.type === 'skill_bonus_list' || fDef.manageable) {
          if (!Array.isArray(updated[fKey])) {
            updated[fKey] = [];
            needsUpdate = true;
          }
        }
      });
      return needsUpdate ? updated : prev;
    });
  }, [isOpen, currentConfig]);

  // Recalculate Design DC whenever relevant form fields change
  useEffect(() => {
    if (!isEditMode || !isAdmin) return;
    if (['invocations', 'special_abilities', 'augmentations', 'weaponry', 'armoring', 'mecha'].includes(currentKey)) {
      let dc = 0;
      dc += (Number(editFormData.tl) || 0) * 2;
      dc += (Number(editFormData.ml) || 0) * 3;

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

      if (editFormData.design_dc !== dc) {
        setEditFormData(prev => ({ ...prev, design_dc: dc }));
      }
    }
  }, [editFormData.tl, editFormData.ml, editFormData.area, editFormData.effect, editFormData.range, editFormData.target, editFormData.component, editFormData.modes, editFormData.design_dc, isEditMode, currentKey, relationalData, isAdmin]);

  if (!isOpen) return null;

  // Aspect Subtype Dynamic Options Resolver
  const getAspectSubtypeOptions = (aspect) => {
    if (aspect === 'attribute') {
      return [
        'Any Attribute',
        'Any Primary Attribute',
        'Any Sub-Attribute',
        'Strength',
        'Might',
        'Agility',
        'Reflex',
        'Stamina',
        'Fortitude',
        'Constitution',
        'Intellect',
        'Logic',
        'Wisdom',
        'Will',
        'Charisma',
        'Etiquette'
      ];
    } else if (aspect === 'skill') {
      const skills = (relationalData['skills'] || []).map(s => s.name || s.id);
      return [
        'Any Skill',
        'Any Mental Skill',
        'Any Physical Skill',
        'Any Social Skill',
        'Any Combat Skill',
        'Any Meta Skill',
        ...skills
      ];
    } else if (aspect === 'combat') {
      return [
        'Any Combat Stat',
        'Attack',
        'Defense',
        'Initiative',
        'Movement',
        'Range',
        'Armor Piercing',
        'Critical Score',
        'Damage'
      ];
    } else if (aspect === 'feature') {
      const features = (relationalData['features'] || []).map(f => f.name || f.id);
      return [
        'Any Feature',
        'Any Ability',
        'Any Combat Feature',
        'Any Meta Feature',
        'Any General Feature',
        'Any Karma Feature',
        'Any Skill Feature',
        'Any Exotic Feature',
        ...features
      ];
    } else if (aspect === 'other') {
      return [
        'Any',
        'Health',
        'Vitality',
        'Karma',
        'Plot Points',
        'Essence',
        'Tech Level',
        'Meta Level'
      ];
    }
    return ['Any'];
  };

  // Helper for field conditional visibility
  const isFieldVisible = (fieldKey) => {
    if (fieldKey === 'base_skill') {
      return currentKey === 'skills' && Boolean(editFormData.is_specialization);
    }
    if (fieldKey === 'bonus_scope') {
      return editFormData.aspect === 'feature' || editFormData.aspect === 'skill' || editFormData.aspect === 'attribute';
    }
    if (fieldKey === 'aspect_subtype') {
      return editFormData.aspect === 'feature' || editFormData.aspect === 'skill' || editFormData.aspect === 'attribute' || editFormData.aspect === 'combat' || editFormData.aspect === 'other';
    }
    return true;
  };


  const fieldsObj = currentConfig.fields || DEFAULT_FIELDS;
  const fieldKeys = Object.keys(fieldsObj);
  const isDenseForm = fieldKeys.length > 8;

  const getFieldTabGroup = (fKey) => {
    const k = fKey.toLowerCase();
    if (['name', 'description', 'type', 'tl', 'ml', 'availability', 'rarity', 'category', 'price', 'cost_credits', 'tech_level', 'meta_level', 'size', 'movement', 'prerequisite', 'society', 'is_specialization', 'base_skill', 'subtype'].includes(k)) {
      return 'general';
    }
    if (['laws_of_physics', 'history', 'geography', 'biosphere', 'culture', 'points_of_interest', 'inhabitants', 'origin', 'practices', 'attitude', 'goals', 'social_strengths', 'social_weaknesses', 'note', 'mechanic'].includes(k)) {
      return 'narrative';
    }
    return 'mechanics';
  };

  const getSectionHeader = (fKey) => {
    if (fKey === 'inherent_attribute_modifiers' || (fKey === 'bonus_attribute_points' && !fieldsObj['inherent_attribute_modifiers'])) {
      return { title: '📊 Attribute Modifiers & Bonuses', color: 'text-cyan-400', border: 'border-cyan-500/30' };
    }
    if (fKey === 'specific_skill_bonuses' || (fKey === 'bonus_skills' && !fieldsObj['specific_skill_bonuses'])) {
      return { title: '🎯 Skills & Skill Bonuses', color: 'text-amber-400', border: 'border-amber-500/30' };
    }
    if (fKey === 'inherent_features' || (fKey === 'bonus_features' && !fieldsObj['inherent_features'])) {
      return { title: '🧬 Inherent & Bonus Features', color: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
    if (fKey === 'bonus_disciplines') {
      return { title: '🔮 Disciplines & Special Abilities', color: 'text-purple-400', border: 'border-purple-500/30' };
    }
    if (fKey === 'modifier') {
      return { title: '⚙️ Modifiers & System', color: 'text-slate-400', border: 'border-slate-700' };
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-4 sm:pt-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
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
            {!isEditMode && isAdmin && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded text-xs font-bold uppercase"
              >
                Edit
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
              ⚡ Mechanics
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
              📖 Narrative
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
                if (!isFieldVisible(fieldKey)) return null;
                if (isDenseForm && activeModalTab !== 'all' && getFieldTabGroup(fieldKey) !== activeModalTab) {
                  return null;
                }

                const fieldDef = currentConfig.fields[fieldKey];
                const label = fieldDef.label || fieldKey.replace(/_/g, ' ').toUpperCase();
                const isFullWidth = fieldDef.type === 'textarea' || fieldDef.type === 'json_list' || fieldDef.type === 'skill_bonus_list' || fieldDef.type === 'attribute_bonus_list' || fieldDef.type === 'multiselect' || fieldDef.manageable;
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

                    {/* INLINE CUSTOM ENTRY MODE FOR ALL FIELDS */}
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
                              handleAddCustomValue(fieldKey, fieldDef.type === 'multiselect' || fieldDef.manageable);
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-400"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomValue(fieldKey, fieldDef.type === 'multiselect' || fieldDef.manageable)}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs uppercase shrink-0 cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ) : (fieldDef.manageable || fieldDef.type === 'multiselect') && fieldDef.source ? (
                      /* MANAGEABLE / MULTISELECT RELATIONAL FIELD TRIGGER */
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[28px] items-center">
                          {Array.isArray(editFormData[fieldKey]) && editFormData[fieldKey].length > 0 ? (
                            editFormData[fieldKey].map(val => {
                              const isGroup = typeof val === 'string' && (val.includes('Skill') || val.includes('Feature') || val.includes('Special Ability') || val.startsWith('Any '));
                              return (
                                <span
                                  key={val}
                                  className={`px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1 ${
                                    isGroup
                                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                  }`}
                                >
                                  {isGroup && <span>📂</span>}
                                  {val}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = editFormData[fieldKey].filter(v => v !== val);
                                      setEditFormData({ ...editFormData, [fieldKey]: updated });
                                    }}
                                    className={`${isGroup ? 'text-amber-400 hover:text-white' : 'text-cyan-400 hover:text-white'} font-bold ml-1 cursor-pointer`}
                                  >✕</button>
                                </span>
                              );
                            })
                          ) : typeof editFormData[fieldKey] === 'string' && editFormData[fieldKey] ? (
                            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono">
                              {editFormData[fieldKey]}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600 italic">No {label.toLowerCase()} selected</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSelectorField(fieldKey)}
                          className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
                        >
                          📋 Select {label}
                        </button>
                      </div>
                    ) : fieldDef.type === 'textarea' ? (
                      <textarea
                        value={editFormData[fieldKey] || ''}
                        onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                      />
                    ) : fieldDef.type === 'select' ? (
                      <div className="flex gap-2 items-center">
                        <select
                          value={editFormData[fieldKey] || ''}
                          onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 flex-1"
                        >
                          <option value="">-- Select --</option>
                          {(fieldKey === 'aspect_subtype'
                            ? getAspectSubtypeOptions(editFormData.aspect)
                            : fieldDef.source
                            ? (relationalData[fieldDef.source] || [])
                            : (fieldDef.options || [])
                          ).map(opt => {
                            const val = typeof opt === 'string' || typeof opt === 'number' ? opt : (opt.name || opt.id);
                            return <option key={val} value={val}>{val}</option>;
                          })}
                        </select>
                        {fieldDef.source && (
                          <button
                            type="button"
                            onClick={() => setActiveSelectorField(fieldKey)}
                            className="px-2.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            title={`Select or Create ${label}`}
                          >
                            📋
                          </button>
                        )}
                      </div>
                    ) : fieldDef.type === 'attribute_bonus_list' ? (
                      /* INHERENT ATTRIBUTE MODIFIERS (SET VALUES) LIST EDITOR */
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-3">
                        {/* List of existing attribute modifiers */}
                        <div className="space-y-1.5">
                          {Array.isArray(editFormData[fieldKey]) && editFormData[fieldKey].length > 0 ? (
                            editFormData[fieldKey].map((item, idx) => {
                              const aName = typeof item === 'object' ? (item.attribute || item.name || '') : String(item).split(/[:+(]/)[0].trim();
                              const aVal = typeof item === 'object' ? (item.bonus ?? item.value ?? 1) : (parseInt(String(item).replace(/[^0-9-]/g, ''), 10) || 1);
                              const isPositive = aVal >= 0;
                              return (
                                <div key={idx} className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-cyan-400 font-bold">⚡ {aName}</span>
                                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                                      isPositive
                                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                    }`}>
                                      {isPositive ? `+${aVal}` : aVal}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttrBonusItem(fieldKey, idx)}
                                    className="text-slate-500 hover:text-rose-400 font-bold p-1 cursor-pointer"
                                    title="Remove modifier"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-600 italic">No inherent attribute modifiers added yet.</p>
                          )}
                        </div>

                        {/* Add new attribute modifier row */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-slate-800/80">
                          <select
                            value={(newAttrBonusState[fieldKey]?.attribute) || ''}
                            onChange={e => setNewAttrBonusState(prev => ({
                              ...prev,
                              [fieldKey]: { ...(prev[fieldKey] || { bonus: 1 }), attribute: e.target.value }
                            }))}
                            className="flex-1 bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Select Attribute / Sub-Attribute --</option>
                            {CANONICAL_ATTRIBUTES_LIST.map(sec => (
                              <optgroup key={sec.group} label={`${sec.icon} ${sec.group}`}>
                                {sec.pairs.map(pair => (
                                  <React.Fragment key={pair.primary.name}>
                                    <option value={pair.primary.name}>
                                      {pair.primary.name} ({pair.primary.type})
                                    </option>
                                    {pair.subAttributes.map(sub => (
                                      <option key={sub.name} value={sub.name}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;↳ {sub.name} ({sub.type} of {pair.primary.name})
                                      </option>
                                    ))}
                                  </React.Fragment>
                                ))}
                              </optgroup>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-slate-400 font-mono">Mod</span>
                            <input
                              type="number"
                              min="-10"
                              max="20"
                              value={(newAttrBonusState[fieldKey]?.bonus) ?? 1}
                              onChange={e => setNewAttrBonusState(prev => ({
                                ...prev,
                                [fieldKey]: { ...(prev[fieldKey] || { attribute: '' }), bonus: parseInt(e.target.value, 10) || 0 }
                              }))}
                              className="w-16 bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-500 font-mono text-center"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddAttrBonusItem(fieldKey)}
                            disabled={!((newAttrBonusState[fieldKey]?.attribute) || '').trim()}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
                          >
                            + Add Modifier
                          </button>
                        </div>
                      </div>
                    ) : fieldDef.type === 'skill_bonus_list' ? (
                      /* SPECIFIC SKILL BONUSES (SET VALUES) LIST EDITOR */
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-3">
                        {/* List of existing skill bonuses */}
                        <div className="space-y-1.5">
                          {Array.isArray(editFormData[fieldKey]) && editFormData[fieldKey].length > 0 ? (
                            editFormData[fieldKey].map((item, idx) => {
                              const sName = typeof item === 'object' ? (item.skill || item.name || '') : String(item).split(/[:+(]/)[0].trim();
                              const sVal = typeof item === 'object' ? (item.bonus ?? item.value ?? 1) : (parseInt(String(item).replace(/[^0-9-]/g, ''), 10) || 1);
                              return (
                                <div key={idx} className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-amber-400 font-bold">⚡ {sName}</span>
                                    <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded font-mono font-bold">
                                      +{sVal}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkillBonusItem(fieldKey, idx)}
                                    className="text-slate-500 hover:text-rose-400 font-bold p-1 cursor-pointer"
                                    title="Remove bonus"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-600 italic">No specific skill bonuses added yet.</p>
                          )}
                        </div>

                        {/* Add new skill bonus row */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-slate-800/80">
                          <select
                            value={(newSkillBonusState[fieldKey]?.skill) || ''}
                            onChange={e => setNewSkillBonusState(prev => ({
                              ...prev,
                              [fieldKey]: { ...(prev[fieldKey] || { bonus: 1 }), skill: e.target.value }
                            }))}
                            className="flex-1 bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                          >
                            <option value="">-- Select Skill to Add --</option>
                            {SKILL_CATEGORY_SECTIONS.map(section => (
                              <optgroup key={section.key} label={section.label}>
                                {section.skills.map(s => (
                                  <option key={s.name} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                            {(() => {
                              const dynamicSkills = relationalData['skills'] || dbData['skills'] || [];
                              const canonicalNames = new Set(ALL_CANONICAL_SKILLS.map(s => s.name.toLowerCase()));
                              const customOnly = dynamicSkills.filter(s => {
                                const name = s.name || s.id;
                                return name && !canonicalNames.has(name.toLowerCase());
                              });

                              if (customOnly.length === 0) return null;

                              return (
                                <optgroup label="⚙️ Custom Skills">
                                  {customOnly.map(s => {
                                    const name = s.name || s.id;
                                    return (
                                      <option key={name} value={name}>
                                        {name}
                                      </option>
                                    );
                                  })}
                                </optgroup>
                              );
                            })()}
                          </select>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-slate-400 font-mono">+</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={(newSkillBonusState[fieldKey]?.bonus) ?? 1}
                              onChange={e => setNewSkillBonusState(prev => ({
                                ...prev,
                                [fieldKey]: { ...(prev[fieldKey] || { skill: '' }), bonus: parseInt(e.target.value, 10) || 1 }
                              }))}
                              className="w-16 bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 font-mono text-center"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddSkillBonusItem(fieldKey)}
                            disabled={!((newSkillBonusState[fieldKey]?.skill) || '').trim()}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
                          >
                            + Add Bonus
                          </button>
                        </div>
                      </div>
                    ) : fieldDef.type === 'multiselect' ? (
                      <select
                        multiple
                        value={editFormData[fieldKey] || []}
                        onChange={e => {
                          const vals = Array.from(e.target.selectedOptions, option => option.value);
                          setEditFormData({ ...editFormData, [fieldKey]: vals });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 min-h-[80px]"
                      >
                        {(fieldDef.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
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
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-2">{selectedItem?.name}</h3>
              {((Array.isArray(selectedItem?.tags) && selectedItem.tags.length > 0) || (typeof selectedItem?.tags === 'string' && selectedItem.tags.trim())) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(Array.isArray(selectedItem.tags) ? selectedItem.tags : selectedItem.tags.split(',').map(t => t.trim())).filter(Boolean).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                      <span>🏷️</span> {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-slate-300 whitespace-pre-line">{selectedItem?.description || 'No description available.'}</p>
              
              {/* 1-Click Cross-Module Item Importer & Exporter Transfer Bar (Plan 12) */}
              <DBMItemTransferBar item={selectedItem} categoryKey={currentKey} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {Object.keys(currentConfig.fields || {}).map(fKey => {
                  if (fKey === 'name' || fKey === 'description') return null;
                  if (isDenseForm && activeModalTab !== 'all' && getFieldTabGroup(fKey) !== activeModalTab) {
                    return null;
                  }
                  const val = selectedItem?.[fKey];
                  if (val === undefined || val === null || val === '') return null;
                  const fDef = currentConfig.fields[fKey];
                  const label = fDef.label || fKey.replace(/_/g, ' ').toUpperCase();
                  const isFullWidth = fDef.type === 'textarea' || fDef.type === 'json_list' || fDef.type === 'skill_bonus_list' || fDef.type === 'attribute_bonus_list' || fDef.type === 'multiselect' || fDef.manageable;
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(val) && fDef.type === 'attribute_bonus_list' ? (
                            val.map((v, i) => {
                              const aName = typeof v === 'object' ? (v.attribute || v.name || '') : String(v).split(/[:+(]/)[0].trim();
                              const aVal = typeof v === 'object' ? (v.bonus ?? v.value ?? 1) : (parseInt(String(v).replace(/[^0-9-]/g, ''), 10) || 1);
                              const isPositive = aVal >= 0;
                              return (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded text-xs font-mono inline-flex items-center gap-1.5 ${
                                    isPositive
                                      ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50'
                                      : 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                                  }`}
                                >
                                  <span>⚡</span>
                                  <span className="font-bold">{aName}</span>
                                  <span className="font-extrabold">{isPositive ? `+${aVal}` : aVal}</span>
                                </span>
                              );
                            })
                          ) : Array.isArray(val) && fDef.type === 'skill_bonus_list' ? (
                            val.map((v, i) => {
                              const sName = typeof v === 'object' ? (v.skill || v.name || '') : String(v).split(/[:+(]/)[0].trim();
                              const sVal = typeof v === 'object' ? (v.bonus ?? v.value ?? 1) : (parseInt(String(v).replace(/[^0-9-]/g, ''), 10) || 1);
                              return (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-xs font-mono inline-flex items-center gap-1.5 bg-amber-950/90 text-amber-300 border border-amber-500/50"
                                >
                                  <span>⚡</span>
                                  <span className="font-bold">{sName}</span>
                                  <span className="text-amber-400 font-extrabold">+{sVal}</span>
                                </span>
                              );
                            })
                          ) : Array.isArray(val) ? (
                          val.map((v, i) => {
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
                                {v}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-cyan-300 font-mono">{val.toString()}</span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
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
                className="px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded text-xs font-bold uppercase tracking-wider transition-colors"
              >
                🗑️ Delete Entry
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              {isEditMode ? 'Cancel' : 'Close'}
            </button>
            {isEditMode && isAdmin && (
              <button
                type="button"
                onClick={() => onSave(true)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg transition-colors"
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
    </div>
  );
};
