import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Save, 
  X, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Bot, 
  Trash2, 
  Calculator, 
  HelpCircle,
  Wrench,
  BookOpen,
  ChevronRight,
  Sparkles,
  Sliders,
  Layers,
  Activity,
  Coins,
  Shield,
  Zap,
  Code,
  Copy,
  ExternalLink,
  Plus,
  Compass,
  FileText,
  Crosshair,
  Dna,
  Flag,
  Flame
} from 'lucide-react';

// Specialized DBM Sub-Widgets
import { CostEconomyWidget } from '../DBM/widgets/CostEconomyWidget';
import { UniversalModifiersWidget } from '../DBM/widgets/UniversalModifiersWidget';
import { ModificationsWidget } from '../DBM/widgets/ModificationsWidget';
import { CriticalDetailsWidget } from '../DBM/widgets/CriticalDetailsWidget';
import { SocketsAllocationWidget } from '../DBM/widgets/SocketsAllocationWidget';
import { UnifiedRelationalSelectorModal } from '../DBM/UnifiedRelationalSelectorModal';
import {
  AttributeModifiersSelector,
  SkillBonusesSelector,
  FeaturesSelector,
  SpeciesTraitsChips,
  MovementModeSelector,
  SocialStigmaSelector
} from '../DBM/widgets/OmnicortexFieldSelector';
import { categoryConfig } from '../DBM/categoryConfig';

// Contexts & Services
import { useDBM } from '../../context/DBMContext';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';

// Engines & Codex Core
import { useComputedState } from '../../pages/Codex/hooks/useComputedState';
import {
  ComputedOutputPanel,
  UDUCapacityMeter,
  EquipmentCategoryConfigurator,
  WeaponModStacker,
  ArmorCoverageSelector,
  AugmentationNodeConfigurator,
  MechaChassisConfigurator,
  ArchitectureBlueprintConfigurator,
  SpeciesTraitSelector,
  ModularStatBlockConfigurator,
  CompanionPackageSelector,
  InvocationParameterConfigurator,
  MetaTechImbuementConfigurator,
  PlanetaryDesignConfigurator
} from '../../pages/Codex/components';

import * as econEngine from '../../engines/tangentEconEngine';
import * as techEngine from '../../engines/tangentTechEngine';
import * as uduEngine from '../../engines/tangentUDUEngine';
import * as itemEngines from '../../engines/tangentItemEngines';
import * as complexEngines from '../../engines/tangentComplexEngines';
import * as entityEngines from '../../engines/tangentEntityEngines';
import * as planetaryEngine from '../../engines/tangentPlanetaryEngine';
import { getSizeTierIndex } from '../../engines/tangentConstants';

import { CodexTooltip } from '../UI/CodexTooltip';
import { CODEX_DATASET_GUIDANCE } from '../../pages/Codex/codexDatasetGuidance';
import { 
  getMatrixIdForAssetKey, 
  adaptItemToCodexFormData, 
  adaptCodexToOmnicortexItem 
} from '../../pages/Codex/codexAssetBridge';
import { 
  getMatrixById,
  isPropertyMatrix,
  hasSocketsAndUDU,
  hasDamageOrEffect,
  hasModifications
} from '../../pages/Codex/codexConfig';
import { CodexAiSynthesizerModal } from '../../pages/Codex/CodexAiSynthesizerModal';
import { CodexIngestionModal } from '../../pages/Codex/CodexIngestionModal';
import {
  normalizeOmnicortexItem,
  exportOmnicortexItem,
  isPropertyCategory,
  getItemCosts,
  getItemModifiers,
  getItemModifications,
  getItemCriticalDetails,
  getItemSockets
} from '../../utils/tangentSchemaAdapters';

const CUSTOM_COMPONENTS = {
  EquipmentCategoryConfigurator,
  WeaponModStacker,
  ArmorCoverageSelector,
  AugmentationNodeConfigurator,
  MechaChassisConfigurator,
  ArchitectureBlueprintConfigurator,
  SpeciesTraitSelector,
  ModularStatBlockConfigurator,
  CompanionPackageSelector,
  InvocationParameterConfigurator,
  MetaTechImbuementConfigurator,
  PlanetaryDesignConfigurator
};

/**
 * DBM Transfer Bar component embedded directly inside Asset Studio.
 */
export const StudioTransferBar = ({ item, categoryKey }) => {
  const folio = useFolio() || {};
  const { activeCharacter, activeHeroName, addItemToInventory, addAbility } = folio;
  const story = useStory() || {};
  const { universeState, updateScenario, activeScenarioId } = story;

  const [transferStatus, setTransferStatus] = useState(null);
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

    if (updateScenario && targetScenario.id) {
      updateScenario(targetScenario.id, {
        content: updatedContent,
        updatedAt: new Date().toISOString()
      });
      AudioService.playTerminalBeep(1300, 0.05);
      setTransferStatus('scenario_success');
      setStatusMessage(`Added to ${targetScenario.title || 'Scenario'} Loot!`);
      setTimeout(() => {
        setTransferStatus(null);
        setStatusMessage('');
      }, 3000);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1">
      <button
        type="button"
        onClick={handleEquipToHero}
        className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
        title={`Equip directly to ${heroName} in Persona Folio`}
      >
        <Sparkles size={11} className="text-cyan-400" />
        <span>Equip to {heroName}</span>
      </button>

      <button
        type="button"
        onClick={handleAddToScenarioLoot}
        className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
        title="Add to active ADE Story Foundry scenario loot cache"
      >
        <Coins size={11} className="text-amber-400" />
        <span className="hidden sm:inline">Scenario Loot</span>
      </button>

      {statusMessage && (
        <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1 animate-fade-in">
          ✓ {statusMessage}
        </span>
      )}
    </div>
  );
};

const SPECS_FIELD_NAMES = new Set([
  'name',
  'title',
  'designation',
  'category',
  'type',
  'species_type',
  'parent_species',
  'faction_type',
  'archetype',
  'prominent_species',
  'capital_world',
  'homeworld',
  'style',
  'faction_skin',
  'frame_type',
  'footprint',
  'height_class',
  'size',
  'sizeCategory',
  'bossType',
  'competencyRole',
  'tl',
  'ml',
  'tech_level',
  'meta_level',
  'rarity',
  'availability',
  'security_level',
  'power_grid',
  'primary_purpose',
  'government_type',
  'leadership',
  'succession',
  'starClass',
  'orbitalZone',
  'planet_type',
  'origin',
  'creator',
  'classification',
  'quality'
]);

export const GENERAL_SPECS_FIELDS = Array.from(SPECS_FIELD_NAMES);
export { SPECS_FIELD_NAMES };

const NARRATIVE_FIELD_NAMES = new Set([
  'description',
  'overview',
  'body',
  'lore',
  'history',
  'note',
  'mechanic',
  'core_beliefs',
  'social_structure',
  'relationship_to_others',
  'motto',
  'colloquialisms',
  'scene_vignettes',
  'expansion_modules',
  'quirks',
  'adventureHooks',
  'image_prompt',
  'context_palette',
  'lighting_mood',
  'setting_style'
]);

