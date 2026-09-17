import React, { useState, useMemo, useEffect } from 'react';
import { 
  Dna, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  Plus, 
  Minus, 
  Check, 
  Info, 
  Zap, 
  Flame, 
  Activity, 
  Sliders,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Brain,
  ShieldCheck,
  Scale,
  Edit3
} from 'lucide-react';
import { 
  SPECIES_BUDGET_LEVELS, 
  SPECIES_TYPES, 
  SPECIES_SIZES, 
  SPECIES_MOVEMENT_MODES, 
  SPECIES_MOVEMENT_BASE_MODES,
  SPECIES_MOVEMENT_ADJUSTERS,
  SPECIES_MOVEMENT_GROUPS,
  SPECIES_MOVEMENT_MODIFICATIONS,
  SPECIES_TRAITS_BASIC, 
  SPECIES_TRAITS_ADVANCED, 
  SPECIES_TRAITS_ELITE, 
  SPECIES_DISADVANTAGES,
  resolveMovementId
} from '../../../engines/tangentConstants';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { DEFAULT_SPECIES_MOVEMENT, getMovementById } from '../../../data/speciesMovementData';
import { getTraitChoiceConfig } from '../../../data/speciesTraitChoices';
import { TraitChoiceModal } from '../../../components/Codex/TraitChoiceModal';
import { calculateSpeciesBP, calculateSpeciesCombatModifiers } from '../../../engines/tangentEntityEngines';
import { useDBM } from '../../../context/DBMContext';
import {
  OmnicortexTooltip,
  TraitTooltipCard,
  DisadvantageSummaryCard,
  SpeciesTypeSummaryCard,
  SpeciesSizeSummaryCard,
  MovementModeSummaryCard,
  SocialStigmaSummaryCard
} from '../../../components/Codex/SpeciesStudioTooltips';
import { AudioService } from '../../../services/audioService';
import { 
  FeaturesSelector, 
  SkillBonusesSelector, 
  AttributeModifiersSelector 
} from '../../../components/DBM/widgets/OmnicortexFieldSelector';
import { UniversalModifiersWidget } from '../../../components/DBM/widgets/UniversalModifiersWidget';

const CANONICAL_SPECIES_STIGMAS = [
  { id: 'none', label: 'None (0 CP)', name: 'None', penalty: 0, refund: 0, desc: 'Standard galactic citizen status, baseline societal reaction.' },
  { id: 'minor-xeno', label: 'Minor Xeno (-1)', name: 'Minor Xeno (-1)', penalty: 1, refund: 1, desc: 'Exotic humanoid physiology or uncommon planetary origin.' },
  { id: 'xeno', label: 'Xeno (-2)', name: 'Xeno (-2)', penalty: 2, refund: 2, desc: 'Extraterrestrial non-humanoid form; general cultural distrust.' },
  { id: 'severe-xeno', label: 'Severe Xeno (-4)', name: 'Severe Xeno (-4)', penalty: 4, refund: 4, desc: 'Terrifying or uncanny biology inspiring fear and xenophobia.' },
  { id: 'extreme-xeno', label: 'Extreme Xeno (-6)', name: 'Extreme Xeno (-6)', penalty: 6, refund: 6, desc: 'Incomprehensible alien horror or pariah species reviled across the galaxy.' },
  { id: 'synthetic', label: 'Synthetic (-2)', name: 'Synthetic (-2)', penalty: 2, refund: 2, desc: 'Constructed android, cybernetic intelligence, or machine caste.' },
  { id: 'severe-synthetic', label: 'Severe Synthetic (-4)', name: 'Severe Synthetic (-4)', penalty: 4, refund: 4, desc: 'Unregistered combat chassis or outlawed military autonomous drone.' },
  { id: 'feral', label: 'Feral (-4)', name: 'Feral (-4)', penalty: 4, refund: 4, desc: 'Predatory beast-like temperament; viewed as dangerous and untamed.' },
  { id: 'monstrous', label: 'Monstrous (-4)', name: 'Monstrous (-4)', penalty: 4, refund: 4, desc: 'Horrific or grotesque morphology; feared by civilized populations.' },
  { id: 'monstrous-extreme', label: 'Monstrous Extreme (-6)', name: 'Monstrous Extreme (-6)', penalty: 6, refund: 6, desc: 'Eldritch or nightmarish monstrosity; extreme hostility on sight.' },
  { id: 'shifter', label: 'Shifter (-2)', name: 'Shifter (-2)', penalty: 2, refund: 2, desc: 'Inherent shapeshifter or mimic; constant societal paranoia of deception.' },
  { id: 'dragonkin', label: 'Dragonkin (-4)', name: 'Dragonkin (-4)', penalty: 4, refund: 4, desc: 'Dreaded draconic ancestry and apex predator temperament.' },
  { id: 'fey', label: 'Fey (-2)', name: 'Fey (-2)', penalty: 2, refund: 2, desc: 'Capricious extradimensional trickster legacy; regarded with caution.' },
  { id: 'seclusionist', label: 'Seclusionist (-1)', name: 'Seclusionist (-1)', penalty: 1, refund: 1, desc: 'Cloistered hermit culture or xenophobic isolationist background.' }
];

const GENETICS_NAV_ITEMS = [
  {
    id: 'chassis',
    name: 'Chassis & Scale',
    shortLabel: 'CHASSIS',
    icon: Dna,
    color: '#38bdf8',
    desc: 'Species Type Chassis, Physical Scale, Budget Tier & Combat Modifiers'
  },
  {
    id: 'traits',
    name: 'Racial Traits',
    shortLabel: 'TRAITS',
    icon: Sparkles,
    color: '#c084fc',
    desc: 'Species Racial Traits Catalog, Tiers & Genetic Mutations'
  },
  {
    id: 'attributes',
    name: 'Attributes & Skills',
    shortLabel: 'STATS',
    icon: Activity,
    color: '#34d399',
    desc: 'Biological Attribute Bonuses, Skill Bundles & Specific Aptitudes'
  },
  {
    id: 'features',
    name: 'Features & Perks',
    shortLabel: 'FEATS',
    icon: BookOpen,
    color: '#a855f7',
    desc: 'Inherent Biological Features & Recommended Cultural Traits'
  },
  {
    id: 'movement',
    name: 'Movement & Speed',
    shortLabel: 'SPEED',
    icon: Zap,
    color: '#fbbf24',
    desc: 'Locomotion Modes, Speeds & Tactical Terrain Adjusters'
  },
  {
    id: 'stigma',
    name: 'Social Stigma',
    shortLabel: 'STIGMA',
    icon: AlertTriangle,
    color: '#f43f5e',
    desc: 'Prejudices, Cultural Stigmas, Reaction Penalties & CP Rebates'
  },
  {
    id: 'disadvantages',
    name: 'Disadvantages',
    shortLabel: 'FLAWS',
    icon: ShieldAlert,
    color: '#f87171',
    desc: 'Species Disadvantages, Physiological Flaws & CP Refunds'
  },
  {
    id: 'modifiers',
    name: 'Unified Modifiers',
    shortLabel: 'MODS',
    icon: Sliders,
    color: '#60a5fa',
    desc: 'Omnicortex Modifiers Breakdown & Character Point Audit'
  }
];