const WIDGET_FIELD_NAMES = new Set([
  'sockets',
  'critical_details',
  'modifications',
  'modifiers',
  'costs'
]);

const NON_PROPERTY_EXCLUDED_FIELDS = new Set([
  'cost',
  'credits',
  'cost_credits',
  'price',
  'craft_dc',
  'design_dc',
  'dc',
  'material_cost',
  'materials',
  'complexity_tier',
  'crafting_days',
  'tsc_market_value',
  'market_value',
  'component_slots',
  'components',
  'total_sockets',
  'sockets_used',
  'socket_tier',
  'udu_tier',
  'udu',
  'power_consumption',
  'hardpoints',
  'hull_type',
  'weight',
  'load'
]);

const SPECIES_EXCLUDED_FIELDS = new Set([
  'prerequisite',
  'prerequisites',
  ...NON_PROPERTY_EXCLUDED_FIELDS
]);

const HARDWARE_ONLY_FIELDS = NON_PROPERTY_EXCLUDED_FIELDS;

const formatFieldValue = (item) => {
  if (item === null || item === undefined) return '';
  if (typeof item !== 'object') return String(item);
  if (item.name) return item.name;
  if (item.title) return item.title;
  if (item.label) return item.label;
  if (item.skill) return `${item.skill} ${Number(item.bonus ?? item.value ?? 0) >= 0 ? '+' : ''}${item.bonus ?? item.value ?? 0}`;
  if (item.attribute) return `${item.attribute} ${Number(item.bonus ?? item.value ?? 0) >= 0 ? '+' : ''}${item.bonus ?? item.value ?? 0}`;
  if (item.id) return item.id;
  try {
    return JSON.stringify(item);
  } catch {
    return String(item);
  }
};

/**
 * AssetStudio
 * The singular, authoritative, unified Studio consolidating all manage modals,
 * sub-configurators, interactive widgets, relational selectors, and live rulebook guidance.
 */