export const SpeciesTraitSelector = ({ 
  formData = {}, 
  onChange, 
  isEditMode = true, 
  onOpenPicker = null, 
  dbData: propDbData = null 
}) => {
  const dbmContext = useDBM() || {};
  const dbData = propDbData || dbmContext.dbData || {};
  const dbTraits = useMemo(() => dbData?.trait || dbData?.traits || [], [dbData]);

  const [activeTab, setActiveTab] = useState('chassis'); // 'chassis', 'traits', 'attributes', 'features', 'movement', 'stigma', 'disadvantages', 'modifiers'
  const [traitTier, setTraitTier] = useState('all'); // 'all', 'basic', 'advanced', 'elite'
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullWindowCatalog, setIsFullWindowCatalog] = useState(false);
  const [movementCategoryFilter, setMovementCategoryFilter] = useState('all');
  const [movementSearchQuery, setMovementSearchQuery] = useState('');
  const [customStigmaInput, setCustomStigmaInput] = useState('');
  const [activeChoiceModal, setActiveChoiceModal] = useState(null);

  const selectedType = formData.species_type || formData.type || 'Humanoid';
  const selectedSize = formData.size || 'Medium';
  const selectedBudget = formData.budget_level || 'Standard';
  const selectedModes = Array.isArray(formData.movement_modes) ? formData.movement_modes : (formData.movement ? [formData.movement] : ['species_movement-bipedal']);
  const selectedTraits = Array.isArray(formData.traits) ? formData.traits : [];
  const selectedDisadvantages = Array.isArray(formData.disadvantages) ? formData.disadvantages : [];
  const selectedStigma = formData.social_stigma || formData.stigma || 'None';
  
  const attributes = useMemo(() => {
    const base = {
      str: Number(formData.bonus_str || formData.attributes?.str || 0),
      agi: Number(formData.bonus_agi || formData.attributes?.agi || 0),
      sta: Number(formData.bonus_sta || formData.attributes?.sta || 0),
      int: Number(formData.bonus_int || formData.attributes?.int || 0),
      wis: Number(formData.bonus_wis || formData.attributes?.wis || 0),
      cha: Number(formData.bonus_cha || formData.attributes?.cha || 0)
    };
    if (Array.isArray(formData.attribute_modifiers)) {
      formData.attribute_modifiers.forEach(mod => {
        const attr = String(mod.attribute || mod.target || '').toLowerCase();
        const bonus = Number(mod.bonus ?? mod.value ?? 0);
        if (attr.startsWith('str') && !base.str) base.str = bonus;
        else if ((attr.startsWith('agi') || attr.startsWith('dex')) && !base.agi) base.agi = bonus;
        else if ((attr.startsWith('sta') || attr.startsWith('con')) && !base.sta) base.sta = bonus;
        else if (attr.startsWith('int') && !base.int) base.int = bonus;
        else if (attr.startsWith('wis') && !base.wis) base.wis = bonus;
        else if (attr.startsWith('cha') && !base.cha) base.cha = bonus;
      });
    }
    return base;
  }, [formData.bonus_str, formData.bonus_agi, formData.bonus_sta, formData.bonus_int, formData.bonus_wis, formData.bonus_cha, formData.attributes, formData.attribute_modifiers]);

  const skillBundles = formData.skill_bundles || 0;

  // Real-time calculation including Social Stigma CP rebate & inherent features
  const bpData = useMemo(() => {
    return calculateSpeciesBP({
      type: selectedType,
      size: selectedSize,
      movementModes: selectedModes,
      attributes,
      skillBundles,
      traits: selectedTraits,
      inherent_features: formData.inherent_features || [],
      disadvantages: selectedDisadvantages,
      budgetLevel: selectedBudget,
      social_stigma: selectedStigma,
      stigma: selectedStigma
    });
  }, [selectedType, selectedSize, selectedModes, attributes, skillBundles, selectedTraits, formData.inherent_features, selectedDisadvantages, selectedBudget, selectedStigma]);

  const combatMods = useMemo(() => {
    return calculateSpeciesCombatModifiers(selectedSize);
  }, [selectedSize]);

  // Keep parent form's CP in sync with calculated total
  useEffect(() => {
    if (bpData?.totalBPUsed !== undefined && formData.cp !== bpData.totalBPUsed) {
      onChange('cp', bpData.totalBPUsed);
      onChange('cp_cost', bpData.totalBPUsed);
    }
  }, [bpData.totalBPUsed, formData.cp, onChange]);

  // Attribute stepper
  const updateAttribute = (attr, delta) => {
    const current = Number(attributes[attr] || 0);
    const updated = {
      ...attributes,
      [attr]: current + delta
    };
    onChange('attributes', updated);
    onChange(`bonus_${attr}`, updated[attr]);

    // Keep attribute_modifiers array in sync for Omnicortex DBM
    const attrMap = { str: 'Strength', agi: 'Agility', sta: 'Stamina', int: 'Intellect', wis: 'Wisdom', cha: 'Charisma' };
    const attrMods = Object.entries(updated)
      .filter(([_, v]) => Number(v) !== 0)
      .map(([k, v]) => ({
        attribute: attrMap[k] || k,
        bonus: Number(v)
      }));
    onChange('attribute_modifiers', attrMods);
    onChange('inherent_attribute_modifiers', attrMods);
  };

  const toggleTrait = (traitId, existingItem = null) => {
    const traitObj = allAvailableTraits.find(t => t.id === traitId || t.name.toLowerCase() === String(traitId).toLowerCase()) || { id: traitId, name: traitId, bp: 1 };
    const choiceConfig = getTraitChoiceConfig(traitObj);
    const existingMatches = selectedTraits.filter(t => (typeof t === 'string' ? t : t?.id) === traitId);

    // If trait requires an interactive choice
    if (choiceConfig) {
      // If user passed a specific item to edit
      if (existingItem) {
        setActiveChoiceModal({ trait: traitObj, config: choiceConfig, existingChoice: existingItem.choice, editingItem: existingItem });
        return;
      }

      // If already equipped and not allowing multiple, remove it
      if (existingMatches.length > 0 && !choiceConfig.allowMultiple) {
        const updated = selectedTraits.filter(t => (typeof t === 'string' ? t : t?.id) !== traitId);
        onChange('traits', updated);
        return;
      }

      // Open choice modal to configure and add
      setActiveChoiceModal({
        trait: traitObj,
        config: choiceConfig,
        existingChoice: existingMatches.length > 0 && !choiceConfig.allowMultiple ? existingMatches[0]?.choice : null,
        editingItem: existingMatches.length > 0 && !choiceConfig.allowMultiple ? existingMatches[0] : null
      });
      return;
    }

    // Standard trait without choices
    let updated;
    if (existingMatches.length > 0) {
      updated = selectedTraits.filter(t => (typeof t === 'string' ? t : t?.id) !== traitId);
    } else {
      updated = [...selectedTraits, traitId];
    }
    onChange('traits', updated);
  };

  const removeTraitEntry = (entryToRemove) => {
    let updated;
    if (typeof entryToRemove === 'object' && entryToRemove !== null) {
      updated = selectedTraits.filter(t => t !== entryToRemove);
    } else {
      updated = selectedTraits.filter(t => (typeof t === 'string' ? t : t?.id) !== entryToRemove);
    }
    onChange('traits', updated);
  };

  const handleConfirmTraitChoice = (configuredTrait) => {
    if (!configuredTrait) return;
    let updated;

    if (activeChoiceModal?.editingItem) {
      updated = selectedTraits.map(t => t === activeChoiceModal.editingItem ? configuredTrait : t);
    } else {
      // Adding new configured trait
      if (activeChoiceModal?.config?.allowMultiple) {
        // Allow multiple distinct choices for this trait
        const withoutDuplicateChoice = selectedTraits.filter(t => {
          if ((typeof t === 'string' ? t : t?.id) !== configuredTrait.id) return true;
          const choiceStr = typeof t === 'object' ? (t.choiceLabel || t.choice) : '';
          return choiceStr !== configuredTrait.choiceLabel;
        });
        updated = [...withoutDuplicateChoice, configuredTrait];
      } else {
        // Replace existing
        const filtered = selectedTraits.filter(t => (typeof t === 'string' ? t : t?.id) !== configuredTrait.id);
        updated = [...filtered, configuredTrait];
      }
    }

    onChange('traits', updated);
    setActiveChoiceModal(null);
  };

  const toggleDisadvantage = (disId) => {
    const exists = selectedDisadvantages.some(d => (typeof d === 'string' ? d : d?.id) === disId);
    let updated;
    if (exists) {
      updated = selectedDisadvantages.filter(d => (typeof d === 'string' ? d : d?.id) !== disId);
    } else {
      updated = [...selectedDisadvantages, disId];
    }
    onChange('disadvantages', updated);
  };

  const toggleMovementMode = (modeId) => {
    const canonicalModeId = resolveMovementId(modeId);
    const exists = selectedModes.some(m => resolveMovementId(typeof m === 'string' ? m : m?.id) === canonicalModeId);
    let updated;
    if (exists) {
      updated = selectedModes.filter(m => resolveMovementId(typeof m === 'string' ? m : m?.id) !== canonicalModeId);
      if (updated.length === 0) updated = ['species_movement-bipedal'];
    } else {
      const isExclusiveGround = ['fast', 'very_fast', 'slow', 'ponderous', 'movement-fast', 'movement-very-fast', 'movement-slow', 'movement-ponderous'].includes(canonicalModeId) || ['fast', 'very_fast', 'slow', 'ponderous'].includes(modeId);
      if (isExclusiveGround) {
        const exclusiveIds = new Set(['fast', 'very_fast', 'slow', 'ponderous', 'movement-fast', 'movement-very-fast', 'movement-slow', 'movement-ponderous']);
        updated = selectedModes.filter(m => !exclusiveIds.has(typeof m === 'string' ? m : m?.id) && !exclusiveIds.has(resolveMovementId(typeof m === 'string' ? m : m?.id)));
        updated.push(canonicalModeId);
      } else {
        updated = [...selectedModes, canonicalModeId];
      }
    }
    onChange('movement_modes', updated);
    onChange('movement', updated[0] || 'species_movement-bipedal');
  };

  const handleStigmaChange = (newStigma) => {
    onChange('social_stigma', newStigma);
    onChange('stigma', newStigma);
  };

  const toggleStigmaPreset = (presetName) => {
    if (presetName === 'None' || presetName === 'None (0 CP)') {
      handleStigmaChange('None');
      return;
    }

    const currentParts = selectedStigma && selectedStigma !== 'None'
      ? selectedStigma.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const exists = currentParts.some(p => p.toLowerCase() === presetName.toLowerCase());
    let nextParts;
    if (exists) {
      nextParts = currentParts.filter(p => p.toLowerCase() !== presetName.toLowerCase());
    } else {
      nextParts = [...currentParts, presetName];
    }

    const nextStr = nextParts.length > 0 ? nextParts.join(', ') : 'None';
    handleStigmaChange(nextStr);
  };

  const stigmaMatches = useMemo(() => {
    return [...String(selectedStigma || '').matchAll(/\(-\s*(\d+)\)/g)];
  }, [selectedStigma]);

  const stigmaTotalPenalty = useMemo(() => {
    if (stigmaMatches.length > 0) {
      return stigmaMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
    }
    const lower = String(selectedStigma || '').toLowerCase();
    if (lower.includes('extreme') || lower.includes('pariah')) return 6;
    if (lower.includes('severe') || lower.includes('feral') || lower.includes('monstrous')) return 4;
    if (lower.includes('xeno') || lower.includes('synthetic') || lower.includes('shifter') || lower.includes('dragonkin') || lower.includes('fey')) return 2;
    if (lower.includes('minor') || lower.includes('seclusionist')) return 1;
    return 0;
  }, [selectedStigma, stigmaMatches]);

  // Comprehensive Omnicortex Traits Catalog
  const allAvailableTraits = useMemo(() => {
    const map = new Map();
    const addTrait = (t) => {
      const id = t.id || t.name;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: t.name || id.replace(/^trait-/, '').replace(/-/g, ' '),
          bp: t.bp || t.costs?.bp || (t.tier === 'elite' ? 4 : t.tier === 'advanced' ? 2 : 1),
          tier: (t.trait_tier || t.tier || (t.bp === 4 ? 'elite' : t.bp === 2 ? 'advanced' : 'basic')).toLowerCase(),
          classification: t.classification || t.type || 'Physical',
          description: t.description || t.desc || t.mechanics || t.mechanic || 'Canonical biological trait effect.',
          modifiers: t.modifiers || []
        });
      }
    };

    // 1. Built-in constants
    SPECIES_TRAITS_BASIC.forEach(t => addTrait({ ...t, tier: 'basic', bp: 1 }));
    SPECIES_TRAITS_ADVANCED.forEach(t => addTrait({ ...t, tier: 'advanced', bp: 2 }));
    SPECIES_TRAITS_ELITE.forEach(t => addTrait({ ...t, tier: 'elite', bp: 4 }));

    // 2. Canonical traits dataset
    ALL_CANONICAL_TRAITS.forEach(addTrait);

    // 3. Omnicortex DBM traits
    const dbTraits = dbData?.traits || dbData?.species_traits || [];
    dbTraits.forEach(addTrait);

    return Array.from(map.values());
  }, [dbData]);

  // Unique classifications
  const availableClassifications = useMemo(() => {
    const set = new Set();
    allAvailableTraits.forEach(t => {
      if (t.classification) set.add(t.classification);
    });
    return Array.from(set).sort();
  }, [allAvailableTraits]);

  // Filtered traits
  const filteredTraits = useMemo(() => {
    return allAvailableTraits.filter(trait => {
      // Tier filter
      if (traitTier !== 'all') {
        const tTier = trait.tier.toLowerCase();
        if (traitTier === 'basic' && tTier !== 'basic') return false;
        if (traitTier === 'advanced' && tTier !== 'advanced') return false;
        if (traitTier === 'elite' && tTier !== 'elite') return false;
      }

      // Classification filter
      if (classificationFilter !== 'all') {
        if (trait.classification?.toLowerCase() !== classificationFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = trait.name.toLowerCase().includes(q);
        const matchDesc = trait.description.toLowerCase().includes(q);
        const matchClass = (trait.classification || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchClass) return false;
      }

      return true;
    });
  }, [allAvailableTraits, traitTier, classificationFilter, searchQuery]);

  const bpPercent = Math.min(100, Math.round((bpData.totalBPUsed / bpData.budgetMax) * 100));

  // Resolved list of equipped traits objects
  const activeEquippedTraitsList = useMemo(() => {
    return selectedTraits.map((idOrObj, idx) => {
      const isObj = typeof idOrObj === 'object' && idOrObj !== null;
      const id = isObj ? (idOrObj.id || idOrObj.name) : String(idOrObj);
      const match = allAvailableTraits.find(t => t.id === id || t.name.toLowerCase() === id.toLowerCase());
      const choiceLabel = isObj ? (idOrObj.choiceLabel || (Array.isArray(idOrObj.choice) ? idOrObj.choice.join(', ') : idOrObj.choice)) : null;
      return {
        ...(match || {}),
        id,
        rawEntry: idOrObj,
        uniqueKey: isObj && idOrObj.choice ? `${id}-${choiceLabel}-${idx}` : `${id}-${idx}`,
        name: isObj && idOrObj.name ? idOrObj.name : (match?.name || id.replace(/^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
        choice: isObj ? idOrObj.choice : null,
        choiceLabel,
        bp: isObj && idOrObj.bp !== undefined ? idOrObj.bp : (match?.bp || 1),
        tier: match?.tier || (isObj && idOrObj.tier ? idOrObj.tier : 'basic'),
        classification: match?.classification || (isObj && idOrObj.classification ? idOrObj.classification : 'Trait'),
        description: match?.description || 'Equipped species trait.'
      };
    });
  }, [selectedTraits, allAvailableTraits]);

  // Render Trait Card with Detailed Tooltip Card & Choice indicators
  const renderTraitCard = (trait) => {
    const equippedInstances = activeEquippedTraitsList.filter(t => t.id === trait.id);
    const isSelected = equippedInstances.length > 0;
    const choiceConfig = getTraitChoiceConfig(trait);

    return (
      <OmnicortexTooltip
        key={trait.id}
        content={<TraitTooltipCard trait={trait} customTraits={dbTraits} />}
        color="#a855f7"
        className="w-full h-full"
      >
        <div
          className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative group h-full ${
            isSelected 
              ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50' 
              : 'bg-slate-950/70 border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-100 group-hover:text-purple-200 transition-colors">
                  {trait.name}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                  {trait.classification}
                </span>
                {choiceConfig && (
                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold flex items-center gap-0.5">
                    <Sparkles size={9} /> Choice
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">
              {trait.bp} CP
            </span>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
            {trait.description}
          </p>

          {/* Equipped Choices Badges if any */}
          {isSelected && equippedInstances.some(inst => inst.choiceLabel) && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-purple-500/20">
              {equippedInstances.map((inst, i) => (
                inst.choiceLabel && (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-400/50 text-purple-200 font-bold"
                  >
                    <span>{inst.choiceLabel}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTraitEntry(inst.rawEntry);
                      }}
                      className="hover:text-red-400 text-purple-300 transition-colors p-0.2 cursor-pointer"
                      title="Remove this choice"
                    >
                      <X size={10} />
                    </button>
                  </span>
                )
              ))}
            </div>
          )}

          <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-800/60 text-[9.5px]">
            <span className="text-slate-500 uppercase font-mono tracking-wider flex items-center gap-1">
              <span>{trait.tier} Tier</span>
              <Info size={10} className="text-purple-400 opacity-60 group-hover:opacity-100" />
            </span>

            <div className="flex items-center gap-1">
              {isSelected ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (choiceConfig) {
                        if (choiceConfig.allowMultiple) {
                          toggleTrait(trait.id);
                        } else {
                          toggleTrait(trait.id, equippedInstances[0]?.rawEntry);
                        }
                      } else {
                        toggleTrait(trait.id);
                      }
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer px-1.5 py-0.5 rounded hover:bg-emerald-950/40"
                    title={choiceConfig ? (choiceConfig.allowMultiple ? 'Add another variant' : 'Edit choice') : 'Active trait'}
                  >
                    <Check size={12} />
                    <span>{choiceConfig?.allowMultiple ? `Active (${equippedInstances.length}) +` : 'Active'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      equippedInstances.forEach(inst => removeTraitEntry(inst.rawEntry));
                    }}
                    className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                    title="Remove all instances"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleTrait(trait.id)}
                  className="text-slate-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-purple-500/40 font-bold"
                >
                  <Plus size={11} />
                  <span>{choiceConfig ? 'Configure' : 'Select'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </OmnicortexTooltip>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-slate-100 font-mono">
      {/* Top Header & Live CP Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Dna size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-purple-200">
              Species Genetics & CP Configurator
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
              <span>Budget: <strong className="text-purple-300">{bpData.budgetMin}–{bpData.budgetMax} CP</strong> ({selectedBudget})</span>
              <span className="text-slate-600">•</span>
              <span>Chassis: <strong className="text-sky-300">{selectedType}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Scale: <strong className="text-sky-300">{selectedSize}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Traits: <strong className="text-purple-300">{selectedTraits.length}</strong></span>
              {selectedDisadvantages.length > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>Flaws: <strong className="text-red-300">{selectedDisadvantages.length}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live CP Progress Meter */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Character Points</span>
            <span className={`text-sm font-bold ${bpData.isOverBudget ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {bpData.totalBPUsed} / {bpData.budgetMax} CP
            </span>
          </div>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                bpData.isOverBudget ? 'bg-red-500' : (bpPercent > 80 ? 'bg-amber-400' : 'bg-purple-500')
              }`}
              style={{ width: `${Math.min(100, bpPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Genetics Sub-Nav Rail + Active Viewport Layout ── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch min-h-[480px]">
        {/* Left Sub-Navigation Rail */}
        <nav
          aria-label="Species Genetics Sub-Navigation"
          className="w-full md:w-20 lg:w-22 shrink-0 bg-[#070a12]/95 backdrop-blur-md border border-slate-800/90 rounded-2xl flex flex-row md:flex-col items-center justify-between md:justify-start p-2 gap-1.5 shadow-xl select-none"
        >
          {/* Top Crest on Desktop */}
          <div className="hidden md:flex flex-col items-center justify-center py-1 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-md">
              <Dna size={16} />
            </div>
            <div className="w-5 h-px bg-slate-800/80 mt-1.5" />
          </div>

          {/* Rail Items */}
          <div className="flex flex-row md:flex-col items-center gap-1.5 w-full">
            {GENETICS_NAV_ITEMS.map(item => {
              const ItemIcon = item.icon;
              const isActive = activeTab === item.id;
              const itemCount = item.id === 'chassis'
                ? 1
                : item.id === 'traits' 
                ? selectedTraits.length 
                : item.id === 'attributes'
                ? (Object.values(attributes).filter(v => v !== 0).length + (skillBundles > 0 ? 1 : 0) + (formData.specific_skill_bonuses?.length || 0) || null)
                : item.id === 'features'
                ? ((formData.inherent_features?.length || 0) + (formData.recommended_features?.length || 0) || null)
                : item.id === 'movement' 
                ? selectedModes.length 
                : item.id === 'stigma'
                ? (selectedStigma && selectedStigma !== 'None' ? 1 : null)
                : item.id === 'disadvantages' 
                ? selectedDisadvantages.length 
                : item.id === 'modifiers'
                ? (formData.modifiers?.length || null)
                : null;

              return (
                <OmnicortexTooltip
                  key={item.id}
                  content={
                    <div className="p-2 space-y-1 max-w-xs font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: item.color }}>
                        <ItemIcon size={14} />
                        <span>{item.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{item.desc}</p>
                      {itemCount !== null && (
                        <div className="text-[10px] text-purple-300 pt-1 border-t border-slate-800">
                          Active Selections: {itemCount}
                        </div>
                      )}
                    </div>
                  }
                  color={item.color}
                  className="w-full"
                >
                  <button
                    type="button"
                    onClick={() => {
                      AudioService?.playTerminalBeep?.(1100, 0.02);
                      setActiveTab(item.id);
                    }}
                    className={`group relative w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border ${
                      isActive
                        ? 'bg-purple-950/70 border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                    }`}
                  >
                    {/* Left Glowing Indicator Bar on Desktop */}
                    {isActive && (
                      <span
                        className="hidden md:block absolute -left-2 top-2 bottom-2 w-1 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    {/* Bottom Glowing Bar on Mobile */}
                    {isActive && (
                      <span
                        className="md:hidden absolute left-2 right-2 -bottom-1 h-0.5 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                        style={{ backgroundColor: item.color }}
                      />
                    )}

                    {/* Icon Box */}
                    <div
                      className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        isActive
                          ? 'border-purple-400/80 shadow-sm'
                          : 'border-slate-800 group-hover:border-slate-700 bg-slate-950/60'
                      }`}
                      style={isActive ? { background: `${item.color}25`, borderColor: `${item.color}80` } : {}}
                    >
                      <ItemIcon size={16} style={{ color: isActive ? item.color : undefined }} className={isActive ? '' : 'text-slate-400 group-hover:text-slate-200'} />
                      {itemCount !== null && itemCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1 min-w-[15px] h-[15px] rounded-full bg-purple-500 text-slate-950 font-bold font-mono text-[9px] flex items-center justify-center shadow">
                          {itemCount}
                        </span>
                      )}
                    </div>

                    {/* Monospace Label Underneath */}
                    <span
                      className={`font-mono text-[8.5px] sm:text-[9px] uppercase tracking-wider text-center mt-1 truncate max-w-full px-0.5 leading-tight select-none ${
                        isActive ? 'font-extrabold' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                      style={isActive ? { color: item.color } : {}}
                    >
                      {item.shortLabel}
                    </span>
                  </button>
                </OmnicortexTooltip>
              );
            })}
          </div>

          {/* Bottom Status Slot on Desktop */}
          <div className="hidden md:flex w-full flex-col items-center gap-1 pt-2 border-t border-slate-800/80 mt-auto">
            <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">
              GEN CP
            </div>
            <div
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-center w-full truncate ${
                bpData.isOverBudget ? 'bg-red-950/80 text-red-400 border border-red-500/40' : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
              }`}
            >
              {bpData.totalBPUsed} CP
            </div>
          </div>
        </nav>

        {/* Right Active Viewport Panel */}
        <div className="flex-1 min-w-0 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 sm:p-4 min-h-[420px]">

      {/* Tab 1: Chassis & Physical Scale */}
      {activeTab === 'chassis' && (
        <div className="space-y-4">
          {/* Header Note */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs">
            <div className="flex items-center gap-2 text-sky-300">
              <Dna size={16} />
              <span className="font-bold uppercase tracking-wider">Biological Chassis & Physical Scale</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">BASTION Species Foundation</span>
          </div>

          {/* Budget Level & Species Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Budget Level */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Budget Tier
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => onChange('budget_level', e.target.value)}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400 font-mono"
              >
                {Object.keys(SPECIES_BUDGET_LEVELS).map(lvl => (
                  <option key={lvl} value={lvl}>{SPECIES_BUDGET_LEVELS[lvl].name} ({SPECIES_BUDGET_LEVELS[lvl].min}-{SPECIES_BUDGET_LEVELS[lvl].max} CP)</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Target: {SPECIES_BUDGET_LEVELS[selectedBudget]?.desc || 'Standard galactic species budget'}
              </span>
            </div>

            {/* Species Type (Chassis) */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between mb-1">
                <span>Species Type Chassis ({SPECIES_TYPES[selectedType]?.bp || 0} CP)</span>
                <OmnicortexTooltip content={<SpeciesTypeSummaryCard typeId={selectedType} />} color="#38bdf8">
                  <span className="text-sky-400 hover:text-sky-300 cursor-help flex items-center gap-0.5" title="View Species Type Profile">
                    <Info size={11} /> Profile
                  </span>
                </OmnicortexTooltip>
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  onChange('species_type', e.target.value);
                  onChange('type', e.target.value);
                }}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400 font-mono"
              >
                {Object.keys(SPECIES_TYPES).map(t => (
                  <option key={t} value={t}>
                    {SPECIES_TYPES[t].name} ({SPECIES_TYPES[t].bp} CP)
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block truncate">
                Traits: {SPECIES_TYPES[selectedType]?.traits || 'None'}
              </span>
            </div>

            {/* Size Category */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between mb-1">
                <span>Size Category ({SPECIES_SIZES[selectedSize]?.bp || 0} CP)</span>
                <OmnicortexTooltip content={<SpeciesSizeSummaryCard sizeName={selectedSize} />} color="#38bdf8">
                  <span className="text-sky-400 hover:text-sky-300 cursor-help flex items-center gap-0.5" title="View Physical Scaling Breakdown">
                    <Info size={11} /> Breakdown
                  </span>
                </OmnicortexTooltip>
              </label>
              <select
                value={selectedSize}
                onChange={(e) => onChange('size', e.target.value)}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400 font-mono"
              >
                {Object.keys(SPECIES_SIZES).map(s => (
                  <option key={s} value={s}>
                    {SPECIES_SIZES[s].name} ({SPECIES_SIZES[s].bp} CP)
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Space: {SPECIES_SIZES[selectedSize]?.space || '5 ft'} • Reach: {SPECIES_SIZES[selectedSize]?.reach || '5 ft'}
              </span>
            </div>
          </div>

          {/* Combat & Physical Modifiers Bar */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Zap size={12} className="text-sky-400" />
              <span>Scale-Derived Combat & Physical Parameters</span>
            </span>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Attack Mod</span>
                <span className={`text-sm font-bold ${combatMods.combatMod > 0 ? 'text-emerald-400' : (combatMods.combatMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
                  {combatMods.combatMod >= 0 ? `+${combatMods.combatMod}` : combatMods.combatMod}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Defense Mod</span>
                <span className={`text-sm font-bold ${combatMods.defMod > 0 ? 'text-emerald-400' : (combatMods.defMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
                  {combatMods.defMod >= 0 ? `+${combatMods.defMod}` : combatMods.defMod}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Stealth Mod</span>
                <span className={`text-sm font-bold ${combatMods.stealthMod > 0 ? 'text-emerald-400' : (combatMods.stealthMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
                  {combatMods.stealthMod >= 0 ? `+${combatMods.stealthMod}` : combatMods.stealthMod}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Stability</span>
                <span className={`text-sm font-bold ${combatMods.stabilityMod > 0 ? 'text-emerald-400' : (combatMods.stabilityMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
                  {combatMods.stabilityMod >= 0 ? `+${combatMods.stabilityMod}` : combatMods.stabilityMod}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Str / Agi Stat</span>
                <span className="text-xs font-bold text-slate-200">
                  {combatMods.strMod >= 0 ? `+${combatMods.strMod}` : combatMods.strMod} Str / {combatMods.agiMod >= 0 ? `+${combatMods.agiMod}` : combatMods.agiMod} Agi
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Tactical Speed</span>
                <span className="text-xs font-bold text-sky-300">
                  {combatMods.speedMult > 1 ? `x${combatMods.speedMult}` : `${combatMods.speedMod >= 0 ? '+' : ''}${combatMods.speedMod} ft`}
                </span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-relaxed">
              *Physical scale automatically applies geometric size modifiers to attack accuracy, defensive evasion, stealth rolls, and encumbrance limits per BASTION rules.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Racial Traits Catalog (Inline View) */}
      {activeTab === 'traits' && (
        <div className="space-y-3">
          {/* Controls Bar: Tier Pills, Classification, Search & Full-Window Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTraitTier('all')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All ({allAvailableTraits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTraitTier('basic')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'basic' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Basic (1 CP)
                </button>
                <button
                  type="button"
                  onClick={() => setTraitTier('advanced')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'advanced' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Adv (2 CP)
                </button>
                <button
                  type="button"
                  onClick={() => setTraitTier('elite')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'elite' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Elite (4 CP)
                </button>
              </div>

              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="p-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-mono focus:outline-none"
              >
                <option value="all">All Classifications</option>
                {availableClassifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search traits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 w-36 sm:w-48"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Full-Window Catalog Launcher */}
              <button
                type="button"
                onClick={() => setIsFullWindowCatalog(true)}
                className="px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                title="Expand Traits Catalog to Full Window"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Full Window</span>
              </button>
            </div>
          </div>

          {/* Equipped Traits Strip (Inline Quick Access) */}
          {activeEquippedTraitsList.length > 0 && (
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1 mr-1">
                <CheckCircle2 size={13} /> Equipped ({activeEquippedTraitsList.length}):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeEquippedTraitsList.map((t, idx) => (
                  <span
                    key={`${t.id}-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-purple-500/40 text-[11px] text-slate-200"
                  >
                    <span className="font-semibold">{t.name}</span>
                    {t.choiceLabel && (
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-purple-900/70 border border-purple-400/50 text-purple-200 font-bold">
                        {t.choiceLabel}
                      </span>
                    )}
                    {t.choiceConfig && (
                      <button
                        type="button"
                        onClick={() => toggleTrait(t.id, t.rawEntry)}
                        className="hover:text-purple-300 text-slate-400 ml-0.5 cursor-pointer"
                        title="Edit choice"
                      >
                        <Edit3 size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeTraitEntry(t.rawEntry)}
                      className="hover:text-red-400 text-slate-500 ml-0.5 cursor-pointer"
                      title="Remove trait"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Traits Grid (Spacious Inline View) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTraits.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-500">
                No traits found matching current filters.
              </div>
            ) : (
              filteredTraits.map(renderTraitCard)
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Attributes & Skills */}
      {activeTab === 'attributes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <Activity size={16} />
              <span className="font-bold uppercase tracking-wider">Biological Attribute Bonuses & Skill Proficiencies</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">1 Attribute pt = 5 CP • 1 Skill pt = 1 CP</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'str', name: 'Strength (STR)', desc: 'Physical power and melee damage' },
              { id: 'agi', name: 'Agility (AGI)', desc: 'Reflexes, speed, and evasion' },
              { id: 'sta', name: 'Stamina (STA)', desc: 'Durability, health, and fortitude' },
              { id: 'int', name: 'Intellect (INT)', desc: 'Reasoning, tech, and memory' },
              { id: 'wis', name: 'Wisdom (WIS)', desc: 'Awareness, willpower, and intuition' },
              { id: 'cha', name: 'Charisma (CHA)', desc: 'Presence, leadership, and social influence' }
            ].map(attr => {
              const val = Number(attributes[attr.id] || 0);
              const cost = val * 5;
              return (
                <div key={attr.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{attr.name}</span>
                    <span className={`text-[10px] font-bold ${cost > 0 ? 'text-purple-400' : (cost < 0 ? 'text-emerald-400' : 'text-slate-500')}`}>
                      {cost >= 0 ? `+${cost}` : cost} CP
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => updateAttribute(attr.id, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className={`text-base font-bold font-mono ${val > 0 ? 'text-emerald-400' : (val < 0 ? 'text-red-400' : 'text-slate-300')}`}>
                      {val >= 0 ? `+${val}` : val}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateAttribute(attr.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skill Point Bundles */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">+5 Skill Points Bundle (5 CP)</span>
              <span className="text-[10px] text-slate-400">Add bundles of 5 racial skill points for custom proficiencies (1 CP per skill pt)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange('skill_bundles', Math.max(0, skillBundles - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <Minus size={13} />
              </button>
              <span className="text-sm font-bold text-purple-300 font-mono">
                {skillBundles * 5} pts ({skillBundles * 5} CP)
              </span>
              <button
                type="button"
                onClick={() => onChange('skill_bundles', skillBundles + 1)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Specific Skill Aptitude Bonuses */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider flex items-center gap-1.5">
                  <Brain size={14} className="text-emerald-400" />
                  <span>Specific Skill Aptitudes</span>
                </span>
                <span className="text-[10.5px] text-slate-400">Instinctual or cultural skill proficiencies (+1 to +3) possessed by this species</span>
              </div>
            </div>
            <SkillBonusesSelector
              value={formData.specific_skill_bonuses || []}
              onChange={(val) => onChange('specific_skill_bonuses', val)}
              onOpenPicker={onOpenPicker ? () => onOpenPicker({
                source: 'skills',
                target: 'specific_skill_bonuses',
                label: 'Skill Bonuses'
              }) : null}
              isEditMode={isEditMode}
              dbSkills={dbData.skills || []}
            />
          </div>
        </div>
      )}

      {/* Tab 4: Features & Perks */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
            <div className="flex items-center gap-2 text-purple-300">
              <BookOpen size={16} />
              <span className="font-bold uppercase tracking-wider">Inherent & Recommended Species Features</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Omnicortex Features Catalog</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inherent Features */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div>
                <span className="text-xs font-bold text-emerald-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Inherent Features</span>
                </span>
                <span className="text-[10.5px] text-slate-400">Naturally and permanently possessed by all members of this species</span>
              </div>
              <FeaturesSelector
                value={formData.inherent_features || []}
                onChange={(val) => onChange('inherent_features', val)}
                onOpenPicker={onOpenPicker ? () => onOpenPicker({
                  source: 'trait',
                  target: 'inherent_features',
                  label: 'Inherent Features'
                }) : null}
                isEditMode={isEditMode}
                dbFeatures={dbData.trait || dbData.traits || dbData.features || []}
                variant="emerald"
              />
            </div>

            {/* Recommended Features */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div>
                <span className="text-xs font-bold text-purple-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  <span>Recommended Features</span>
                </span>
                <span className="text-[10.5px] text-slate-400">Optional or culturally prevalent features suggested during character creation</span>
              </div>
              <FeaturesSelector
                value={formData.recommended_features || []}
                onChange={(val) => onChange('recommended_features', val)}
                onOpenPicker={onOpenPicker ? () => onOpenPicker({
                  source: 'trait',
                  target: 'recommended_features',
                  label: 'Recommended Features'
                }) : null}
                isEditMode={isEditMode}
                dbFeatures={dbData.trait || dbData.traits || dbData.features || []}
                variant="purple"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Movement Modes & Locomotion */}
      {activeTab === 'movement' && (
        <div className="space-y-3">
          {/* Top Calculated Speed & Cost Banner */}
          <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <div>
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                  Active Calculated Speeds (Additive Locomotion)
                </span>
                <span className="text-xs font-bold text-slate-100 font-mono">
                  {bpData.speedsFormatted || 'Ground 30 ft'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Total Movement Cost</span>
              <span className={`text-xs font-bold font-mono ${bpData.breakdown.movementBP > 0 ? 'text-purple-300' : (bpData.breakdown.movementBP < 0 ? 'text-emerald-300' : 'text-slate-400')}`}>
                {bpData.breakdown.movementBP > 0 ? `+${bpData.breakdown.movementBP}` : bpData.breakdown.movementBP} CP
              </span>
            </div>
          </div>

          {/* Active Equipped Modes Quick Chips */}
          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Equipped Modes ({selectedModes.length})
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Click X to remove
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedModes.map(modeId => {
                const canonicalId = resolveMovementId(modeId);
                const match = getMovementById(canonicalId) || DEFAULT_SPECIES_MOVEMENT.find(m => m.id === modeId || m.id === canonicalId || m.name.toLowerCase() === String(modeId).toLowerCase()) || {
                  id: canonicalId || modeId,
                  name: String(modeId).replace(/^species_movement-/, '').replace(/^movement-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  base_speed: 30,
                  bp: 0
                };
                return (
                  <OmnicortexTooltip key={modeId} content={<MovementModeSummaryCard mode={match} />} color="#f59e0b">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono">
                      <span className="font-bold">{match.name}</span>
                      <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        {match.base_speed || match.speed || 30} ft
                      </span>
                      {match.bp !== undefined && (
                        <span className={`text-[9.5px] px-1 py-0.2 rounded font-bold ${
                          match.bp > 0 ? 'bg-purple-500/20 text-purple-300' : (match.bp < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                        }`}>
                          {match.bp > 0 ? `+${match.bp} CP` : (match.bp < 0 ? `${match.bp} CP` : '0 CP')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMovementMode(modeId);
                        }}
                        className="p-0.5 hover:text-red-400 text-slate-400 transition-colors ml-0.5 cursor-pointer"
                        title="Remove mode"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  </OmnicortexTooltip>
                );
              })}
            </div>
          </div>

          {/* Movement Category Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'all', label: 'All Locomotion' },
                { id: 'Ground', label: 'Ground' },
                { id: 'Flying', label: 'Flying' },
                { id: 'Swimming', label: 'Swimming' },
                { id: 'Climbing', label: 'Climbing' },
                { id: 'Burrowing', label: 'Burrowing' },
                { id: 'Flicker', label: 'Flicker' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMovementCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                    movementCategoryFilter === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Search modes & paces..."
                value={movementSearchQuery}
                onChange={(e) => setMovementSearchQuery(e.target.value)}
                className="w-full pl-8 pr-6 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              {movementSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMovementSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Locomotion Cards */}
          {Object.entries(SPECIES_MOVEMENT_GROUPS)
            .filter(([groupKey]) => movementCategoryFilter === 'all' || movementCategoryFilter.toLowerCase() === groupKey.toLowerCase())
            .map(([groupKey, group]) => {
              const q = movementSearchQuery.trim().toLowerCase();
              const filteredModes = group.modes.filter(m => !q || m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
              const filteredAdjusters = group.adjusters.filter(a => !q || a.name.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q));

              if (filteredModes.length === 0 && filteredAdjusters.length === 0) return null;

              const hasActiveModeInGroup = group.modes.some(m => selectedModes.some(sm => resolveMovementId(sm) === m.id)) || group.adjusters.some(a => selectedModes.some(sm => resolveMovementId(sm) === a.id));

              return (
                <div key={groupKey} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        {group.label}
                      </span>
                      {hasActiveModeInGroup && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {filteredModes.length} Modes • {filteredAdjusters.length} Adjusters
                    </span>
                  </div>

                  {filteredModes.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                        Base Modes
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredModes.map(mode => {
                          const isSelected = selectedModes.some(sm => resolveMovementId(sm) === mode.id);
                          return (
                            <OmnicortexTooltip
                              key={mode.id}
                              content={<MovementModeSummaryCard mode={mode} />}
                              color="#f59e0b"
                              className="w-full"
                            >
                              <button
                                type="button"
                                onClick={() => toggleMovementMode(mode.id)}
                                className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40' 
                                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                                }`}
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-100">{mode.name}</span>
                                    <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
                                      {mode.base_speed || mode.speed || 30} ft
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{mode.description}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                                    mode.bp > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {mode.bp > 0 ? `+${mode.bp} CP` : '0 CP'}
                                  </span>
                                </div>
                              </button>
                            </OmnicortexTooltip>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredAdjusters.length > 0 && (
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold uppercase block mb-1.5">
                        Associated Speed Adjusters (Additive to {groupKey})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredAdjusters.map(adj => {
                          const isSelected = selectedModes.some(sm => resolveMovementId(sm) === adj.id);
                          return (
                            <OmnicortexTooltip
                              key={adj.id}
                              content={<MovementModeSummaryCard mode={adj.name} />}
                              color="#f59e0b"
                              className="w-full"
                            >
                              <button
                                type="button"
                                onClick={() => toggleMovementMode(adj.id)}
                                className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? (adj.bp < 0 ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-amber-950/50 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]')
                                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
                                }`}
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-100">{adj.name}</span>
                                    {adj.speed_modifier !== undefined && adj.speed_modifier !== 0 && (
                                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                                        adj.speed_modifier > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                      }`}>
                                        {adj.speed_modifier > 0 ? `+${adj.speed_modifier} ft` : `${adj.speed_modifier} ft`}
                                      </span>
                                    )}
                                    {adj.isExclusive && (
                                      <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">*Exclusive</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{adj.description}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                                    adj.bp > 0 ? 'bg-purple-500/20 text-purple-300' : (adj.bp < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                                  }`}>
                                    {adj.bp > 0 ? `+${adj.bp} CP` : (adj.bp < 0 ? `${adj.bp} CP` : '0 CP')}
                                  </span>
                                </div>
                              </button>
                            </OmnicortexTooltip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Tab 4: Social Stigma (Prejudices & Cultural Penalties) */}
      {activeTab === 'stigma' && (
        <div className="space-y-4">
          {/* Top Stigma Status & Live Refund Banner */}
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">
                  Current Social Standing & Prejudices
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedStigma || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Reaction Check Penalty</span>
                <span className="text-xs font-bold text-rose-300 font-mono">
                  {stigmaTotalPenalty > 0 ? `-${stigmaTotalPenalty} to Social Reaction Checks` : 'Standard Reaction (0 Penalty)'}
                </span>
              </div>
              <div className="text-right border-l border-rose-500/30 pl-3">
                <span className="text-[10px] text-slate-400 block uppercase">Stigma CP Rebate</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {stigmaTotalPenalty > 0 ? `-${stigmaTotalPenalty} CP (Refund)` : '0 CP'}
                </span>
              </div>
              <OmnicortexTooltip content={<SocialStigmaSummaryCard stigma={selectedStigma} />} color="#f43f5e">
                <button type="button" className="p-2 rounded-lg bg-slate-900 border border-rose-500/40 text-rose-400 hover:text-white transition-colors cursor-help" title="View detailed stigma analysis">
                  <Info size={14} />
                </button>
              </OmnicortexTooltip>
            </div>
          </div>

          {/* Quick Canonical Presets Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={14} className="text-rose-400" />
                <span>Canonical BASTION Stigma Presets</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Click preset card to toggle into compound stigma
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {CANONICAL_SPECIES_STIGMAS.map(preset => {
                const isActive = preset.name === 'None' 
                  ? (!selectedStigma || selectedStigma === 'None' || selectedStigma === 'None (0 CP)')
                  : (selectedStigma && selectedStigma.toLowerCase().includes(preset.name.toLowerCase()));

                return (
                  <OmnicortexTooltip
                    key={preset.id}
                    content={<SocialStigmaSummaryCard stigma={preset.name} />}
                    color="#f43f5e"
                    className="w-full"
                  >
                    <button
                      type="button"
                      onClick={() => toggleStigmaPreset(preset.name)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-rose-950/70 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-400/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/40 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-rose-200' : 'text-slate-200'}`}>
                          {preset.label}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {preset.refund > 0 && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                              -{preset.refund} CP
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {preset.desc}
                      </p>
                    </button>
                  </OmnicortexTooltip>
                );
              })}
            </div>
          </div>

          {/* Custom Write-In & Compound Modifier Bar */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Custom / Compound Social Stigma String
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedStigma === 'None' ? '' : selectedStigma}
                onChange={(e) => handleStigmaChange(e.target.value || 'None')}
                placeholder="e.g. Synthetic (-2), Severe Xeno (-6)..."
                className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={() => handleStigmaChange('None')}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Clear (None)
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500">
              BASTION CP engine automatically parses numbers formatted as <code className="text-rose-300">(-X)</code> to calculate reaction penalties and CP refunds.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Disadvantages */}
      {activeTab === 'disadvantages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SPECIES_DISADVANTAGES.map(dis => {
            const isSelected = selectedDisadvantages.some(d => (typeof d === 'string' ? d : d?.id) === dis.id);
            return (
              <OmnicortexTooltip
                key={dis.id}
                content={<DisadvantageSummaryCard disadvantage={dis} />}
                color="#ef4444"
                className="w-full"
              >
                <button
                  type="button"
                  onClick={() => toggleDisadvantage(dis.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'bg-red-950/40 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-red-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100">{dis.name}</span>
                      <Info size={10} className="text-red-400 opacity-60" />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{dis.description}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      -{dis.refundBP} CP
                    </span>
                  </div>
                </button>
              </OmnicortexTooltip>
            );
          })}
        </div>
      )}

      {/* Tab 8: Unified Modifiers & CP Audit */}
      {activeTab === 'modifiers' && (
        <div className="space-y-4">
          {/* Top Audit Header */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <Sliders size={16} />
              <span className="font-bold uppercase tracking-wider">Character Point Audit & Unified Modifiers</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Omnicortex DBM Synchronized</span>
          </div>

          {/* Itemized CP Audit Breakdown */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Itemized Character Point Breakdown
              </span>
              <span className={`text-xs font-bold font-mono ${bpData.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                {bpData.totalBPUsed} / {bpData.budgetMax} CP Used
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Chassis Base</span>
                <span className="font-bold text-sky-300">+{bpData.breakdown?.typeBP || 0} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{selectedType}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Size Scale</span>
                <span className="font-bold text-sky-300">{bpData.breakdown?.sizeBP >= 0 ? `+${bpData.breakdown?.sizeBP || 0}` : bpData.breakdown?.sizeBP} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{selectedSize}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Locomotion</span>
                <span className="font-bold text-amber-300">{bpData.breakdown?.movementBP >= 0 ? `+${bpData.breakdown?.movementBP || 0}` : bpData.breakdown?.movementBP} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{selectedModes.length} modes</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Attributes</span>
                <span className="font-bold text-emerald-300">{bpData.breakdown?.attributeBP >= 0 ? `+${bpData.breakdown?.attributeBP || 0}` : bpData.breakdown?.attributeBP} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">Biological stats</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Skill Bundles</span>
                <span className="font-bold text-emerald-300">+{bpData.breakdown?.skillsBP || 0} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{skillBundles * 5} pts</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Racial Traits</span>
                <span className="font-bold text-purple-300">+{bpData.breakdown?.traitsBP || 0} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{selectedTraits.length} traits</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Stigma Rebate</span>
                <span className="font-bold text-emerald-400">-{stigmaTotalPenalty} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{selectedStigma || 'None'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Flaws Refund</span>
                <span className="font-bold text-emerald-400">-{bpData.breakdown?.disadvantagesRefund || 0} CP</span>
                <span className="text-[9px] text-slate-400 block truncate">{selectedDisadvantages.length} flaws</span>
              </div>
            </div>
          </div>

          {/* Universal Modifiers Widget */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Zap size={14} />
              <span>Active Omnicortex Modifiers</span>
            </div>
            <UniversalModifiersWidget
              modifiers={formData.modifiers || []}
              onChange={(newMods) => onChange('modifiers', newMods)}
              relationalData={dbData}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      )}
        </div>
      </div>

      {/* ── EXPANDED FULL-WINDOW TRAITS CATALOG MODAL ── */}
      {isFullWindowCatalog && (
        <div className="fixed inset-0 z-[300] w-screen h-screen bg-[#070a13] flex flex-col overflow-hidden select-none animate-fade-in font-mono">
          {/* Full Window Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30 bg-purple-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Dna size={22} />
              </div>
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-purple-100 flex items-center gap-2">
                  <span>Omnicortex Species Traits Catalog</span>
                  <span className="text-xs font-normal text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-500/40">
                    {allAvailableTraits.length} Canonical Traits
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select biological, sensory, combat, and metaphysical genetic traits for this species chassis.
                </p>
              </div>
            </div>

            {/* Live CP Progress & Close */}
            <div className="flex items-center gap-4">
              <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Budget</span>
                  <span className={`text-sm font-bold ${bpData.isOverBudget ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {bpData.totalBPUsed} / {bpData.budgetMax} CP
                  </span>
                </div>
                <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      bpData.isOverBudget ? 'bg-red-500' : (bpPercent > 80 ? 'bg-amber-400' : 'bg-purple-500')
                    }`}
                    style={{ width: `${Math.min(100, bpPercent)}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullWindowCatalog(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Full Window Catalog"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Full Window Filters Bar */}
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Filter size={13} /> Tier:
              </span>
              <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-700 text-xs">
                {[
                  { id: 'all', label: `All (${allAvailableTraits.length})` },
                  { id: 'basic', label: 'Basic (1 CP)' },
                  { id: 'advanced', label: 'Advanced (2 CP)' },
                  { id: 'elite', label: 'Elite (4 CP)' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTraitTier(t.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold uppercase cursor-pointer transition-all ${
                      traitTier === t.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-slate-400 ml-2">Type:</span>
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="p-1.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:border-purple-400 focus:outline-none"
              >
                <option value="all">All Classifications</option>
                {availableClassifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, rule, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Full Window Two-Column Body: Catalog Grid + Pinned Active Drawer */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Main Grid Viewport */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTraits.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500">
                  <Search size={36} className="mb-3 opacity-40 text-purple-400" />
                  <p className="text-sm font-bold">No traits matching current criteria</p>
                  <p className="text-xs text-slate-600 mt-1">Try resetting the search or filter pills.</p>
                </div>
              ) : (
                filteredTraits.map(renderTraitCard)
              )}
            </div>

            {/* Pinned Active Traits Sidebar */}
            <aside className="w-80 shrink-0 border-l border-slate-800 bg-[#06080e] p-5 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 min-h-0 flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Equipped Traits ({activeEquippedTraitsList.length})
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {bpData.breakdown?.traitsBP || 0} CP Total
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {activeEquippedTraitsList.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs italic">
                      No traits currently equipped.<br />Click any card on the left to select.
                    </div>
                  ) : (
                    activeEquippedTraitsList.map((t, idx) => (
                      <OmnicortexTooltip
                        key={`${t.id}-${idx}`}
                        content={<TraitTooltipCard trait={t} customTraits={dbTraits} />}
                        color="#c084fc"
                        className="w-full"
                      >
                        <div
                          className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between gap-2 group hover:border-purple-400 transition-colors cursor-help"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-200 block truncate">{t.name}</span>
                            {t.choiceLabel && (
                              <span className="inline-block text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-purple-900/60 border border-purple-400/40 text-purple-300 font-bold mt-0.5">
                                {t.choiceLabel}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{t.classification} • {t.bp} CP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {t.choiceConfig && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTrait(t.id, t.rawEntry);
                                }}
                                className="p-1 rounded-lg hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                                title="Edit choice"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTraitEntry(t.rawEntry);
                              }}
                              className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove trait"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </OmnicortexTooltip>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Commit Action */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsFullWindowCatalog(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Done & Return to Studio
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Trait Choice Selection Modal */}
      {activeChoiceModal && (
        <TraitChoiceModal
          isOpen={Boolean(activeChoiceModal)}
          trait={activeChoiceModal.trait}
          config={activeChoiceModal.config}
          existingChoice={activeChoiceModal.existingChoice}
          dbData={dbData}
          onConfirm={handleConfirmTraitChoice}
          onClose={() => setActiveChoiceModal(null)}
        />
      )}
    </div>
  );
};

export default SpeciesTraitSelector;