export const AssetStudio = ({
  isOpen = true,
  onClose = null,
  isModal = false,
  matrix: propMatrix = null,
  initialData = null,
  selectedItem = null,
  currentKey = null,
  currentConfig = null,
  isEditMode: propIsEditMode = true,
  setIsEditMode = null,
  onSaveComplete = null,
  onSave = null,
  onDelete = null,
  onDuplicate = null,
  devMode = true,
  isAdmin = true,
  saveEntry: directSaveEntry = null,
  dbData: propDbData = null
}) => {
  const { dbData: contextDbData, saveEntry: contextSaveEntry, deleteEntry: contextDeleteEntry } = useDBM() || {};
  const { currentUser } = useAuth();
  const dbData = propDbData || contextDbData || {};
  const saveEntry = directSaveEntry || contextSaveEntry;

  // Resolve target item and key
  const activeItem = initialData || selectedItem || {};
  const resolvedKey = currentKey || activeItem.category || activeItem.collection || 'species';

  // Resolve canonical matrix
  const resolvedMatrix = useMemo(() => {
    if (propMatrix) return propMatrix;
    const mId = getMatrixIdForAssetKey(resolvedKey);
    if (mId) return getMatrixById(mId);
    if (!isPropertyCategory(resolvedKey)) {
      return getMatrixById('features');
    }
    return getMatrixById('equipment');
  }, [propMatrix, resolvedKey]);

  const matrix = resolvedMatrix || (isPropertyCategory(resolvedKey) ? getMatrixById('equipment') : getMatrixById('features'));
  const guidance = useMemo(() => CODEX_DATASET_GUIDANCE[matrix.id] || null, [matrix.id]);

  const activeCategoryConfig = useMemo(() => {
    return currentConfig || categoryConfig[resolvedKey] || categoryConfig[matrix.targetCollection] || null;
  }, [currentConfig, resolvedKey, matrix.targetCollection]);

  // Extract all specs/identity fields relative to current dataset
  const specsFields = useMemo(() => {
    const fieldsMap = new Map();
    const isSpecies = matrix.id === 'species';
    const shouldExclude = (fName) => {
      if (isSpecies && SPECIES_EXCLUDED_FIELDS.has(fName)) return true;
      if (!matrix.isProperty && NON_PROPERTY_EXCLUDED_FIELDS.has(fName)) return true;
      return false;
    };

    if (matrix?.fields) {
      matrix.fields.forEach(f => {
        if (SPECS_FIELD_NAMES.has(f.name) && !shouldExclude(f.name)) {
          fieldsMap.set(f.name, f);
        }
      });
    }
    if (activeCategoryConfig?.fields) {
      Object.entries(activeCategoryConfig.fields).forEach(([fName, fDef]) => {
        if (SPECS_FIELD_NAMES.has(fName) && !shouldExclude(fName) && !fieldsMap.has(fName)) {
          fieldsMap.set(fName, {
            name: fName,
            label: fDef.label || fName.replace(/_/g, ' ').toUpperCase(),
            type: fDef.type || 'text',
            options: fDef.options,
            min: fDef.min,
            max: fDef.max,
            placeholder: fDef.placeholder || `Enter ${fName.replace(/_/g, ' ')}...`,
            helpText: fDef.helpText,
            required: fDef.required
          });
        }
      });
    }
    return Array.from(fieldsMap.values());
  }, [matrix, activeCategoryConfig]);

  // Extract all game mechanics fields relative to current dataset
  const relativeMechanicsFields = useMemo(() => {
    const fieldsMap = new Map();
    const isSpecies = matrix.id === 'species';

    const shouldExclude = (fName) => {
      if (SPECS_FIELD_NAMES.has(fName) || NARRATIVE_FIELD_NAMES.has(fName) || WIDGET_FIELD_NAMES.has(fName)) return true;
      if (isSpecies && SPECIES_EXCLUDED_FIELDS.has(fName)) return true;
      if (!matrix.isProperty && NON_PROPERTY_EXCLUDED_FIELDS.has(fName)) return true;
      return false;
    };

    // 1. Gather from matrix.fields
    if (matrix?.fields) {
      matrix.fields.forEach(f => {
        if (!shouldExclude(f.name)) {
          fieldsMap.set(f.name, f);
        }
      });
    }

    // 2. Gather from activeCategoryConfig.fields
    if (activeCategoryConfig?.fields) {
      Object.entries(activeCategoryConfig.fields).forEach(([fName, fDef]) => {
        if (!shouldExclude(fName) && !fieldsMap.has(fName)) {
          fieldsMap.set(fName, {
            name: fName,
            label: fDef.label || fName.replace(/_/g, ' ').toUpperCase(),
            type: fDef.type || 'text',
            options: fDef.options,
            min: fDef.min,
            max: fDef.max,
            placeholder: fDef.placeholder || `Enter ${fName.replace(/_/g, ' ')}...`,
            helpText: fDef.helpText,
            required: fDef.required
          });
        }
      });
    }

    return Array.from(fieldsMap.values());
  }, [matrix, activeCategoryConfig]);

  // View & Edit mode state
  const [isEditMode, setLocalIsEditMode] = useState(propIsEditMode);
  useEffect(() => {
    setLocalIsEditMode(propIsEditMode);
  }, [propIsEditMode]);

  const handleToggleEditMode = (val) => {
    setLocalIsEditMode(val);
    if (setIsEditMode) setIsEditMode(val);
  };

  // Studio Sub-Tab navigation state: 'specs' | 'mechanics' | 'narrative' | 'relational' | 'inspector'
  const [activeStudioTab, setActiveStudioTab] = useState('specs');
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [activeSelectorField, setActiveSelectorField] = useState(null);
  const [hoveredRailItem, setHoveredRailItem] = useState(null);

  // Form Data State
  const [formData, setFormData] = useState(() => {
    return adaptItemToCodexFormData(activeItem, matrix);
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize when activeItem or matrix changes
  useEffect(() => {
    if (activeItem && Object.keys(activeItem).length > 0) {
      setFormData(adaptItemToCodexFormData(activeItem, matrix));
    }
  }, [activeItem, matrix]);

  // Reactive live computed state hook
  const { computedValues, isCalculating } = useComputedState(matrix, formData);

  const handleFieldChange = (name, value) => {
    setFormData(prev => {
      const next = { ...prev, [name]: value };

      // Two-way synchronization for species modifiers
      if (matrix.id === 'species') {
        if (name === 'attribute_modifiers' || name === 'inherent_attribute_modifiers') {
          const attrList = Array.isArray(value) ? value : [];
          next.attribute_modifiers = attrList;
          next.inherent_attribute_modifiers = attrList;
          const otherMods = (next.modifiers || []).filter(m => m.type !== 'attribute');
          const newAttrMods = attrList.map(a => ({
            target: a.attribute || a.target || a.name || 'Strength',
            type: 'attribute',
            value: Number(a.bonus ?? a.value ?? 1),
            mode: 'inherent'
          }));
          next.modifiers = [...otherMods, ...newAttrMods];
        } else if (name === 'specific_skill_bonuses') {
          const skillList = Array.isArray(value) ? value : [];
          next.specific_skill_bonuses = skillList;
          const otherMods = (next.modifiers || []).filter(m => m.type !== 'skill');
          const newSkillMods = skillList.map(s => ({
            target: s.skill || s.target || s.name || 'Athletics',
            type: 'skill',
            value: Number(s.bonus ?? s.value ?? 1),
            mode: 'inherent'
          }));
          next.modifiers = [...otherMods, ...newSkillMods];
        } else if (name === 'inherent_features') {
          const featList = Array.isArray(value) ? value : [];
          next.inherent_features = featList;
          const otherMods = (next.modifiers || []).filter(m => m.type !== 'feature' || m.mode !== 'inherent');
          const newFeatMods = featList.map(f => ({
            target: typeof f === 'object' ? (f.name || f.id) : String(f),
            type: 'feature',
            value: 1,
            mode: 'inherent'
          }));
          next.modifiers = [...otherMods, ...newFeatMods];
        } else if (name === 'recommended_features') {
          const recList = Array.isArray(value) ? value : [];
          next.recommended_features = recList;
          const otherMods = (next.modifiers || []).filter(m => m.type !== 'feature' || m.mode !== 'recommended');
          const newRecMods = recList.map(f => ({
            target: typeof f === 'object' ? (f.name || f.id) : String(f),
            type: 'feature',
            value: 1,
            mode: 'recommended'
          }));
          next.modifiers = [...otherMods, ...newRecMods];
        } else if (name === 'modifiers') {
          // When UniversalModifiersWidget updates modifiers, synchronize back into specific fields
          const mods = Array.isArray(value) ? value : [];
          next.modifiers = mods;
          next.attribute_modifiers = mods.filter(m => m.type === 'attribute').map(m => ({
            attribute: m.target,
            bonus: Number(m.value) || 1
          }));
          next.inherent_attribute_modifiers = next.attribute_modifiers;
          next.specific_skill_bonuses = mods.filter(m => m.type === 'skill').map(m => ({
            skill: m.target,
            bonus: Number(m.value) || 1
          }));
          next.inherent_features = mods.filter(m => m.type === 'feature' && m.mode === 'inherent').map(m => m.target);
          next.recommended_features = mods.filter(m => m.type === 'feature' && m.mode === 'recommended').map(m => m.target);
        }
      }

      return next;
    });
  };

  const handleResetForm = () => {
    AudioService.playTerminalBeep(900, 0.03);
    setFormData(adaptItemToCodexFormData(null, matrix));
    setErrorMessage('');
  };

  // Save Handshake
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMessage('A valid designation or name is required.');
      AudioService.playErrorSound();
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      // Compute final derived stats via computeOnSave
      let derivedComputed = {};
      if (typeof matrix.computeOnSave === 'function') {
        derivedComputed = matrix.computeOnSave(formData, {
          econ: econEngine,
          tech: techEngine,
          udu: uduEngine,
          items: itemEngines,
          complex: complexEngines,
          entities: entityEngines,
          planetary: planetaryEngine
        });
      }

      const mergedComputed = {
        ...computedValues,
        ...derivedComputed
      };

      // Create normalized payload
      const adaptedPayload = adaptCodexToOmnicortexItem(formData, mergedComputed, matrix);
      const targetCol = matrix.targetCollection || resolvedKey;
      const docId = adaptedPayload.id || `entry_${Date.now()}`;

      // Commit to Firestore collection
      if (saveEntry) {
        await saveEntry(adaptedPayload, targetCol);
      } else {
        await setDoc(doc(db, targetCol, docId), adaptedPayload, { merge: true });
      }

      AudioService.playTerminalBeep(1400, 0.05);
      setSaveSuccess(true);

      // Invoke parent handlers
      if (onSaveComplete) onSaveComplete(adaptedPayload);
      if (onSave) onSave(true, adaptedPayload);

      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (err) {
      setErrorMessage(`Commit error: ${err.message}`);
      AudioService.playErrorSound();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handshake
  const handleDelete = async () => {
    const itemName = formData.name || activeItem.name || 'this entry';
    const confirmed = await confirmTypedDeletion(
      itemName,
      `delete the ${matrix.name} record "${itemName}" from Omnicortex`
    );

    if (confirmed) {
      AudioService.playTerminalBeep(700, 0.04);
      const targetCol = matrix.targetCollection || resolvedKey;
      const targetId = formData.id || activeItem.id;

      if (contextDeleteEntry && targetId) {
        await contextDeleteEntry(targetId, targetCol);
      } else if (targetId) {
        try {
          await deleteDoc(doc(db, targetCol, targetId));
        } catch (err) {
          console.warn('Failed to delete Firestore document:', err);
        }
      }

      if (onDelete) onDelete(activeItem || formData);
      if (onClose) onClose();
    }
  };

  if (isModal && !isOpen) return null;

  const Icon = matrix.icon;
  const isProperty = Boolean(matrix.isProperty);
  const showSocketsAndUDU = Boolean(matrix.hasSocketsAndUDU);
  const showDamageOrEffect = Boolean(matrix.hasDamageOrEffect);
  const showModifications = Boolean(matrix.hasModifications);
  const CustomConfigurator = matrix.customComponent ? CUSTOM_COMPONENTS[matrix.customComponent] : null;

  // Contextual labels & icons for Tab 2 depending on dataset
  const mechanicsTabConfig = useMemo(() => {
    const mId = matrix.id;
    if (mId === 'factions') {
      return {
        label: 'Doctrine & Assets',
        sublabel: 'Perks, Military & Economy',
        icon: Flag,
        color: '#10b981',
        activeBg: 'bg-emerald-950/80',
        activeBorder: 'border-emerald-500/60'
      };
    }
    if (mId === 'species') {
      return {
        label: 'Genetics & Traits',
        sublabel: '20 CP Budget & Abilities',
        icon: Dna,
        color: '#38bdf8',
        activeBg: 'bg-sky-950/80',
        activeBorder: 'border-sky-500/60'
      };
    }
    if (mId === 'invocation') {
      return {
        label: 'Manifestation',
        sublabel: 'Surge, Backlash & DC',
        icon: Sparkles,
        color: '#a855f7',
        activeBg: 'bg-purple-950/80',
        activeBorder: 'border-purple-500/60'
      };
    }
    if (mId === 'weaponry') {
      return {
        label: 'Weapon Mechanics',
        sublabel: 'Sockets, Mods & Crits',
        icon: Crosshair,
        color: '#ef4444',
        activeBg: 'bg-red-950/80',
        activeBorder: 'border-red-500/60'
      };
    }
    if (mId === 'armor') {
      return {
        label: 'Defense & Plating',
        sublabel: 'Coverage, Sockets & Mods',
        icon: Shield,
        color: '#3b82f6',
        activeBg: 'bg-blue-950/80',
        activeBorder: 'border-blue-500/60'
      };
    }
    if (showSocketsAndUDU) {
      return {
        label: 'Hardware & Sockets',
        sublabel: 'UDU & Configurations',
        icon: Cpu,
        color: '#f59e0b',
        activeBg: 'bg-amber-950/80',
        activeBorder: 'border-amber-500/60'
      };
    }
    return {
      label: 'Game Mechanics',
      sublabel: 'Rules & Systems',
      icon: Zap,
      color: '#f59e0b',
      activeBg: 'bg-amber-950/80',
      activeBorder: 'border-amber-500/60'
    };
  }, [matrix.id, showSocketsAndUDU]);

  const navRailItems = useMemo(() => {
    const items = [
      {
        id: 'specs',
        label: 'General Specs',
        shortLabel: 'SPECS',
        sublabel: 'Registry Dossier',
        icon: FileText,
        color: '#06b6d4',
        activeBg: 'bg-cyan-950/80',
        activeBorder: 'border-cyan-500/60'
      },
      {
        id: 'mechanics',
        label: mechanicsTabConfig.label,
        shortLabel: matrix.id === 'species' ? 'GENETICS' : 'MECHANICS',
        sublabel: mechanicsTabConfig.sublabel,
        icon: mechanicsTabConfig.icon,
        color: mechanicsTabConfig.color,
        activeBg: mechanicsTabConfig.activeBg,
        activeBorder: mechanicsTabConfig.activeBorder
      },
      {
        id: 'narrative',
        label: 'Narrative & Lore',
        shortLabel: 'LORE',
        sublabel: 'History & Operations',
        icon: BookOpen,
        color: '#c084fc',
        activeBg: 'bg-purple-950/80',
        activeBorder: 'border-purple-500/60'
      },
      {
        id: 'relational',
        label: 'Relational Links',
        shortLabel: 'RELATIONS',
        sublabel: 'Entity Connections',
        icon: Compass,
        color: '#3b82f6',
        activeBg: 'bg-blue-950/80',
        activeBorder: 'border-blue-500/60'
      }
    ];

    if (devMode) {
      items.push({
        id: 'inspector',
        label: 'Dev Inspector',
        shortLabel: 'INSPECTOR',
        sublabel: 'Raw JSON Schema',
        icon: Code,
        color: '#10b981',
        activeBg: 'bg-emerald-950/80',
        activeBorder: 'border-emerald-500/60'
      });
    }

    return items;
  }, [mechanicsTabConfig, devMode, matrix.id]);

  const content = (
    <div className="bg-[#090d16] border border-slate-800/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-w-7xl mx-auto w-full max-h-[95vh]">
      
      {/* ── Studio Top Header Bar ── */}
      <header className="bg-slate-950/90 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: `${matrix.color}20`, border: `1px solid ${matrix.color}60`, color: matrix.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{ background: `${matrix.color}25`, color: matrix.color }}
              >
                {matrix.badge}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                {matrix.name} STUDIO
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                COLLECTION: {matrix.targetCollection}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-mono text-white mt-0.5 truncate max-w-md">
              {formData.name ? `Studio: ${formData.name}` : `${matrix.name} STUDIO`}
            </h2>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Folio & Story Transfer Bar */}
          <StudioTransferBar item={formData} categoryKey={matrix.targetCollection} />

          {/* Edit / Read-Only Dossier Mode Toggle */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                handleToggleEditMode(!isEditMode);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isEditMode ? 'Switch to Read-Only Dossier View' : 'Switch to Interactive Edit Studio'}
            >
              <Wrench size={13} />
              <span>{isEditMode ? 'Edit Mode' : 'Dossier View'}</span>
            </button>
          )}

          {/* Canonical Guidance Drawer Toggle */}
          {guidance && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                setIsGuidanceOpen(prev => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isGuidanceOpen
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Toggle canonical section rulebook guidance"
            >
              <BookOpen size={13} className="text-cyan-400" />
              <span className="hidden md:inline">Rules & Guidance</span>
            </button>
          )}

          {/* BASTION AI Synthesizer */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              setIsAiModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Synthesize blueprint with BASTION Tactical Cognition"
          >
            <Bot size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">BASTION Synthesizer</span>
          </button>

          {/* BASTION Ingestion Studio */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              setIsIngestionModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            title="Parse documents or text with BASTION Ingestion Studio"
          >
            <Cpu size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Ingestion</span>
          </button>

          {/* Modal Close Button */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Close Studio"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ── Guidance Drawer (Collapsible) ── */}
      {isGuidanceOpen && guidance && (
        <div className="bg-slate-950 border-b border-cyan-500/30 p-4 max-h-56 overflow-y-auto animate-fade-in shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-cyan-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                {guidance.title} — Canonical Rulebook Guidance
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">BASTION v2.4</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {guidance.overview}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono">
            {guidance.sections?.map((sec, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-amber-400 font-bold mb-0.5">{sec.name || sec.title}</div>
                <div className="text-slate-400 text-[10px] leading-snug">{sec.description || sec.guidance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Studio Body with Left Navigation Rail + Workbench Viewport ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Standardized Left Navigation Rail (Platform Style) ── */}
        <nav 
          aria-label="Studio Sub-Sections"
          className="w-18 sm:w-20 shrink-0 bg-[#070a12]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col items-center justify-between py-2.5 px-1 select-none z-20 font-sans shadow-lg"
        >
          {/* Top Section: Matrix Brand Crest + Nav Buttons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            {/* Top Matrix Crest / Icon */}
            <div className="flex flex-col items-center justify-center py-1 mb-0.5">
              <div 
                className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                style={{
                  background: `${matrix.color || '#10b981'}18`,
                  borderColor: `${matrix.color || '#10b981'}50`,
                  color: matrix.color || '#10b981'
                }}
                title={`${matrix.name} • ${matrix.badge}`}
              >
                <Icon size={18} />
              </div>
              <div className="w-6 h-px bg-slate-800/80 mt-1.5" />
            </div>

            {/* Nav Rail Buttons (Stacked Icon + Monospace Label Underneath) */}
            {navRailItems.map(item => {
              const ItemIcon = item.icon;
              const isActive = activeStudioTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setActiveStudioTab(item.id);
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredRailItem({ item, rect });
                  }}
                  onMouseLeave={() => setHoveredRailItem(null)}
                  title={`${item.label} • ${item.sublabel}`}
                  className={`group relative w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border ${
                    isActive 
                      ? `${item.activeBg || 'bg-slate-800/80'} ${item.activeBorder || 'border-cyan-500/60'} shadow-[0_0_15px_rgba(6,182,212,0.25)]`
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                  }`}
                >
                  {/* Left Glowing Indicator Bar */}
                  {isActive && (
                    <span 
                      className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      style={{ backgroundColor: item.color || matrix.color }}
                    />
                  )}

                  {/* Icon Container Box matching top buttons */}
                  <div 
                    className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isActive ? 'border-cyan-400/80 shadow-sm' : 'border-slate-800 group-hover:border-slate-700 bg-slate-950/60'
                    }`}
                    style={isActive ? { background: `${item.color || matrix.color}25`, borderColor: `${item.color || matrix.color}80` } : {}}
                  >
                    <ItemIcon size={17} style={{ color: isActive ? (item.color || matrix.color) : undefined }} className={isActive ? '' : 'text-slate-400 group-hover:text-slate-200'} />
                  </div>

                  {/* Monospace Visible Label Underneath Icon */}
                  <span className={`font-mono text-[8.5px] sm:text-[9px] uppercase tracking-wider text-center mt-1 truncate max-w-full px-0.5 leading-tight select-none ${
                    isActive ? 'font-extrabold' : 'text-slate-400 group-hover:text-slate-200'
                  }`} style={isActive ? { color: item.color || matrix.color } : {}}>
                    {item.shortLabel || item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Rail System Metadata / Status */}
          <div className="w-full flex flex-col items-center gap-1.5 pt-2 border-t border-slate-800/80 mt-auto">
            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[60px]">{matrix.name}</span>
            </div>
            <div className="text-[8px] font-mono text-slate-500 truncate max-w-full text-center">
              COL: {matrix.targetCollection}
            </div>
            <div 
              className="text-[8px] font-mono px-1 py-0.5 rounded font-bold uppercase tracking-wider text-center w-full truncate"
              style={{ background: `${matrix.color}20`, color: matrix.color }}
            >
              {matrix.badge}
            </div>
          </div>
        </nav>

        {/* ── Main Studio Workbench (Left Forms + Right Live Metrics) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Column: Studio Forms & Configurators */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            
            {/* UDU Capacity Meter (if property matrix and budgets exist) */}
            {showSocketsAndUDU && matrix.budgets && matrix.budgets.length > 0 && (
              <div className="space-y-2">
                {matrix.budgets.map(b => (
                  <UDUCapacityMeter
                    key={b.id}
                    budget={b}
                    formData={formData}
                    computedValues={computedValues}
                  />
                ))}
              </div>
            )}

            {/* ── TAB 1: GENERAL SPECS ── */}
            {activeStudioTab === 'specs' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specsFields.map(field => {
                    const rawVal = formData[field.name];
                    const val = rawVal ?? '';
                    const guidanceItem = CODEX_DATASET_GUIDANCE[matrix.id]?.sections?.find(s => s.id === field.name);

                    return (
                      <div key={field.name} className="space-y-1">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>{field.label} {field.required && <span className="text-amber-400">*</span>}</span>
                          <CodexTooltip
                            title={field.label}
                            description={field.helpText || guidanceItem?.description || `Canonical metric for ${field.label}.`}
                            rule={`BASTION Chapter 6 / ${matrix.name}`}
                            color={matrix.color}
                          />
                        </label>
                        {isEditMode ? (
                          field.type === 'select' ? (
                            <select
                              value={val}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                            >
                              {(field.name === 'size' || field.name === 'sizeCategory' || field.source === 'species_size'
                                ? [...(field.options || [])].sort((a, b) => getSizeTierIndex(a) - getSizeTierIndex(b))
                                : field.options)?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'number' ? (
                            <input
                              type="number"
                              min={field.min}
                              max={field.max}
                              value={val}
                              onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                              className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                            />
                          ) : field.type === 'boolean' || field.type === 'checkbox' ? (
                            <label className="flex items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950"
                              />
                              <span className="text-xs font-mono text-slate-300">{field.label} Active</span>
                            </label>
                          ) : Array.isArray(val) ? (
                            <input
                              type="text"
                              value={val.map(formatFieldValue).join(', ')}
                              onChange={(e) => handleFieldChange(field.name, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                              placeholder={field.placeholder || `Comma-separated ${field.label.toLowerCase()}...`}
                              className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                            />
                          ) : (
                            <input
                              type="text"
                              value={typeof val === 'object' ? formatFieldValue(val) : val}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                            />
                          )
                        ) : (
                          <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {Array.isArray(val) ? (
                              val.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {val.map((item, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded text-[10px] font-mono">
                                      {formatFieldValue(item)}
                                    </span>
                                  ))}
                                </div>
                              ) : '—'
                            ) : typeof val === 'object' ? (
                              formatFieldValue(val)
                            ) : (
                              String(val || '—')
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              {/* Primary Overview / Description */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Technical Overview & Visual Profile
                </label>
                {isEditMode ? (
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Enter comprehensive design specifications, tactical role, and visual aesthetics..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 resize-y leading-relaxed"
                  />
                ) : (
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.description || 'No description provided.'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: GAME MECHANICS & SYSTEMS ── */}
          {activeStudioTab === 'mechanics' && (
            <div className="space-y-5 animate-fade-in">
              {/* Specialized Matrix Configurator (e.g. Weapon Mods, Armor Coverage, Augmentation Nodes, Species Traits, Invocations) */}
              {CustomConfigurator && (
                <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Specialized {matrix.name} Studio Configurator</span>
                  </div>
                  <CustomConfigurator
                    formData={formData}
                    onChange={handleFieldChange}
                  />
                </div>
              )}

              {/* Specialized Species Mechanics & Omnicortex Selectors Suite */}
              {matrix.id === 'species' && (
                <div className="space-y-4">
                  {/* Attribute Modifiers & Skill Aptitudes */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        <Dna size={15} />
                        <span>Inherent Biological Modifiers & Skill Aptitudes</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Omnicortex DBM Synchronized</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span>Inherent Attribute Modifiers</span>
                          <CodexTooltip
                            title="Inherent Attribute Modifiers"
                            description="Baseline biological alterations to standard character attributes. Typically ranges from -2 to +2 for balanced species."
                            rule="BASTION Chapter 2 / Species Creation"
                            color="#38bdf8"
                          />
                        </label>
                        <AttributeModifiersSelector
                          value={formData.attribute_modifiers || formData.inherent_attribute_modifiers || []}
                          onChange={(val) => handleFieldChange('attribute_modifiers', val)}
                          isEditMode={isEditMode}
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span>Specific Skill Bonuses</span>
                          <CodexTooltip
                            title="Specific Skill Bonuses"
                            description="Instinctual or cultural skill proficiencies possessed by this species (+1 to +3)."
                            rule="BASTION Chapter 2 / Species Creation"
                            color="#f59e0b"
                          />
                        </label>
                        <SkillBonusesSelector
                          value={formData.specific_skill_bonuses || []}
                          onChange={(val) => handleFieldChange('specific_skill_bonuses', val)}
                          onOpenPicker={() => setActiveSelectorField({
                            source: 'skills',
                            target: 'specific_skill_bonuses',
                            label: 'Skill Bonuses'
                          })}
                          isEditMode={isEditMode}
                          dbSkills={dbData.skills || []}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Species Features (Inherent & Recommended) */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        <Sparkles size={15} />
                        <span>Species Features & Traits Integration</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Traits & Features Catalog</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Inherent Features</span>
                          <CodexTooltip
                            title="Inherent Features"
                            description="Features naturally and permanently possessed by all members of this species."
                            rule="BASTION Chapter 2 / Species Creation"
                            color="#10b981"
                          />
                        </label>
                        <FeaturesSelector
                          value={formData.inherent_features || []}
                          onChange={(val) => handleFieldChange('inherent_features', val)}
                          onOpenPicker={() => setActiveSelectorField({
                            source: 'trait',
                            target: 'inherent_features',
                            label: 'Inherent Features'
                          })}
                          isEditMode={isEditMode}
                          dbFeatures={dbData.trait || dbData.traits || dbData.features || []}
                          variant="emerald"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Recommended Features</span>
                          <CodexTooltip
                            title="Recommended Features"
                            description="Optional or culturally prevalent features suggested during character creation."
                            rule="BASTION Chapter 2 / Species Creation"
                            color="#a855f7"
                          />
                        </label>
                        <FeaturesSelector
                          value={formData.recommended_features || []}
                          onChange={(val) => handleFieldChange('recommended_features', val)}
                          onOpenPicker={() => setActiveSelectorField({
                            source: 'trait',
                            target: 'recommended_features',
                            label: 'Recommended Features'
                          })}
                          isEditMode={isEditMode}
                          dbFeatures={dbData.trait || dbData.traits || dbData.features || []}
                          variant="purple"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Locomotion & Social Parameters */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      <Sliders size={15} />
                      <span>Locomotion & Social Parameters</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Movement & Locomotion Modes</span>
                          <CodexTooltip
                            title="Species Movement Modes"
                            description="Baseline ground speed, aquatic swimming, flight wings, burrowing, or zero-g maneuvering."
                            rule="BASTION Chapter 2 / Locomotion"
                            color="#f59e0b"
                          />
                        </label>
                        <MovementModeSelector
                          value={formData.movement || formData.movement_modes || []}
                          onChange={(val) => handleFieldChange('movement', val)}
                          isEditMode={isEditMode}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Social Stigma & Standing</span>
                          <CodexTooltip
                            title="Social Stigma"
                            description="Societal standing, cultural prejudices, or galactic stigmas affecting initial NPC reactions."
                            rule="BASTION Chapter 2 / Social Dynamics"
                            color="#ef4444"
                          />
                        </label>
                        <SocialStigmaSelector
                          value={formData.social_stigma || formData.stigma || ''}
                          onChange={(val) => handleFieldChange('social_stigma', val)}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Unified Universal Modifiers Widget */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                      <Zap size={14} />
                      <span>Unified Omnicortex Modifiers & Bonuses Summary</span>
                    </div>
                    <UniversalModifiersWidget
                      formData={formData}
                      onChange={handleFieldChange}
                      isEditMode={isEditMode}
                      customCategories={['attribute', 'skill', 'feature', 'general']}
                    />
                  </div>
                </div>
              )}

              {/* Relative Combat & Operational Parameters (for non-species, non-faction matrices) */}
              {relativeMechanicsFields.length > 0 && matrix.id !== 'factions' && matrix.id !== 'species' && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <Zap size={14} />
                    <span>{matrix.name} {isProperty ? 'Operational Parameters & Combat Mechanics' : 'Game Mechanics & Tactical Parameters'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relativeMechanicsFields.map(field => {
                      const rawVal = formData[field.name];
                      const val = rawVal ?? '';
                      const guidanceItem = CODEX_DATASET_GUIDANCE[matrix.id]?.sections?.find(s => s.id === field.name);

                      return (
                        <div key={field.name} className="space-y-1">
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{field.label} {field.required && <span className="text-amber-400">*</span>}</span>
                            <CodexTooltip
                              title={field.label}
                              description={field.helpText || guidanceItem?.description || `Operational combat/game mechanic for ${field.label}.`}
                              rule={`BASTION Chapter 6 / ${matrix.name}`}
                              color={matrix.color}
                            />
                          </label>
                          {isEditMode ? (
                            field.type === 'select' ? (
                              <select
                                value={val}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                              >
                                {(field.name === 'size' || field.name === 'sizeCategory' || field.source === 'species_size'
                                  ? [...(field.options || [])].sort((a, b) => getSizeTierIndex(a) - getSizeTierIndex(b))
                                  : field.options)?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : field.type === 'number' ? (
                              <input
                                type="number"
                                min={field.min}
                                max={field.max}
                                value={val}
                                onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                              />
                            ) : field.type === 'boolean' || field.type === 'checkbox' ? (
                              <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700/80 rounded-xl cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(val)}
                                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950"
                                />
                                <span className="text-xs font-mono text-slate-300">{field.label} Active</span>
                              </label>
                            ) : Array.isArray(val) ? (
                              <input
                                type="text"
                                value={val.map(formatFieldValue).join(', ')}
                                onChange={(e) => handleFieldChange(field.name, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder={field.placeholder || `Comma-separated ${field.label.toLowerCase()}...`}
                                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                              />
                            ) : (
                              <input
                                type="text"
                                value={typeof val === 'object' ? formatFieldValue(val) : val}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                              />
                            )
                          ) : (
                            <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                              {Array.isArray(val) ? (
                                val.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {val.map((item, idx) => (
                                      <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded text-[10px] font-mono">
                                        {formatFieldValue(item)}
                                      </span>
                                    ))}
                                  </div>
                                ) : '—'
                              ) : typeof val === 'object' ? (
                                formatFieldValue(val)
                              ) : (
                                String(val || '—')
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dedicated Faction Mechanics & Doctrine Sections (when matrix is factions) */}
              {matrix.id === 'factions' && (
                <div className="space-y-4">
                  {/* Faction Player Character Options & Skill Packages */}
                  <div className="p-4 bg-slate-950/60 border border-emerald-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      <Flag size={14} />
                      <span>Faction Player Character Options & Skill Packages</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Faction Skill Package (20 Points Allocation)
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={3}
                            value={formData.skill_package || ''}
                            onChange={(e) => handleFieldChange('skill_package', e.target.value)}
                            placeholder="E.g., Bluff (+4), Survival (+3), Streetwise (+3), Mechanics (+3), Pilot (+3), Combat/Utility (+4)"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.skill_package || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Recommended Features (1 BP Discount in Folio)
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={3}
                            value={formData.recommended_features || ''}
                            onChange={(e) => handleFieldChange('recommended_features', e.target.value)}
                            placeholder="E.g., Tough, Pain Tolerance, Endurance, Burst Attack, Weapon Improvisation, Gearhead, Benefit (Authority), Tracker"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.recommended_features || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Bonus Features & Origin Traits
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={2}
                            value={formData.bonus_features || ''}
                            onChange={(e) => handleFieldChange('bonus_features', e.target.value)}
                            placeholder="E.g., Independent Grit, Jack of All Trades, Penal Recruit, Federal Authority"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.bonus_features || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Typical Character Archetypes
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={2}
                            value={formData.typical_archetypes || ''}
                            onChange={(e) => handleFieldChange('typical_archetypes', e.target.value)}
                            placeholder="E.g., The Munitions Magnate, The Field Medic, The Demolisher, The Veteran, The Marshal, The Raider"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.typical_archetypes || 'None specified.'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Faction-Specific Rules & Mechanical Perks
                      </label>
                      {isEditMode ? (
                        <textarea
                          rows={3}
                          value={formData.mechanic || ''}
                          onChange={(e) => handleFieldChange('mechanic', e.target.value)}
                          placeholder="Faction standing rules, diplomatic bonuses, environmental traits, or mechanical perks..."
                          className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                        />
                      ) : (
                        <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                          {formData.mechanic || 'None defined.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Military Doctrine & Defense Assets */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                      <Shield size={14} />
                      <span>Military Doctrine & Strategic Assets</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Military Doctrine & Combat Strategy
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={3}
                            value={formData.military_doctrine || ''}
                            onChange={(e) => handleFieldChange('military_doctrine', e.target.value)}
                            placeholder="E.g., Attrition and overwhelming kinetic firepower. Blunt instruments."
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.military_doctrine || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Key Military Formations & Elite Units
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={3}
                            value={formData.key_units || ''}
                            onChange={(e) => handleFieldChange('key_units', e.target.value)}
                            placeholder="E.g., Colonial Rangers (Neural Shunt Recruits), Frontier Marshals"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.key_units || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Naval & Void Fleet Assets
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={2}
                            value={formData.naval_assets || ''}
                            onChange={(e) => handleFieldChange('naval_assets', e.target.value)}
                            placeholder="E.g., Goliath Siege-Haulers, Rust-Devil Gunships, Leviathan Land-Trains"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.naval_assets || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Unique Tech, Signatures & Precursor Relics
                        </label>
                        {isEditMode ? (
                          <textarea
                            rows={2}
                            value={formData.unique_tech_materials || ''}
                            onChange={(e) => handleFieldChange('unique_tech_materials', e.target.value)}
                            placeholder="E.g., Reverse-Engineered Precursor Tech, Heavy Fission Batteries"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.unique_tech_materials || 'None specified.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Strategic Commodities & Economic System */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      <Coins size={14} />
                      <span>Economic System & Strategic Commodities</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Economic Model & Trade System
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.economic_model || ''}
                            onChange={(e) => handleFieldChange('economic_model', e.target.value)}
                            placeholder="E.g., Exploitative Capitalism"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.economic_model || 'Standard'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Primary Exports & Commodities
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.primary_exports || ''}
                            onChange={(e) => handleFieldChange('primary_exports', e.target.value)}
                            placeholder="E.g., Heavy metals, Aetherite, Food"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {formData.primary_exports || 'None specified.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Wealth Modifier (Score / Context)
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.wealth_modifier ?? '0'}
                            onChange={(e) => handleFieldChange('wealth_modifier', e.target.value)}
                            placeholder="E.g., 0, +2 (Old Money)"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                            {String(formData.wealth_modifier ?? '0')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Consolidated DBM Widgets - Filtered relative to dataset */}
              <div className="space-y-4">
                {/* Sockets Allocation Widget (Property Types with Sockets & UDU only) */}
                {isProperty && showSocketsAndUDU && (
                  <SocketsAllocationWidget
                    sockets={formData.sockets || getItemSockets(formData)}
                    onChange={newSockets => handleFieldChange('sockets', newSockets)}
                    isEditMode={isEditMode}
                  />
                )}

                {/* Critical Details Widget (Damage or Effect Types only) */}
                {isProperty && showDamageOrEffect && (
                  <CriticalDetailsWidget
                    criticalDetails={formData.critical_details || getItemCriticalDetails(formData)}
                    onChange={newCrit => handleFieldChange('critical_details', newCrit)}
                    isEditMode={isEditMode}
                  />
                )}

                {/* Modifications List Widget (Hardware / Equipment with Modifications only) */}
                {isProperty && showModifications && (
                  <ModificationsWidget
                    modifications={formData.modifications || getItemModifications(formData)}
                    onChange={newMods => handleFieldChange('modifications', newMods)}
                    isEditMode={isEditMode}
                  />
                )}

                {/* Universal Modifiers Widget (Supported on all matrices to grant attribute/skill/combat bonuses) */}
                <UniversalModifiersWidget
                  modifiers={formData.modifiers || getItemModifiers(formData)}
                  onChange={newMods => handleFieldChange('modifiers', newMods)}
                  relationalData={dbData}
                  isEditMode={isEditMode}
                />

                {/* Cost Economy Widget (Only for Property Matrices) */}
                {isProperty && (
                  <CostEconomyWidget
                    costs={formData.costs || getItemCosts(formData)}
                    onChange={newCosts => handleFieldChange('costs', newCosts)}
                    isEditMode={isEditMode}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: NARRATIVE & LORE ── */}
          {activeStudioTab === 'narrative' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Tactical Mechanics & Environmental Operations
                </label>
                {isEditMode ? (
                  <textarea
                    rows={4}
                    value={formData.mechanic || ''}
                    onChange={(e) => handleFieldChange('mechanic', e.target.value)}
                    placeholder="Environmental tolerances, operating conditions, fail-safe procedures..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono leading-relaxed">
                    {formData.mechanic || 'None defined.'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Lore, Origin & Historical Dossier
                </label>
                {isEditMode ? (
                  <textarea
                    rows={5}
                    value={formData.body || formData.lore || ''}
                    onChange={(e) => handleFieldChange('body', e.target.value)}
                    placeholder="Corporate provenance, manufacturing history, cultural significance..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                ) : (
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.body || formData.lore || 'No narrative lore recorded.'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* If Factions, display specialized sociological narrative sections */}
              {matrix.id === 'factions' && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Core Beliefs & Ideological Foundations
                      </label>
                      {isEditMode ? (
                        <textarea
                          rows={3}
                          value={formData.core_beliefs || ''}
                          onChange={(e) => handleFieldChange('core_beliefs', e.target.value)}
                          placeholder="Personal freedom is sacred, though it allows the powerful to exploit the weak..."
                          className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                        />
                      ) : (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono leading-relaxed">
                          {formData.core_beliefs || 'None defined.'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Social Structure & Internal Hierarchy
                      </label>
                      {isEditMode ? (
                        <textarea
                          rows={3}
                          value={formData.social_structure || ''}
                          onChange={(e) => handleFieldChange('social_structure', e.target.value)}
                          placeholder="Corporate Elites > Marshals > Citizens > Penal Legions..."
                          className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                        />
                      ) : (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono leading-relaxed">
                          {formData.social_structure || 'None defined.'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Diplomatic Posture & Foreign Relations
                      </label>
                      {isEditMode ? (
                        <textarea
                          rows={3}
                          value={formData.relationship_to_others || ''}
                          onChange={(e) => handleFieldChange('relationship_to_others', e.target.value)}
                          placeholder="How this faction views rival powers, trade partners, and alien neighbors..."
                          className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                        />
                      ) : (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono leading-relaxed">
                          {formData.relationship_to_others || 'None defined.'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Official Motto & Colloquial Slang
                      </label>
                      {isEditMode ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formData.motto || ''}
                            onChange={(e) => handleFieldChange('motto', e.target.value)}
                            placeholder='Motto: "Service Guarantees Citizenship."'
                            className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={formData.colloquialisms || ''}
                            onChange={(e) => handleFieldChange('colloquialisms', e.target.value)}
                            placeholder="Slang: The Free Colonies, Rust-Walkers, The Gilded Core"
                            className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono space-y-1">
                          <div><span className="text-slate-500">Motto:</span> {formData.motto || '—'}</div>
                          <div><span className="text-slate-500">Slang:</span> {formData.colloquialisms || '—'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Architect & Game Master Notes
                </label>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={formData.note || ''}
                    onChange={(e) => handleFieldChange('note', e.target.value)}
                    placeholder="Confidential GM notes, encounter hooks, salvage secrets..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
                    {formData.note || 'No notes provided.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 4: RELATIONAL LINKS ── */}
          {activeStudioTab === 'relational' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Compass size={14} />
                  <span>Omnicortex Relational Entity Linking</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Link this {matrix.name} record to parent species lineages, homeworlds, factions, tactical requirements, or associated skills.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['species', 'factions', 'skills', 'occupations', 'origins'].map(colKey => {
                    const linked = formData[colKey] || formData[`${colKey}_id`] || [];
                    const count = Array.isArray(linked) ? linked.length : (linked ? 1 : 0);

                    return (
                      <div key={colKey} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold text-slate-200 uppercase">{colKey}</div>
                          <div className="text-[10px] font-mono text-slate-500">{count} attached</div>
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => setActiveSelectorField(colKey)}
                            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono font-bold uppercase transition-colors"
                          >
                            Browse
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: DEV INSPECTOR ── */}
          {activeStudioTab === 'inspector' && devMode && (
            <div className="space-y-4 animate-fade-in font-mono">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-emerald-400 font-bold uppercase">Raw Omnicortex Document</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                      AudioService.playTerminalBeep(1400, 0.03);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={11} />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="text-[11px] text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed bg-black/50 p-3 rounded-lg border border-slate-800/80">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* ── Action Controls Bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Form</span>
                </button>
              )}

              {activeItem && (activeItem.id || formData.id) && isAdmin && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Delete Entry"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {errorMessage && (
                <span className="text-xs font-mono text-red-400 flex items-center gap-1">
                  <AlertTriangle size={13} />
                  <span>{errorMessage}</span>
                </span>
              )}

              {saveSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={13} />
                  <span>Committed to Omnicortex</span>
                </span>
              )}

              {isEditMode && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} className={isSaving ? 'animate-spin' : ''} />
                  <span>{isSaving ? 'Committing...' : 'Commit to Omnicortex'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Derived Metrics Panel (Exclusively for property items) */}
        {isProperty && (
          <div className="w-full lg:w-84 xl:w-96 shrink-0">
            <ComputedOutputPanel
              computedOutputs={matrix.computedOutputs || []}
              computedValues={computedValues}
              formData={formData}
              matrix={matrix}
              isLoading={isCalculating}
            />
          </div>
        )}
        </div>
      </div>

      {/* Embedded Sub-Modals */}
      <CodexAiSynthesizerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        matrix={matrix}
        onApplyGeneratedData={(aiData) => {
          setFormData(prev => ({
            ...prev,
            ...aiData,
            name: aiData.name || prev.name,
            description: aiData.description || prev.description
          }));
          AudioService.playTerminalBeep(1400, 0.05);
        }}
      />

      <CodexIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        initialDatasetKey={matrix.targetCollection || 'equipment'}
        focusedMode={true}
        onApplyEntry={(ingestedItem) => {
          const adapted = adaptItemToCodexFormData(ingestedItem, matrix);
          setFormData(prev => ({ ...prev, ...adapted }));
          AudioService.playTerminalBeep(1400, 0.05);
        }}
      />

      {activeSelectorField && (
        <UnifiedRelationalSelectorModal
          isOpen={Boolean(activeSelectorField)}
          onClose={() => setActiveSelectorField(null)}
          fieldKey={typeof activeSelectorField === 'object' ? activeSelectorField.target : activeSelectorField}
          sourceCollection={typeof activeSelectorField === 'object' ? activeSelectorField.source : activeSelectorField}
          fieldDef={{
            label: (typeof activeSelectorField === 'object' ? activeSelectorField.label : activeSelectorField).toUpperCase(),
            type: 'multiselect',
            source: typeof activeSelectorField === 'object' ? activeSelectorField.source : activeSelectorField
          }}
          currentValue={formData[typeof activeSelectorField === 'object' ? activeSelectorField.target : activeSelectorField] || []}
          onSelect={(selectedValues) => {
            const targetKey = typeof activeSelectorField === 'object' ? activeSelectorField.target : activeSelectorField;
            handleFieldChange(targetKey, selectedValues);
            setActiveSelectorField(null);
          }}
          dbData={dbData}
          saveEntry={saveEntry}
          devMode={true}
        />
      )}

      {/* Floating Rail Hover Tooltip Portal */}
      {hoveredRailItem && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[300] pointer-events-none px-3 py-2 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${(hoveredRailItem.rect?.right || 0) + 12}px`,
            top: `${(hoveredRailItem.rect?.top || 0) + (hoveredRailItem.rect?.height || 0) / 2}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <span style={{ color: hoveredRailItem.item.color || matrix.color }}>●</span>
            <span>{hoveredRailItem.item.label}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {hoveredRailItem.item.sublabel}
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 pt-4 sm:pt-6 md:pt-8 pb-8 overflow-y-auto select-none font-sans">
        {content}
      </div>
    );
  }

  return content;
};

export default React.memo(AssetStudio);
