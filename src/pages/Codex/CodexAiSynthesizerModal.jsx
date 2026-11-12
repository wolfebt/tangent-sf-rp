import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  X,
  AlertCircle,
  Cpu,
  Database,
  Sparkles,
  Layers,
  Shuffle,
  Search,
  Check,
  Plus,
  Dna,
  ShieldAlert,
  RotateCcw,
  Sliders,
  Trash2,
  Calculator,
  BookOpen,
  Award
} from 'lucide-react';
import { synthesizeMatrixWithBastion } from '../../services/bastionService';
import { AudioService } from '../../services/audioService';
import { CodexIngestionEngine } from './CodexIngestionEngine';
import { getDatasetByKey } from './codexPromptRegistry';
import { getSynthesizerProfile } from './codexSynthesizerConfig';
import { useDBM } from '../../context/DBMContext';
import {
  ALL_SPECIES_TRAITS,
  SPECIES_TRAITS_BASIC,
  SPECIES_TRAITS_ADVANCED,
  SPECIES_TRAITS_ELITE,
  ORIGIN_TRAITS,
  OCCUPATIONAL_TRAITS,
  ARCHETYPE_TRAITS,
  FACTION_TRAITS
} from '../../data/speciesTraitsData';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../../data/speciesDisadvantagesData';
import {
  getTraitChoiceConfig,
  getOptionsForChoiceType
} from '../../data/speciesTraitChoices';
import {
  ALL_CANONICAL_SKILLS,
  SKILL_SUBCATEGORY_FILTERS,
  SKILL_ATTRIBUTE_FILTERS,
  buildNormalizedSkillsCatalog
} from '../../data/skillsData';
import {
  FEATURE_CATEGORIES,
  buildNormalizedFeaturesCatalog
} from '../../data/featuresData';

const DEFAULT_CURATED_SPECIES_TRAIT_IDS = [
  'trait-low-light-vision',
  'trait-dark-sight',
  'trait-natural-armor',
  'trait-exoskeleton-light',
  'trait-natural-weapons',
  'trait-quick',
  'trait-climber',
  'trait-amphibious',
  'trait-prehensile-tail',
  'trait-additional-limbs',
  'trait-mind-speech',
  'trait-awakened-psychic',
  'trait-camouflage',
  'trait-active-camouflage',
  'trait-flight',
  'trait-regeneration',
  'trait-hardy',
  'trait-g-force-immunity'
];

const CANONICAL_ATTRIBUTES = [
  'Strength',
  'Agility',
  'Stamina',
  'Intellect',
  'Wisdom',
  'Charisma',
  'Might',
  'Reflex',
  'Fortitude',
  'Logic',
  'Will',
  'Etiquette'
];

const CANONICAL_DR_TARGETS = [
  'Natural Armor DR',
  'Kinetic / Ballistic DR',
  'Energy / Thermal DR',
  'Chitinous Carapace DR',
  'Subdermal Plating DR',
  'Environmental / Radiation DR'
];

const CANONICAL_SPEED_TARGETS = [
  'Base Land Speed (ft)',
  'Climb Speed (ft)',
  'Swim Speed (ft)',
  'Fly Speed (ft)',
  'Burrow Speed (ft)',
  'Zero-G Maneuver Speed (ft)'
];

const CANONICAL_COMBAT_TARGETS = [
  'Initiative',
  'Defense (Dodge)',
  'Melee Attack',
  'Ranged Attack',
  'Natural Weapon Damage',
  'Melee Reach (ft)',
  'Stability',
  'Vitality',
  'Health',
  'Structure Points (SP)',
  'Resolve'
];

const CANONICAL_RESISTANCE_TARGETS = [
  'Poison & Toxin Save',
  'Disease & Pathogen Save',
  'Vacuum / Decompression',
  'Extreme Heat / Cold',
  'High-G Acceleration',
  'Psionic / Mind Shield',
  'Ion / EMP Resistance'
];

const MODIFIER_TYPE_OPTIONS = [
  { value: 'trait_default', label: 'Trait Built-In Mechanic' },
  { value: 'attribute', label: 'Attribute Mod (5 CP / +1)' },
  { value: 'skill', label: 'Skill Bonus (1 CP / +1)' },
  { value: 'armor_dr', label: 'Natural Armor / DR (+1 CP / DR)' },
  { value: 'speed', label: 'Speed / Movement (+1 CP / 5ft)' },
  { value: 'combat', label: 'Combat / Stat Bonus' },
  { value: 'resistance', label: 'Resistance / Save Bonus' },
  { value: 'custom', label: 'Custom Modifier / Rule' }
];

const PILLAR_TRAIT_META = {
  factions: {
    singularLabel: 'Faction Trait',
    pluralLabel: 'Faction Traits',
    traitType: 'Faction Trait',
    panelTitle: 'Selectable Faction Traits & Polity Perks',
    panelSubtitle:
      'Curate canonical 1-CP Faction Traits available to operatives and citizens of this polity (plus optional custom polity perks)',
    catalogTitle: 'Canonical Faction Traits Catalog',
    autoLoadLabel: '+ Load Matching Faction Traits',
    autoLoadTitle: 'Automatically select canonical Faction Traits matching your polity concept',
    searchPlaceholder: 'Search Faction Traits (e.g. Federal Authority, Solar Aura, Shadowmeld)...',
    customPlaceholder: 'Custom Faction Trait name (e.g. Syndicate Clearance, Fleet Birthright)...',
    selectionRuleHint: 'Operatives may purchase Faction Traits (1 CP each)'
  },
  origins: {
    singularLabel: 'Origin Trait',
    pluralLabel: 'Origin Traits',
    traitType: 'Origin Trait',
    panelTitle: 'Selectable Origin & Homeworld Traits',
    panelSubtitle:
      'Curate canonical 1-CP Origin Traits shaped by this habitat (characters choose 2 free at creation, +1 CP for extras)',
    catalogTitle: 'Canonical Origin Traits Catalog',
    autoLoadLabel: '+ Load Matching Origin Traits',
    autoLoadTitle: 'Automatically select canonical Origin Traits matching your habitat concept',
    searchPlaceholder: 'Search Origin Traits (e.g. Zero-G Acclimation, Urban Survival)...',
    customPlaceholder: 'Custom Origin Trait name (e.g. High-G Bone Density, Reef Navigator)...',
    selectionRuleHint: '2 Free Origin Traits at creation (+1 CP for extras)'
  },
  occupations: {
    singularLabel: 'Occupational Trait',
    pluralLabel: 'Occupational Traits',
    traitType: 'Occupational Trait',
    panelTitle: 'Selectable Occupational & Guild Traits',
    panelSubtitle:
      'Curate canonical 1-CP Occupational Traits conferred by this career (characters choose 2 free at creation, +1 CP for extras)',
    catalogTitle: 'Canonical Occupational Traits Catalog',
    autoLoadLabel: '+ Load Matching Occupational Traits',
    autoLoadTitle: 'Automatically select canonical Occupational Traits matching your career concept',
    searchPlaceholder: 'Search Occupational Traits (e.g. Trade Tools, High Pay, Hacking)...',
    customPlaceholder: 'Custom Occupational Trait name (e.g. Licensed Trauma Surgeon)...',
    selectionRuleHint: '2 Free Occupational Traits at creation (+1 CP for extras)'
  },
  archetypes: {
    singularLabel: 'Signature Archetype Trait',
    pluralLabel: 'Archetype Signature Traits',
    traitType: 'Archetype Trait',
    panelTitle: 'Archetype Signature Traits (80 CP Chassis)',
    panelSubtitle:
      'Select canonical 1-CP Signature Traits embedded in this 80 CP Persona Chassis (standard allocation: 2 Signature Traits = 2 CP)',
    catalogTitle: 'Canonical Archetype Signature Traits Catalog',
    autoLoadLabel: '+ Load Matching Signature Traits',
    autoLoadTitle: 'Automatically select Signature Archetype Traits matching your persona concept',
    searchPlaceholder: 'Search Archetype Traits (e.g. Infiltrator, Master of Logistics)...',
    customPlaceholder: 'Custom Signature Trait name (e.g. Breach Anchor, Tactical Broker)...',
    selectionRuleHint: 'Standard 80 CP Chassis includes 2 Signature Traits (2 CP)'
  }
};

const AXIS_CUSTOM_PLACEHOLDERS = {
  morphology:
    'Custom Morphology & Form (e.g., Bioluminescent Medusoid Symbiote, Hex-Limbed Mantid)...',
  genesis:
    'Custom Genesis & Biome (e.g., Sub-Glacial Hydrothermal Vent, Dyson Swarm Habitat)...',
  role:
    'Custom Tactical & Social Role (e.g., Astral Navigator Caste, Bio-Alchemical Medic)...',
  trait_system:
    'Custom Biological System (e.g., Magnetoreceptive Pineal Organ, Bio-Plasma Gland)...',
  trait_trigger:
    'Custom Activation & Trigger (e.g., Zero-G Freefall Reflex, Adrenaline Threshold)...',
  trait_effect:
    'Custom Mechanical Effect (e.g., +2 Initiative & Thermal Cloaking, Regenerate 2 HP/rd)...'
};

const classifySpeciesTraitDomain = (trait) => {
  const text = `${trait.id || ''} ${trait.name || ''} ${trait.mechanic || ''} ${trait.description || ''} ${trait.classification || ''}`.toLowerCase();
  const domains = new Set();

  if (
    /vision|sight|sense|scent|hearing|blind|thermal|ether|telepath|mind|psychic|awakened|hive|memory|linguist|sleepless|psionic/.test(
      text
    )
  ) {
    domains.add('sensory_psi');
  }
  if (
    /armor|exoskeleton|carapace|dr\b|damage reduction|weapon|claw|fang|bite|venom|toxin|toxic|breath|brutal|frenzy|charge|grapple|constriction|regen|fast heal|hardy|resistant|immunity|skeletal/.test(
      text
    )
  ) {
    domains.add('combat_armor');
  }
  if (
    /flight|fly|wing|patagia|climb|swim|amphibious|aquatic|quadruped|hexapedal|digitigrade|runner|quick|leaper|limb|appendage|tail|alter form|alternate form|bodyform|chameleon|camouflage|stealth|silent/.test(
      text
    )
  ) {
    domains.add('mobility_form');
  }

  return domains;
};

const parseCpFromOptionString = (str) => {
  if (!str || typeof str !== 'string') return 0;
  const match = str.match(/\(([+-]?\d+)\s*CP\)/i);
  return match ? Number(match[1]) || 0 : 0;
};

const getDefaultTargetsForModType = (modType, skillNames = []) => {
  switch (modType) {
    case 'attribute':
      return CANONICAL_ATTRIBUTES;
    case 'skill':
      return skillNames.length > 0 ? skillNames : ['Perception', 'Stealth', 'Athletics', 'Survival'];
    case 'armor_dr':
      return CANONICAL_DR_TARGETS;
    case 'speed':
      return CANONICAL_SPEED_TARGETS;
    case 'combat':
      return CANONICAL_COMBAT_TARGETS;
    case 'resistance':
      return CANONICAL_RESISTANCE_TARGETS;
    default:
      return [];
  }
};

// Inspect a canonical Cortex Trait or Flaw to infer its default adjoining modifier fields
const inferTraitAdjoiningModifier = (trait) => {
  if (!trait) {
    return {
      modType: 'trait_default',
      modTarget: '',
      modValue: '',
      modNotes: '',
      intrinsicModType: 'trait_default',
      intrinsicModValue: 0
    };
  }

  const firstMod = Array.isArray(trait.modifiers) && trait.modifiers.length > 0 ? trait.modifiers[0] : null;
  const mech = (trait.mechanic || '').toString();

  if (firstMod) {
    const rawTarget = String(firstMod.target || '').trim();
    const rawType = String(firstMod.type || '').toLowerCase();
    const numVal = Number(firstMod.value);
    const val = Number.isFinite(numVal) ? numVal : 1;

    const matchedAttr = CANONICAL_ATTRIBUTES.find(
      (a) => a.toLowerCase() === rawTarget.toLowerCase()
    );
    if (matchedAttr || rawType === 'attribute') {
      const targetAttr = matchedAttr || CANONICAL_ATTRIBUTES[0];
      return {
        modType: 'attribute',
        modTarget: targetAttr,
        modValue: val,
        modNotes: firstMod.description || mech,
        intrinsicModType: 'attribute',
        intrinsicModValue: val
      };
    }

    if (rawType === 'skill' || ALL_CANONICAL_SKILLS.some((s) => s.name.toLowerCase() === rawTarget.toLowerCase())) {
      const matchedSkill =
        ALL_CANONICAL_SKILLS.find((s) => s.name.toLowerCase() === rawTarget.toLowerCase())?.name ||
        rawTarget ||
        'Perception';
      return {
        modType: 'skill',
        modTarget: matchedSkill,
        modValue: val,
        modNotes: firstMod.description || mech,
        intrinsicModType: 'skill',
        intrinsicModValue: val
      };
    }

    if (/dr|armor|carapace|exoskeleton/i.test(rawTarget) || /dr|armor/i.test(rawType)) {
      return {
        modType: 'armor_dr',
        modTarget: 'Natural Armor DR',
        modValue: val,
        modNotes: firstMod.description || mech,
        intrinsicModType: 'armor_dr',
        intrinsicModValue: val
      };
    }

    if (/speed|move|fly|swim|climb/i.test(rawTarget)) {
      const targetSpeed = /fly/i.test(rawTarget)
        ? 'Fly Speed (ft)'
        : /swim/i.test(rawTarget)
          ? 'Swim Speed (ft)'
          : /climb/i.test(rawTarget)
            ? 'Climb Speed (ft)'
            : 'Base Land Speed (ft)';
      return {
        modType: 'speed',
        modTarget: targetSpeed,
        modValue: val,
        modNotes: firstMod.description || mech,
        intrinsicModType: 'speed',
        intrinsicModValue: val
      };
    }
  }

  // Fallback heuristics from trait mechanic string
  const drMatch = mech.match(/(?:DR\s*\+?(\d+)|\+(\d+)\s*(?:natural\s*)?DR)/i);
  if (drMatch) {
    const v = Number(drMatch[1] || drMatch[2]) || 1;
    return {
      modType: 'armor_dr',
      modTarget: 'Natural Armor DR',
      modValue: v,
      modNotes: mech,
      intrinsicModType: 'armor_dr',
      intrinsicModValue: v
    };
  }

  const speedMatch = mech.match(/\+(\d+)\s*ft/i);
  if (speedMatch) {
    const v = Number(speedMatch[1]) || 5;
    return {
      modType: 'speed',
      modTarget: 'Base Land Speed (ft)',
      modValue: v,
      modNotes: mech,
      intrinsicModType: 'speed',
      intrinsicModValue: v
    };
  }

  const bonusMatch = mech.match(/([+-]\d+)\s+(?:bonus\s+)?(?:to|on)\s+([A-Za-z\s/]+)/i);
  if (bonusMatch) {
    const v = Number(bonusMatch[1]) || 1;
    const targetPhrase = bonusMatch[2].trim();
    const matchedSkill = ALL_CANONICAL_SKILLS.find((s) =>
      targetPhrase.toLowerCase().includes(s.name.toLowerCase())
    );
    if (matchedSkill) {
      return {
        modType: 'skill',
        modTarget: matchedSkill.name,
        modValue: v,
        modNotes: mech,
        intrinsicModType: 'skill',
        intrinsicModValue: v
      };
    }
    return {
      modType: 'combat',
      modTarget: targetPhrase.slice(0, 36),
      modValue: v,
      modNotes: mech,
      intrinsicModType: 'combat',
      intrinsicModValue: v
    };
  }

  return {
    modType: 'trait_default',
    modTarget: trait.classification || 'Innate Adaptation',
    modValue: '',
    modNotes: mech,
    intrinsicModType: 'trait_default',
    intrinsicModValue: 0
  };
};

let adjustmentRowCounter = 1;
const createBlankAdjustmentRow = (overrides = {}) => ({
  rowId: `adj_row_${Date.now()}_${adjustmentRowCounter++}`,
  sourceType: 'cortex_trait', // 'cortex_trait' | 'cortex_flaw' | 'custom_trait' | 'standalone_mod'
  traitId: '',
  customName: '',
  tier: 'Basic',
  choiceValue: '',
  modType: 'trait_default',
  modTarget: '',
  modValue: '',
  modNotes: '',
  intrinsicModType: 'trait_default',
  intrinsicModValue: 0,
  customCp: null,
  ...overrides
});

export const CodexAiSynthesizerModal = ({
  isOpen,
  onClose,
  matrix,
  onApplyGeneratedData,
  onApplyIngestedEntry = null,
  initialDatasetKey = null,
  initialMode = 'synthesize'
}) => {
  const { dbData } = useDBM() || {};
  const resolvedDatasetKey = initialDatasetKey || matrix?.ingestionKey || matrix?.targetCollection || matrix?.id || 'compendium';
  const dataset = getDatasetByKey(resolvedDatasetKey);
  const profile = useMemo(
    () => getSynthesizerProfile(matrix, resolvedDatasetKey),
    [matrix, resolvedDatasetKey]
  );

  const [activeMode, setActiveMode] = useState(initialMode);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [selectedConceptIds, setSelectedConceptIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [activeAxisTab, setActiveAxisTab] = useState('all');

  // Part 1: Custom User Concept Style Entry Fields (per axis + general fallback)
  const [axisCustomInputs, setAxisCustomInputs] = useState({});
  const [axisCustomEntries, setAxisCustomEntries] = useState({});
  const [generalCustomConceptInput, setGeneralCustomConceptInput] = useState('');
  const [generalCustomConcepts, setGeneralCustomConcepts] = useState([]);

  // Part 3: Directives, Cortex Trait Browser & Custom Adjustments Builder with Cost Tracking
  const [activeDirectiveCategory, setActiveDirectiveCategory] = useState('all');
  const [activeTraitFilter, setActiveTraitFilter] = useState('suggested');
  const [traitSearchQuery, setTraitSearchQuery] = useState('');
  const [showAllTraitsInTab, setShowAllTraitsInTab] = useState(false);
  const [adjustmentRows, setAdjustmentRows] = useState(() => [createBlankAdjustmentRow()]);
  const [customPillarTraitInput, setCustomPillarTraitInput] = useState('');

  const isSpeciesPackageBuilder = profile.id === 'species';
  const pillarMeta = PILLAR_TRAIT_META[profile.id] || null;
  const isPillarTraitSelector = Boolean(pillarMeta);
  const is20SpPillarMatrix = ['origins', 'occupations', 'factions'].includes(profile.id);

  // Fixed 20-SP Skill Pool & Recommended Features (-1 CP) Catalog state for Origins, Occupations & Factions
  const [selectedPillarSkills, setSelectedPillarSkills] = useState([]);
  const [selectedRecommendedFeatures, setSelectedRecommendedFeatures] = useState([]);
  const [activePillarCatalogTab, setActivePillarCatalogTab] = useState('skills');
  const [skillGroupFilter, setSkillGroupFilter] = useState('all');
  const [skillSubcategoryFilter, setSkillSubcategoryFilter] = useState('all');
  const [skillAttrFilter, setSkillAttrFilter] = useState('all');
  const [skillCatalogSearch, setSkillCatalogSearch] = useState('');
  const [showAllSkillsInCatalog, setShowAllSkillsInCatalog] = useState(false);
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('all');
  const [featureCatalogSearch, setFeatureCatalogSearch] = useState('');
  const [showAllFeaturesInCatalog, setShowAllFeaturesInCatalog] = useState(false);

  const [customDirectives, setCustomDirectives] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetTechLevel, setTargetTechLevel] = useState(profile.defaultTl ?? 3);
  const [targetMetaLevel, setTargetMetaLevel] = useState(profile.defaultMl ?? 0);
  const [categoryParams, setCategoryParams] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const hasModularAxes = Array.isArray(profile.conceptAxes) && profile.conceptAxes.length > 0;
  const canonicalSkillNames = useMemo(
    () => ALL_CANONICAL_SKILLS.map((s) => s.name),
    []
  );

  // Flatten all preset modular items with their axis metadata
  const allModulesMap = useMemo(() => {
    const map = new Map();
    (profile.conceptAxes || []).forEach((axis) => {
      (axis.modules || []).forEach((mod) => {
        map.set(mod.id, {
          ...mod,
          axisId: axis.id,
          axisLabel: axis.shortLabel || axis.label
        });
      });
    });
    return map;
  }, [profile.conceptAxes]);

  // Combine preset selected modules AND per-axis custom user concept entries
  const customAxisModules = useMemo(() => {
    const list = [];
    if (hasModularAxes) {
      (profile.conceptAxes || []).forEach((axis) => {
        const pinned = axisCustomEntries[axis.id] || [];
        const liveDraft = (axisCustomInputs[axis.id] || '').trim();
        const combinedForAxis = [...pinned];
        if (
          liveDraft &&
          !combinedForAxis.some((item) => item.toLowerCase() === liveDraft.toLowerCase())
        ) {
          combinedForAxis.push(liveDraft);
        }
        combinedForAxis.forEach((text, idx) => {
          list.push({
            id: `custom_${axis.id}_${idx}_${text}`,
            axisId: axis.id,
            axisLabel: axis.shortLabel || axis.label,
            label: text,
            badge: `CUSTOM ${(axis.shortLabel || axis.id).toUpperCase()}`,
            prompt: `Custom ${axis.shortLabel || axis.label} directive: ${text}.`,
            isCustomAxisEntry: true,
            rawText: text,
            isLiveDraft: !pinned.includes(text)
          });
        });
      });
    } else {
      const pinned = generalCustomConcepts || [];
      const liveDraft = generalCustomConceptInput.trim();
      const combined = [...pinned];
      if (liveDraft && !combined.some((item) => item.toLowerCase() === liveDraft.toLowerCase())) {
        combined.push(liveDraft);
      }
      combined.forEach((text, idx) => {
        list.push({
          id: `custom_concept_${idx}_${text}`,
          axisId: 'custom',
          axisLabel: 'Custom Concept',
          label: text,
          badge: 'USER CUSTOM CONCEPT',
          prompt: `Custom user concept style: ${text}.`,
          isCustomAxisEntry: true,
          rawText: text,
          isLiveDraft: !pinned.includes(text)
        });
      });
    }
    return list;
  }, [
    hasModularAxes,
    profile.conceptAxes,
    axisCustomEntries,
    axisCustomInputs,
    generalCustomConcepts,
    generalCustomConceptInput
  ]);

  const selectedPresetModules = useMemo(
    () => selectedModuleIds.map((id) => allModulesMap.get(id)).filter(Boolean),
    [selectedModuleIds, allModulesMap]
  );

  const selectedModules = useMemo(
    () => [...selectedPresetModules, ...customAxisModules],
    [selectedPresetModules, customAxisModules]
  );

  const selectedConceptsList = useMemo(() => {
    if (selectedConceptIds.length > 0) {
      return (profile.concepts || []).filter((c) => selectedConceptIds.includes(c.id));
    }
    return selectedConcept ? [selectedConcept] : [];
  }, [profile.concepts, selectedConceptIds, selectedConcept]);

  // Build authoritative Cortex Species Traits (for Species Matrix) OR Pillar Traits (for Factions/Origins/Occupations/Archetypes)
  const cortexTraitsCatalog = useMemo(() => {
    const map = new Map();
    if (!isSpeciesPackageBuilder && !isPillarTraitSelector) return [];

    const defaultTraitType = isPillarTraitSelector ? pillarMeta.traitType : 'Species Trait';
    const defaultMechanicFallback = isPillarTraitSelector
      ? `Canonical ${pillarMeta.singularLabel} benefit.`
      : 'Canonical Cortex biological adaptation.';

    const addTrait = (raw, fallbackTier = 'Basic', fallbackCp = 1) => {
      if (!raw) return;
      const id = raw.id || raw.name;
      if (!id || map.has(id)) return;
      const cp = Number(raw.cp ?? raw.bp ?? raw.costs?.cp ?? raw.costs?.bp ?? fallbackCp) || 1;
      const rawTier = String(
        raw.trait_tier || raw.tier || (cp >= 4 ? 'Elite' : cp === 2 ? 'Advanced' : fallbackTier)
      );
      const tier = rawTier.charAt(0).toUpperCase() + rawTier.slice(1).toLowerCase();
      const rawMech = (raw.mechanic || raw.mechanics || raw.description || raw.desc || '')
        .toString()
        .replace(/^\[|\]$/g, '')
        .replace(/^\*\s*/, '')
        .trim();
      const traitObj = {
        id,
        name: raw.name || id.replace(/^trait[-_]/, '').replace(/[-_]/g, ' '),
        cp,
        bp: cp,
        tier,
        tierKey: tier.toLowerCase(),
        trait_type: raw.trait_type || defaultTraitType,
        classification: raw.classification || raw.type || (isPillarTraitSelector ? 'General' : 'Physical'),
        mechanic: rawMech || defaultMechanicFallback,
        description: (raw.description || raw.desc || rawMech || '').toString().trim(),
        modifiers: Array.isArray(raw.modifiers) ? raw.modifiers : []
      };
      traitObj.choiceConfig = getTraitChoiceConfig(traitObj);
      traitObj.domains = isSpeciesPackageBuilder ? classifySpeciesTraitDomain(traitObj) : new Set();
      map.set(id, traitObj);
    };

    if (isSpeciesPackageBuilder) {
      SPECIES_TRAITS_BASIC.forEach((t) => addTrait(t, 'Basic', 1));
      SPECIES_TRAITS_ADVANCED.forEach((t) => addTrait(t, 'Advanced', 2));
      SPECIES_TRAITS_ELITE.forEach((t) => addTrait(t, 'Elite', 4));
      ALL_SPECIES_TRAITS.forEach((t) => addTrait(t));

      const liveDbTraits = (dbData?.trait || dbData?.species_traits || []).filter(
        (t) => !['Origin Trait', 'Occupational Trait', 'Archetype Trait', 'Faction Trait'].includes(t?.trait_type)
      );
      liveDbTraits.forEach((t) => addTrait(t));
    } else if (isPillarTraitSelector) {
      const sourceList =
        profile.id === 'origins'
          ? ORIGIN_TRAITS
          : profile.id === 'occupations'
            ? OCCUPATIONAL_TRAITS
            : profile.id === 'archetypes'
              ? ARCHETYPE_TRAITS
              : FACTION_TRAITS;
      sourceList.forEach((t) => addTrait(t, 'Basic', 1));

      const livePillarTraits = (dbData?.traits || []).filter(
        (t) => t?.trait_type === pillarMeta.traitType
      );
      livePillarTraits.forEach((t) => addTrait(t, 'Basic', 1));
    }

    return Array.from(map.values());
  }, [profile.id, dbData, isSpeciesPackageBuilder, isPillarTraitSelector, pillarMeta]);

  // Build Cortex Species Disadvantages catalog (Strictly Species Package Builder Only)
  const cortexDisadvantagesCatalog = useMemo(() => {
    if (!isSpeciesPackageBuilder) return [];
    const map = new Map();
    const addDisadv = (raw) => {
      if (!raw) return;
      const id = raw.id || raw.name;
      if (!id || map.has(id)) return;
      const rawVal = Number(raw.cp ?? raw.refundCP ?? raw.bp ?? -2);
      const cp = rawVal > 0 ? -rawVal : rawVal || -2;
      const rawMech = (raw.mechanic || raw.mechanics || raw.description || raw.desc || '')
        .toString()
        .replace(/^\[|\]$/g, '')
        .trim();
      map.set(id, {
        id,
        name: raw.name || id.replace(/^disadvantage[-_](?:species[-_])?/, '').replace(/[-_]/g, ' '),
        cp,
        bp: cp,
        tier: 'Flaw',
        tierKey: 'flaw',
        isFlaw: true,
        classification: 'Disadvantage',
        mechanic: rawMech || 'Species physiological or psychological disadvantage granting CP rebate.',
        description: (raw.description || raw.desc || rawMech || '').toString().trim(),
        modifiers: Array.isArray(raw.modifiers) ? raw.modifiers : []
      });
    };

    (DEFAULT_SPECIES_DISADVANTAGES || []).forEach(addDisadv);
    (dbData?.disadvantages || []).forEach(addDisadv);
    return Array.from(map.values());
  }, [isSpeciesPackageBuilder, dbData]);

  const cortexTraitByIdMap = useMemo(() => {
    const map = new Map();
    cortexTraitsCatalog.forEach((t) => map.set(t.id, t));
    cortexDisadvantagesCatalog.forEach((d) => map.set(d.id, d));
    return map;
  }, [cortexTraitsCatalog, cortexDisadvantagesCatalog]);

  // Distinct classification categories available for Pillar Trait tabs
  const pillarClassificationTabs = useMemo(() => {
    if (!isPillarTraitSelector || cortexTraitsCatalog.length === 0) return [];
    const counts = new Map();
    cortexTraitsCatalog.forEach((t) => {
      const cls = String(t.classification || 'General').trim();
      if (!cls) return;
      counts.set(cls, (counts.get(cls) || 0) + 1);
    });
    return Array.from(counts.entries())
      .filter(([, count]) => count > 0)
      .map(([cls, count]) => ({
        id: `class_${cls.toLowerCase()}`,
        classification: cls,
        label: `${cls} (${count})`
      }));
  }, [isPillarTraitSelector, cortexTraitsCatalog]);

  // Compute Concept-Matched Traits based on active Part 1 Modular/Concept Selections
  const conceptSuggestedTraits = useMemo(() => {
    if (cortexTraitsCatalog.length === 0) return [];
    const suggestedIds = new Set();

    selectedModules.forEach((mod) => {
      (mod.suggestedTraits || []).forEach((tId) => suggestedIds.add(tId));
    });
    selectedConceptsList.forEach((conc) => {
      (conc.suggestedTraits || []).forEach((tId) => suggestedIds.add(tId));
    });

    const hasExplicitConceptSelection = suggestedIds.size > 0;
    if (!hasExplicitConceptSelection && isSpeciesPackageBuilder) {
      DEFAULT_CURATED_SPECIES_TRAIT_IDS.forEach((tId) => suggestedIds.add(tId));
    }

    const matched = [];
    suggestedIds.forEach((id) => {
      const found = cortexTraitsCatalog.find(
        (t) => t.id === id || t.name.toLowerCase() === String(id).toLowerCase()
      );
      if (found) matched.push(found);
    });

    if (!hasExplicitConceptSelection && matched.length === 0) {
      return cortexTraitsCatalog.slice(0, Math.min(10, cortexTraitsCatalog.length));
    }
    return matched;
  }, [cortexTraitsCatalog, selectedModules, selectedConceptsList, isSpeciesPackageBuilder]);

  // Filtered Traits for the active Part 3 tab & search query
  const filteredCortexTraits = useMemo(() => {
    const q = traitSearchQuery.trim().toLowerCase();
    const filterBySearch = (list) => {
      if (!q) return list;
      return list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.mechanic.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          String(item.classification || '').toLowerCase().includes(q) ||
          `${item.cp} cp`.includes(q)
      );
    };

    if (activeTraitFilter === 'flaws') {
      return filterBySearch(cortexDisadvantagesCatalog);
    }

    if (q) {
      return filterBySearch([...cortexTraitsCatalog, ...cortexDisadvantagesCatalog]);
    }

    if (activeTraitFilter.startsWith('class_')) {
      const targetCls = activeTraitFilter.replace(/^class_/, '');
      return cortexTraitsCatalog.filter(
        (t) => String(t.classification || '').toLowerCase() === targetCls
      );
    }

    switch (activeTraitFilter) {
      case 'suggested':
        return conceptSuggestedTraits;
      case 'all':
        return cortexTraitsCatalog;
      case 'basic':
        return cortexTraitsCatalog.filter((t) => t.tierKey === 'basic' || t.cp === 1);
      case 'advanced':
        return cortexTraitsCatalog.filter((t) => t.tierKey === 'advanced' || t.cp === 2);
      case 'elite':
        return cortexTraitsCatalog.filter((t) => t.tierKey === 'elite' || t.cp >= 4);
      case 'sensory_psi':
        return cortexTraitsCatalog.filter((t) => t.domains?.has('sensory_psi'));
      case 'combat_armor':
        return cortexTraitsCatalog.filter((t) => t.domains?.has('combat_armor'));
      case 'mobility_form':
        return cortexTraitsCatalog.filter((t) => t.domains?.has('mobility_form'));
      default:
        return cortexTraitsCatalog;
    }
  }, [
    activeTraitFilter,
    traitSearchQuery,
    cortexTraitsCatalog,
    cortexDisadvantagesCatalog,
    conceptSuggestedTraits
  ]);

  // Calculate CP breakdown for a single adjustment row
  const computeRowCostDetails = (row) => {
    const isBlankRow =
      row.sourceType === 'cortex_trait' &&
      !row.traitId &&
      !row.customName.trim() &&
      (row.modType === 'trait_default' || !row.modValue);

    if (isBlankRow && (row.customCp === null || row.customCp === '')) {
      return { baseTraitCp: 0, extraModCp: 0, autoCp: 0, effectiveCp: 0, isBlank: true };
    }

    const linkedItem = row.traitId ? cortexTraitByIdMap.get(row.traitId) : null;
    let baseTraitCp = 0;

    if (row.sourceType === 'cortex_trait' && linkedItem) {
      baseTraitCp = Number(linkedItem.cp) || 1;
    } else if (row.sourceType === 'cortex_flaw') {
      baseTraitCp = linkedItem ? Number(linkedItem.cp) || -2 : -2;
    } else if (row.sourceType === 'custom_trait') {
      baseTraitCp =
        row.tier === 'Elite'
          ? 4
          : row.tier === 'Advanced'
            ? 2
            : row.tier === 'Flaw'
              ? -2
              : 1;
    } else if (row.sourceType === 'standalone_mod') {
      baseTraitCp = 0;
    }

    // Calculate adjoining modifier CP surcharge (or standalone modifier CP)
    const numVal = Number(row.modValue) || 0;
    const isSameAsIntrinsic =
      row.sourceType !== 'standalone_mod' &&
      row.modType === row.intrinsicModType &&
      numVal === (Number(row.intrinsicModValue) || 0);

    let extraModCp = 0;
    if (!isSameAsIntrinsic && row.modType !== 'trait_default' && numVal !== 0) {
      const deltaVal =
        row.sourceType !== 'standalone_mod' && row.modType === row.intrinsicModType
          ? numVal - (Number(row.intrinsicModValue) || 0)
          : numVal;

      if (row.modType === 'attribute') {
        extraModCp = deltaVal * 5;
      } else if (row.modType === 'skill') {
        extraModCp = deltaVal * 1;
      } else if (row.modType === 'armor_dr') {
        extraModCp = deltaVal * 1;
      } else if (row.modType === 'speed') {
        extraModCp = Math.round(deltaVal / 5);
      } else if (
        row.sourceType === 'standalone_mod' &&
        ['combat', 'resistance', 'custom'].includes(row.modType)
      ) {
        extraModCp = deltaVal > 0 ? 1 : -1;
      }
    }

    const autoCp = baseTraitCp + extraModCp;
    const hasCustomOverride =
      row.customCp !== null && row.customCp !== '' && Number.isFinite(Number(row.customCp));
    const effectiveCp = hasCustomOverride ? Number(row.customCp) : autoCp;

    return {
      baseTraitCp,
      extraModCp,
      autoCp,
      effectiveCp,
      isBlank: false,
      linkedItem
    };
  };

  // Live Package Cost Tracker Summary across Part 2 Chassis + Part 3 Custom Adjustments
  const costTrackerSummary = useMemo(() => {
    const typeCp = parseCpFromOptionString(categoryParams.species_type);
    const sizeCp = parseCpFromOptionString(categoryParams.size_category);
    const speedParam = Number(categoryParams.base_speed);
    const baseSpeedCp =
      Number.isFinite(speedParam) && speedParam > 0 && categoryParams.base_speed !== undefined
        ? Math.round((speedParam - 30) / 5)
        : 0;
    const chassisCp = typeCp + sizeCp + baseSpeedCp;

    let traitsCp = 0;
    let modifiersCp = 0;
    let flawsCp = 0;
    let activeRowCount = 0;

    adjustmentRows.forEach((row) => {
      const details = computeRowCostDetails(row);
      if (details.isBlank) return;
      activeRowCount += 1;

      if (row.sourceType === 'standalone_mod') {
        modifiersCp += details.effectiveCp;
      } else if (row.sourceType === 'cortex_flaw' || details.effectiveCp < 0) {
        flawsCp += details.effectiveCp;
      } else {
        if (row.customCp !== null && row.customCp !== '') {
          traitsCp += details.effectiveCp;
        } else {
          traitsCp += details.baseTraitCp;
          modifiersCp += details.extraModCp;
        }
      }
    });

    const adjustmentsNetCp = traitsCp + modifiersCp + flawsCp;
    const totalPackageCp = chassisCp + adjustmentsNetCp;
    const targetBudgetCp =
      categoryParams.base_cp !== undefined && categoryParams.base_cp !== ''
        ? Number(categoryParams.base_cp)
        : profile.id === 'species'
          ? 20
          : null;

    return {
      typeCp,
      sizeCp,
      baseSpeedCp,
      chassisCp,
      traitsCp,
      modifiersCp,
      flawsCp,
      adjustmentsNetCp,
      totalPackageCp,
      targetBudgetCp,
      activeRowCount
    };
  }, [categoryParams, adjustmentRows, cortexTraitByIdMap, profile.id]);

  // Reset and synchronize category-specific defaults whenever the subject matrix/profile changes
  useEffect(() => {
    const initialParams = {};
    (profile.parameters || []).forEach((param) => {
      initialParams[param.key] =
        param.defaultValue ??
        matrix?.defaultValues?.[param.key] ??
        (param.options ? param.options[0] : '');
    });
    setCategoryParams(initialParams);
    setTargetTechLevel(profile.defaultTl ?? matrix?.defaultValues?.tl ?? matrix?.defaultValues?.tech_level ?? 3);
    setTargetMetaLevel(profile.defaultMl ?? matrix?.defaultValues?.ml ?? matrix?.defaultValues?.meta_level ?? 0);
    setSelectedConcept(null);
    setSelectedConceptIds([]);
    setSelectedModuleIds([]);
    setAxisCustomInputs({});
    setAxisCustomEntries({});
    setGeneralCustomConceptInput('');
    setGeneralCustomConcepts([]);
    setActiveAxisTab('all');
    setActiveDirectiveCategory('all');
    setActiveTraitFilter('suggested');
    setTraitSearchQuery('');
    setShowAllTraitsInTab(false);
    setAdjustmentRows([createBlankAdjustmentRow()]);
    setCustomPillarTraitInput('');
    setSelectedPillarSkills([]);
    setSelectedRecommendedFeatures([]);
    setActivePillarCatalogTab('skills');
    setSkillGroupFilter('all');
    setSkillSubcategoryFilter('all');
    setSkillAttrFilter('all');
    setSkillCatalogSearch('');
    setShowAllSkillsInCatalog(false);
    setFeatureCategoryFilter('all');
    setFeatureCatalogSearch('');
    setShowAllFeaturesInCatalog(false);
    setTargetName('');
    setCustomDirectives('');
    setGenerationError('');
  }, [profile.id, matrix?.id]);

  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode || 'synthesize');
      setGenerationError('');
    }
  }, [isOpen, initialMode]);

  const applyPresetParamsToState = (presetParams) => {
    if (!presetParams || typeof presetParams !== 'object') return;
    const { tl, ml, tech_level, meta_level, ...restParams } = presetParams;
    if (Object.keys(restParams).length > 0) {
      setCategoryParams((prev) => ({
        ...prev,
        ...restParams
      }));
    }
    if (tl !== undefined || tech_level !== undefined) {
      setTargetTechLevel(Number(tl ?? tech_level));
    }
    if (ml !== undefined || meta_level !== undefined) {
      setTargetMetaLevel(Number(ml ?? meta_level));
    }
  };

  const handleParamChange = (key, value) => {
    setCategoryParams((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Part 1: Add/Remove Custom User Concept Entry for a specific Axis
  const handleAddAxisCustomEntry = (axisId) => {
    const text = (axisCustomInputs[axisId] || '').trim();
    if (!text) return;
    AudioService.playTerminalBeep(1160, 0.02);
    setAxisCustomEntries((prev) => {
      const current = prev[axisId] || [];
      if (current.some((item) => item.toLowerCase() === text.toLowerCase())) return prev;
      return {
        ...prev,
        [axisId]: [...current, text]
      };
    });
    setAxisCustomInputs((prev) => ({
      ...prev,
      [axisId]: ''
    }));
  };

  const handleRemoveAxisCustomEntry = (axisId, entryText) => {
    AudioService.playTerminalBeep(980, 0.02);
    setAxisCustomEntries((prev) => ({
      ...prev,
      [axisId]: (prev[axisId] || []).filter((item) => item !== entryText)
    }));
    if ((axisCustomInputs[axisId] || '').trim() === entryText) {
      setAxisCustomInputs((prev) => ({ ...prev, [axisId]: '' }));
    }
  };

  const handleAddGeneralCustomConcept = () => {
    const text = generalCustomConceptInput.trim();
    if (!text) return;
    AudioService.playTerminalBeep(1160, 0.02);
    setGeneralCustomConcepts((prev) =>
      prev.some((c) => c.toLowerCase() === text.toLowerCase()) ? prev : [...prev, text]
    );
    setGeneralCustomConceptInput('');
  };

  const handleRemoveGeneralCustomConcept = (text) => {
    AudioService.playTerminalBeep(980, 0.02);
    setGeneralCustomConcepts((prev) => prev.filter((c) => c !== text));
    if (generalCustomConceptInput.trim() === text) {
      setGeneralCustomConceptInput('');
    }
  };

  // Starter Archetype selection
  const handleSelectConcept = (concept) => {
    AudioService.playTerminalBeep(1150, 0.02);

    if (hasModularAxes) {
      const isAlreadySelected = selectedConcept?.id === concept.id;
      if (isAlreadySelected) {
        setSelectedConcept(null);
        setSelectedModuleIds([]);
        return;
      }
      setSelectedConcept(concept);
      if (Array.isArray(concept.presetModules) && concept.presetModules.length > 0) {
        setSelectedModuleIds(concept.presetModules);
      }
      applyPresetParamsToState(concept.presetParams);
      return;
    }

    setSelectedConceptIds((prev) => {
      const exists = prev.includes(concept.id);
      const next = exists ? prev.filter((id) => id !== concept.id) : [...prev, concept.id];
      const primary = (profile.concepts || []).find((c) => c.id === next[next.length - 1]) || null;
      setSelectedConcept(primary);
      if (!exists && concept.presetParams) {
        applyPresetParamsToState(concept.presetParams);
      }
      return next;
    });
  };

  // Toggle individual modular concept block across any axis
  const handleToggleModule = (mod) => {
    if (mod.isCustomAxisEntry) {
      if (mod.axisId === 'custom') {
        handleRemoveGeneralCustomConcept(mod.rawText);
      } else {
        handleRemoveAxisCustomEntry(mod.axisId, mod.rawText);
      }
      return;
    }
    AudioService.playTerminalBeep(1120, 0.02);
    setSelectedModuleIds((prev) => {
      const exists = prev.includes(mod.id);
      const next = exists ? prev.filter((id) => id !== mod.id) : [...prev, mod.id];
      if (!exists && mod.presetParams) {
        applyPresetParamsToState(mod.presetParams);
      }
      return next;
    });
  };

  // Randomize 1 module from each modular axis to create an instant hybrid concept
  const handleRandomizeModularConcept = () => {
    AudioService.playTerminalBeep(1250, 0.03);
    if (hasModularAxes) {
      const pickedIds = [];
      let mergedParams = {};
      (profile.conceptAxes || []).forEach((axis) => {
        const mods = axis.modules || [];
        if (mods.length > 0) {
          const randomMod = mods[Math.floor(Math.random() * mods.length)];
          pickedIds.push(randomMod.id);
          if (randomMod.presetParams) {
            mergedParams = { ...mergedParams, ...randomMod.presetParams };
          }
        }
      });
      setSelectedConcept(null);
      setSelectedModuleIds(pickedIds);
      applyPresetParamsToState(mergedParams);
    } else if (Array.isArray(profile.concepts) && profile.concepts.length > 0) {
      const shuffled = [...profile.concepts].sort(() => 0.5 - Math.random()).slice(0, 2);
      setSelectedConceptIds(shuffled.map((c) => c.id));
      setSelectedConcept(shuffled[0]);
      if (shuffled[0]?.presetParams) {
        applyPresetParamsToState(shuffled[0].presetParams);
      }
    }
  };

  const handleClearConceptSelection = () => {
    AudioService.playTerminalBeep(950, 0.02);
    setSelectedConcept(null);
    setSelectedConceptIds([]);
    setSelectedModuleIds([]);
    setAxisCustomInputs({});
    setAxisCustomEntries({});
    setGeneralCustomConceptInput('');
    setGeneralCustomConcepts([]);
  };

  // Build an adjustment row from a Cortex Trait or Disadvantage object
  const buildRowFromCortexItem = (item) => {
    const inferred = inferTraitAdjoiningModifier(item);
    const choiceCfg = item.choiceConfig || getTraitChoiceConfig(item);
    const choiceOptions = choiceCfg ? getOptionsForChoiceType(choiceCfg.type, { dbData }) : [];
    const defaultChoice = choiceOptions.length > 0 ? choiceOptions[0].value : '';

    return createBlankAdjustmentRow({
      sourceType: item.isFlaw ? 'cortex_flaw' : 'cortex_trait',
      traitId: item.id,
      tier: item.tier || (item.isFlaw ? 'Flaw' : 'Basic'),
      choiceValue: defaultChoice,
      ...inferred,
      customCp: null
    });
  };

  // Toggle a canonical Cortex Trait or Disadvantage (syncs with adjustmentRows)
  const handleToggleCortexTrait = (item) => {
    AudioService.playTerminalBeep(1080, 0.02);
    setAdjustmentRows((prev) => {
      const exists = prev.some((r) => r.traitId === item.id);
      if (exists) {
        const filtered = prev.filter((r) => r.traitId !== item.id);
        return filtered.length > 0 ? filtered : [createBlankAdjustmentRow()];
      }
      const newRow = buildRowFromCortexItem(item);
      // Replace single blank starter row if present
      if (
        prev.length === 1 &&
        !prev[0].traitId &&
        !prev[0].customName.trim() &&
        prev[0].sourceType === 'cortex_trait' &&
        !prev[0].modValue
      ) {
        return [newRow];
      }
      return [...prev, newRow];
    });
  };

  // Auto-load top suggested Cortex Traits for the active modular concept into adjustmentRows
  const handleAutoLoadConceptTraits = () => {
    AudioService.playTerminalBeep(1220, 0.03);
    const toLoad = conceptSuggestedTraits.slice(0, 4);
    if (toLoad.length === 0) return;

    setAdjustmentRows((prev) => {
      const nonBlank = prev.filter(
        (r) => r.traitId || r.customName.trim() || r.sourceType === 'standalone_mod' || r.modValue !== ''
      );
      const existingIds = new Set(nonBlank.map((r) => r.traitId).filter(Boolean));
      const added = [];
      toLoad.forEach((trait) => {
        if (!existingIds.has(trait.id)) {
          added.push(buildRowFromCortexItem(trait));
        }
      });
      const combined = [...nonBlank, ...added];
      return combined.length > 0 ? combined : [createBlankAdjustmentRow()];
    });
  };

  // Pick 3 random Cortex traits for creative inspiration
  const handleRandomizeCortexTraits = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (cortexTraitsCatalog.length === 0) return;
    const shuffled = [...cortexTraitsCatalog].sort(() => 0.5 - Math.random()).slice(0, 3);
    setAdjustmentRows(shuffled.map((trait) => buildRowFromCortexItem(trait)));
  };

  // Custom Adjustment Row handlers
  const handleSelectRowTraitOrSource = (rowId, selectedValue) => {
    AudioService.playTerminalBeep(1090, 0.02);
    setAdjustmentRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;

        if (!selectedValue) {
          return createBlankAdjustmentRow({ rowId });
        }

        if (selectedValue === '__custom_trait__') {
          return {
            ...row,
            sourceType: 'custom_trait',
            traitId: '',
            customName: row.customName || 'Custom Adaptation',
            tier: 'Basic',
            choiceValue: '',
            modType: 'attribute',
            modTarget: 'Agility',
            modValue: 1,
            modNotes: '',
            intrinsicModType: 'trait_default',
            intrinsicModValue: 0,
            customCp: null
          };
        }

        if (selectedValue === '__standalone_mod__') {
          return {
            ...row,
            sourceType: 'standalone_mod',
            traitId: '',
            customName: '',
            tier: 'Modifier',
            choiceValue: '',
            modType: 'attribute',
            modTarget: 'Strength',
            modValue: 1,
            modNotes: 'Innate physiological modifier',
            intrinsicModType: 'none',
            intrinsicModValue: 0,
            customCp: null
          };
        }

        const item = cortexTraitByIdMap.get(selectedValue);
        if (item) {
          const built = buildRowFromCortexItem(item);
          return {
            ...built,
            rowId
          };
        }

        return row;
      })
    );
  };

  const handleUpdateAdjustmentRow = (rowId, patch) => {
    setAdjustmentRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const updated = { ...row, ...patch };

        // When modType changes, set a sensible default modTarget & modValue
        if (patch.modType !== undefined && patch.modType !== row.modType) {
          const targets = getDefaultTargetsForModType(patch.modType, canonicalSkillNames);
          updated.modTarget = targets[0] || '';
          if (patch.modType === 'trait_default') {
            updated.modValue = '';
          } else if (patch.modType === 'speed') {
            updated.modValue = 5;
          } else if (updated.modValue === '' || updated.modValue === 0) {
            updated.modValue = 1;
          }
        }
        return updated;
      })
    );
  };

  const handleAddAdjustmentRow = (presetType = 'trait') => {
    AudioService.playTerminalBeep(1140, 0.02);
    if (presetType === 'attribute') {
      setAdjustmentRows((prev) => [
        ...prev,
        createBlankAdjustmentRow({
          sourceType: 'standalone_mod',
          tier: 'Modifier',
          modType: 'attribute',
          modTarget: 'Agility',
          modValue: 1,
          modNotes: 'Primary attribute lineage modifier'
        })
      ]);
      return;
    }
    if (presetType === 'skill') {
      setAdjustmentRows((prev) => [
        ...prev,
        createBlankAdjustmentRow({
          sourceType: 'standalone_mod',
          tier: 'Modifier',
          modType: 'skill',
          modTarget: canonicalSkillNames[0] || 'Perception',
          modValue: 2,
          modNotes: 'Innate species skill aptitude'
        })
      ]);
      return;
    }
    if (presetType === 'flaw') {
      const defaultFlaw = cortexDisadvantagesCatalog[0];
      setAdjustmentRows((prev) => [
        ...prev,
        defaultFlaw
          ? buildRowFromCortexItem(defaultFlaw)
          : createBlankAdjustmentRow({
              sourceType: 'custom_trait',
              customName: 'Species Vulnerability',
              tier: 'Flaw',
              modType: 'custom',
              modTarget: 'Environmental Sensitivity',
              modValue: -2,
              customCp: -2
            })
      ]);
      return;
    }
    if (presetType === 'custom') {
      setAdjustmentRows((prev) => [
        ...prev,
        createBlankAdjustmentRow({
          sourceType: 'custom_trait',
          customName: 'Custom Bio-Adaptation',
          tier: 'Basic',
          modType: 'combat',
          modTarget: 'Initiative',
          modValue: 1
        })
      ]);
      return;
    }

    setAdjustmentRows((prev) => [...prev, createBlankAdjustmentRow()]);
  };

  const handleRemoveAdjustmentRow = (rowId) => {
    AudioService.playTerminalBeep(960, 0.02);
    setAdjustmentRows((prev) => {
      const next = prev.filter((r) => r.rowId !== rowId);
      return next.length > 0 ? next : [createBlankAdjustmentRow()];
    });
  };

  const handleAddCustomPillarTrait = () => {
    const cleanName = customPillarTraitInput.trim();
    if (!cleanName || !pillarMeta) return;
    AudioService.playTerminalBeep(1140, 0.02);
    setAdjustmentRows((prev) => {
      const nonBlank = prev.filter(
        (r) => r.traitId || r.customName.trim() || r.sourceType === 'standalone_mod' || r.modValue !== ''
      );
      if (nonBlank.some((r) => r.customName.trim().toLowerCase() === cleanName.toLowerCase())) {
        return prev;
      }
      const newRow = createBlankAdjustmentRow({
        sourceType: 'custom_trait',
        customName: cleanName,
        tier: 'Basic',
        modType: 'trait_default',
        modNotes: `Custom ${pillarMeta.singularLabel} (1 CP)`,
        customCp: 1
      });
      return [...nonBlank, newRow];
    });
    setCustomPillarTraitInput('');
  };

  const handleToggleQuickDirective = (directiveText) => {
    AudioService.playTerminalBeep(1050, 0.02);
    setCustomDirectives((prev) => {
      const current = prev.trim();
      if (current.toLowerCase().includes(directiveText.toLowerCase())) {
        return current
          .replace(
            new RegExp(
              `(?:^|;\\s*|\\.\\s*)${directiveText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
              'i'
            ),
            ''
          )
          .replace(/^[\s;.]+|[\s;]+$/g, '');
      }
      return current ? `${current}; ${directiveText}` : directiveText;
    });
  };

  // Composed modular archetype metadata for display and synthesis
  const composedArchetype = useMemo(() => {
    if (selectedModules.length > 0) {
      const combinedLabel = selectedConcept
        ? `${selectedConcept.label} (${selectedModules.map((m) => m.label).join(' + ')})`
        : selectedModules.map((m) => m.label).join(' + ');
      const combinedBadge = selectedModules
        .map((m) => m.badge)
        .filter(Boolean)
        .slice(0, 4)
        .join(' • ');
      const combinedPrompt = selectedModules.map((m) => `${m.label}: ${m.prompt}`).join(' ');
      const suggestedName =
        selectedConcept?.suggestedName ||
        selectedModules.find((m) => m.suggestedName)?.suggestedName ||
        '';
      return {
        id: selectedConcept?.id || 'modular_synthesis',
        name: combinedLabel,
        label: combinedLabel,
        badge: combinedBadge,
        prompt: combinedPrompt,
        suggestedName
      };
    }

    if (selectedConceptsList.length > 0) {
      const combinedLabel = selectedConceptsList.map((c) => c.label).join(' + ');
      const combinedBadge = selectedConceptsList
        .map((c) => c.badge)
        .filter(Boolean)
        .join(' • ');
      const combinedPrompt = selectedConceptsList.map((c) => c.prompt).join(' ');
      return {
        id: selectedConceptsList.map((c) => c.id).join('_'),
        name: combinedLabel,
        label: combinedLabel,
        badge: combinedBadge,
        prompt: combinedPrompt,
        suggestedName: selectedConceptsList[0]?.suggestedName || ''
      };
    }

    return null;
  }, [selectedModules, selectedConcept, selectedConceptsList]);

  // Compile all configured adjustment rows into structured Cortex Traits, Flaws, Modifiers, and Cost Payload
  const compiledAdjustmentsPayload = useMemo(() => {
    const traits = [];
    const disadvantages = [];
    const attribute_modifiers = {};
    const attributes = {};
    const specific_skill_bonuses = {};
    const bonus_skills = [];
    const movement_modes = [];
    const modifiers = [];
    const summaryParts = [];

    adjustmentRows.forEach((row) => {
      const details = computeRowCostDetails(row);
      if (details.isBlank) return;

      const linkedItem = details.linkedItem;
      const choiceCfg = linkedItem ? linkedItem.choiceConfig || getTraitChoiceConfig(linkedItem) : null;
      const choiceOptions = choiceCfg ? getOptionsForChoiceType(choiceCfg.type, { dbData }) : [];
      const selectedChoiceOpt = choiceOptions.find((o) => o.value === row.choiceValue);
      const choiceLabel = selectedChoiceOpt?.label || row.choiceValue || '';

      const numVal = Number(row.modValue);
      const hasNumericMod = row.modValue !== '' && Number.isFinite(numVal) && numVal !== 0;
      const formattedVal = hasNumericMod ? (numVal > 0 ? `+${numVal}` : `${numVal}`) : '';

      const modSummaryText =
        row.modType !== 'trait_default' && (row.modTarget || hasNumericMod)
          ? `${row.modTarget || row.modType}${formattedVal ? ` ${formattedVal}` : ''}${
              row.modNotes ? ` (${row.modNotes})` : ''
            }`
          : row.modNotes || linkedItem?.mechanic || '';

      // Record adjoining modifier into canonical attribute / skill / movement / stat structures
      const rowModifiersList = Array.isArray(linkedItem?.modifiers)
        ? [...linkedItem.modifiers]
        : [];

      if (row.modType === 'attribute' && row.modTarget && hasNumericMod) {
        const attrKey = row.modTarget.toLowerCase();
        attribute_modifiers[attrKey] = (attribute_modifiers[attrKey] || 0) + numVal;
        attributes[row.modTarget] = (attributes[row.modTarget] || 0) + numVal;
      } else if (row.modType === 'skill' && row.modTarget && hasNumericMod) {
        specific_skill_bonuses[row.modTarget] =
          (specific_skill_bonuses[row.modTarget] || 0) + numVal;
        if (!bonus_skills.includes(row.modTarget)) {
          bonus_skills.push(row.modTarget);
        }
      } else if (row.modType === 'speed' && row.modTarget && hasNumericMod) {
        const modeName = /fly/i.test(row.modTarget)
          ? 'Fly'
          : /swim/i.test(row.modTarget)
            ? 'Swim'
            : /climb/i.test(row.modTarget)
              ? 'Climb'
              : /burrow/i.test(row.modTarget)
                ? 'Burrow'
                : /zero-g/i.test(row.modTarget)
                  ? 'Zero-G'
                  : 'Walk';
        movement_modes.push({
          mode: modeName,
          speed: numVal,
          notes: row.modNotes || linkedItem?.name || 'Custom speed adjustment'
        });
      }

      if (choiceCfg?.type === 'skill' && choiceLabel) {
        if (!bonus_skills.includes(choiceLabel)) {
          bonus_skills.push(choiceLabel);
        }
      }

      if (row.modType !== 'trait_default' && (row.modTarget || hasNumericMod)) {
        const modObj = {
          target: row.modTarget || row.modType,
          type: row.modType,
          value: hasNumericMod ? numVal : 0,
          mode: 'inherent',
          description: modSummaryText,
          sourceTrait: linkedItem?.name || row.customName || 'Custom Adjustment',
          cp: details.effectiveCp
        };
        rowModifiersList.push(modObj);
        modifiers.push(modObj);
      }

      if (row.sourceType === 'standalone_mod') {
        summaryParts.push(
          `Standalone Modifier: ${modSummaryText} [${
            details.effectiveCp >= 0 ? `+${details.effectiveCp}` : details.effectiveCp
          } CP]`
        );
        return;
      }

      const defaultCustomTraitName = isPillarTraitSelector
        ? `Custom ${pillarMeta.singularLabel}`
        : 'Custom Species Adaptation';
      const defaultTraitType = isPillarTraitSelector ? pillarMeta.traitType : 'Species Trait';
      const defaultTraitMechanic = isPillarTraitSelector
        ? `Custom ${pillarMeta.singularLabel} (1 CP).`
        : 'Custom biological adaptation.';

      const baseName =
        linkedItem?.name || row.customName.trim() || defaultCustomTraitName;
      const fullName = choiceLabel ? `${baseName} (${choiceLabel})` : baseName;
      const slug = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (isSpeciesPackageBuilder && (row.sourceType === 'cortex_flaw' || details.effectiveCp < 0)) {
        const flawEntry = {
          id: linkedItem?.id || `disadvantage-custom-${slug}`,
          name: fullName,
          cp: details.effectiveCp,
          bp: details.effectiveCp,
          tier: 'Flaw',
          mechanic: modSummaryText || linkedItem?.mechanic || 'Species flaw / disadvantage.',
          description: linkedItem?.description || modSummaryText
        };
        disadvantages.push(flawEntry);
        summaryParts.push(
          `Flaw: ${fullName} (${details.effectiveCp} CP — ${flawEntry.mechanic})`
        );
      } else {
        const traitEntry = {
          id: linkedItem?.id || `trait-custom-${slug}`,
          name: fullName,
          cp: details.effectiveCp,
          bp: details.effectiveCp,
          tier: linkedItem?.tier || row.tier || 'Basic',
          trait_tier: linkedItem?.tier || row.tier || 'Basic',
          trait_type: linkedItem?.trait_type || defaultTraitType,
          classification: linkedItem?.classification || (isPillarTraitSelector ? 'General' : 'Physical'),
          choice: row.choiceValue || undefined,
          choiceLabel: choiceLabel || undefined,
          mechanic: modSummaryText || linkedItem?.mechanic || defaultTraitMechanic,
          description: linkedItem?.description || modSummaryText || defaultTraitMechanic,
          modifiers: rowModifiersList
        };
        traits.push(traitEntry);
        summaryParts.push(
          `${isPillarTraitSelector ? pillarMeta.singularLabel : 'Trait'}: ${fullName} (${details.effectiveCp} CP — ${traitEntry.mechanic})`
        );
      }
    });

    const promptSummary =
      summaryParts.length > 0
        ? isSpeciesPackageBuilder
          ? `${summaryParts.join('; ')}. Tracked Species Package Total: ${costTrackerSummary.totalPackageCp} CP.`
          : `Selected ${pillarMeta?.pluralLabel || 'Traits'}: ${summaryParts.join('; ')}.`
        : '';

    return {
      traits,
      disadvantages,
      attribute_modifiers,
      attributes,
      specific_skill_bonuses,
      bonus_skills,
      movement_modes,
      modifiers,
      ...(isSpeciesPackageBuilder ? { totalCP: costTrackerSummary.totalPackageCp } : {}),
      promptSummary
    };
  }, [
    adjustmentRows,
    cortexTraitByIdMap,
    dbData,
    costTrackerSummary.totalPackageCp,
    isSpeciesPackageBuilder,
    isPillarTraitSelector,
    pillarMeta
  ]);

  // Dynamic, strictly asset-aligned header calibration pill & submit button suffix
  const calibrationContextSummary = useMemo(() => {
    const pid = profile.id;
    if (isSpeciesPackageBuilder) {
      const signed =
        costTrackerSummary.totalPackageCp >= 0
          ? `+${costTrackerSummary.totalPackageCp}`
          : `${costTrackerSummary.totalPackageCp}`;
      const targetPart =
        costTrackerSummary.targetBudgetCp !== null
          ? ` / ${costTrackerSummary.targetBudgetCp} CP Target`
          : '';
      return {
        headerPill: `Species Package: ${signed} CP${targetPart}`,
        buttonSuffix: `(${costTrackerSummary.totalPackageCp} CP)`
      };
    }

    const activePillarCount = compiledAdjustmentsPayload.traits.length;
    const pinnedSkillsCount = selectedPillarSkills.length;
    const pinnedFeatsCount = selectedRecommendedFeatures.length;
    const extraSelectionTag = `${
      pinnedSkillsCount > 0 ? ` • ${pinnedSkillsCount} Skills` : ''
    }${pinnedFeatsCount > 0 ? ` • ${pinnedFeatsCount} Features` : ''}`;

    if (pid === 'factions') {
      return {
        headerPill: `Fixed 20 SP Faction Pool • TL ${targetTechLevel} • ML ${targetMetaLevel}${
          activePillarCount > 0 ? ` • ${activePillarCount} Faction Traits` : ''
        }${extraSelectionTag}`,
        buttonSuffix: `(20 SP Pool)`
      };
    }
    if (pid === 'origins') {
      return {
        headerPill: `Fixed 20 SP Society Pool • TL ${targetTechLevel}${
          activePillarCount > 0 ? ` • ${activePillarCount} Origin Traits` : ''
        }${extraSelectionTag}`,
        buttonSuffix: `(20 SP Pool)`
      };
    }
    if (pid === 'occupations') {
      return {
        headerPill: `Fixed 20 SP Career Pool • TL ${targetTechLevel}${
          activePillarCount > 0 ? ` • ${activePillarCount} Occupational Traits` : ''
        }${extraSelectionTag}`,
        buttonSuffix: `(20 SP Pool)`
      };
    }
    if (pid === 'archetypes') {
      return {
        headerPill: `80 CP Persona Chassis${
          activePillarCount > 0 ? ` • ${activePillarCount}/2 Signature Traits` : ''
        }`,
        buttonSuffix: `(80 CP Chassis)`
      };
    }
    if (matrix?.isProperty || categoryParams.craft_dc !== undefined) {
      const cr = Number(categoryParams.craft_dc ?? 20);
      return {
        headerPill: `CR ${cr} • TL ${targetTechLevel}${
          profile.showMetaLevel && targetMetaLevel > 0 ? ` • ML ${targetMetaLevel}` : ''
        }`,
        buttonSuffix: `(CR ${cr} • TL ${targetTechLevel})`
      };
    }
    if (['features', 'trait', 'traits', 'companions', 'special_abilities', 'disciplines', 'species_lineage', 'species_size', 'species_movement', 'species_type'].includes(pid)) {
      const cpVal = Number(categoryParams.cp ?? categoryParams.bp ?? 1);
      return {
        headerPill: `${cpVal} CP Valuation`,
        buttonSuffix: `(${cpVal} CP)`
      };
    }
    if (pid === 'disadvantages') {
      const rebate = Math.abs(Number(categoryParams.refundCP ?? 2));
      return {
        headerPill: `-${rebate} CP Rebate`,
        buttonSuffix: `(-${rebate} CP Rebate)`
      };
    }
    if (pid === 'invocation') {
      const cr = Number(categoryParams.manifestation_dc ?? 15);
      const fp = Number(categoryParams.focus_cost ?? 2);
      return {
        headerPill: `CR ${cr} • ${fp} FP • ML ${targetMetaLevel}`,
        buttonSuffix: `(CR ${cr} • ${fp} FP)`
      };
    }
    if (pid === 'modular-characters') {
      const tier = Number(categoryParams.threatTier ?? 3);
      return {
        headerPill: `Threat Tier ${tier} • ${categoryParams.bossType || 'Standard'}`,
        buttonSuffix: `(Tier ${tier})`
      };
    }
    if (pid === 'planetary-design' || pid === 'world') {
      const spClass = categoryParams.starport || 'C';
      return {
        headerPill: `Starport ${spClass} • TL ${targetTechLevel}`,
        buttonSuffix: `(Class ${spClass} • TL ${targetTechLevel})`
      };
    }
    if (profile.showTechLevel || profile.showMetaLevel) {
      const parts = [];
      if (profile.showTechLevel) parts.push(`TL ${targetTechLevel}`);
      if (profile.showMetaLevel) parts.push(`ML ${targetMetaLevel}`);
      return {
        headerPill: parts.join(' • '),
        buttonSuffix: ''
      };
    }
    return { headerPill: '', buttonSuffix: '' };
  }, [
    profile.id,
    profile.showTechLevel,
    profile.showMetaLevel,
    isSpeciesPackageBuilder,
    costTrackerSummary,
    compiledAdjustmentsPayload.traits.length,
    selectedPillarSkills.length,
    selectedRecommendedFeatures.length,
    targetTechLevel,
    targetMetaLevel,
    categoryParams,
    matrix?.isProperty
  ]);

  const handleSynthesize = async () => {
    setIsGenerating(true);
    setGenerationError('');
    AudioService.playTerminalBeep(1200, 0.04);

    try {
      const combinedDirectives = [
        composedArchetype?.prompt || '',
        compiledAdjustmentsPayload.promptSummary,
        customDirectives
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      const synthesizedData = await synthesizeMatrixWithBastion({
        matrix,
        datasetKey: resolvedDatasetKey,
        profile,
        archetype: composedArchetype,
        selectedModules,
        selectedCortexTraits: compiledAdjustmentsPayload.traits,
        selectedCortexDisadvantages: compiledAdjustmentsPayload.disadvantages,
        selectedPillarSkills,
        selectedRecommendedFeatures,
        customAdjustmentsPayload: compiledAdjustmentsPayload,
        categoryParams,
        customDirectives: combinedDirectives,
        targetName: targetName.trim(),
        targetTechLevel,
        targetMetaLevel
      });

      AudioService.playTerminalBeep(1400, 0.06);
      if (onApplyGeneratedData) {
        onApplyGeneratedData(synthesizedData);
      }
      onClose();
    } catch (err) {
      setGenerationError(`BASTION Synthesis error: ${err.message}`);
      AudioService.playErrorSound();
    } finally {
      setIsGenerating(false);
    }
  };

  const Icon = matrix?.icon || Database;
  const isIngestMode = activeMode === 'ingest';
  const activePlaceholder = composedArchetype?.suggestedName
    ? `E.g., ${composedArchetype.suggestedName} (or leave blank for BASTION)...`
    : profile.nameField?.placeholder || 'E.g., Custom Designation...';

  const visibleAxes = useMemo(() => {
    if (!hasModularAxes) return [];
    if (activeAxisTab === 'all') return profile.conceptAxes;
    return profile.conceptAxes.filter((axis) => axis.id === activeAxisTab);
  }, [hasModularAxes, profile.conceptAxes, activeAxisTab]);

  const visibleDirectives = useMemo(() => {
    if (Array.isArray(profile.directiveCategories) && profile.directiveCategories.length > 0) {
      if (activeDirectiveCategory === 'all') {
        return profile.directiveCategories.flatMap((cat) => cat.directives || []);
      }
      const matchCat = profile.directiveCategories.find(
        (cat) => cat.id === activeDirectiveCategory
      );
      return matchCat ? matchCat.directives : profile.quickDirectives || [];
    }
    return profile.quickDirectives || [];
  }, [profile.directiveCategories, profile.quickDirectives, activeDirectiveCategory]);

  const displayedCortexTraits = showAllTraitsInTab
    ? filteredCortexTraits
    : filteredCortexTraits.slice(0, 15);

  const selectedTraitIdsSet = useMemo(
    () => new Set(adjustmentRows.map((r) => r.traitId).filter(Boolean)),
    [adjustmentRows]
  );

  // Concept keyword tokens for ranking 20-SP Skills & Recommended Features
  const pillarConceptKeywords = useMemo(() => {
    if (!is20SpPillarMatrix) return [];
    const blob = [
      composedArchetype?.name || '',
      composedArchetype?.prompt || '',
      targetName || '',
      customDirectives || '',
      Object.values(categoryParams || {}).join(' '),
      selectedModules.map((m) => `${m.label} ${m.prompt}`).join(' ')
    ]
      .join(' ')
      .toLowerCase();
    return Array.from(
      new Set(
        blob
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length >= 4)
      )
    );
  }, [
    is20SpPillarMatrix,
    composedArchetype,
    targetName,
    customDirectives,
    categoryParams,
    selectedModules
  ]);

  // Authoritative Skill Catalog for Fixed 20-SP Pool (Origins, Occupations, Factions)
  const pillarSkillsCatalog = useMemo(() => {
    if (!is20SpPillarMatrix) return [];
    const normalized = buildNormalizedSkillsCatalog(dbData?.skills, { includeSkillGroups: true });
    const list = normalized.map((item) => {
      const name = String(item.name || '').trim();
      const group = String(item.group || 'mental').toLowerCase();
      const subcategory = String(item.subcategory || 'General').trim();
      const governingAttr = String(item.governing_attribute || '').trim();
      const desc = String(item.description || item.mechanic || '').trim();
      const hay = `${name} ${group} ${subcategory} ${governingAttr} ${item.keywords || ''} ${desc}`.toLowerCase();
      let score = 0;
      for (const kw of pillarConceptKeywords) {
        if (hay.includes(kw)) score += 3;
      }
      return {
        id: item.id || name.toLowerCase(),
        name,
        group,
        subcategory,
        categoryLabel: item.categoryLabel || `${group} · ${subcategory}`,
        governingAttr,
        attrCodes: Array.isArray(item.attrCodes) ? item.attrCodes : [],
        primaryAttrBadge: item.primaryAttrBadge || '',
        isSkillGroup: Boolean(item.isSkillGroup),
        description: desc,
        hay,
        score
      };
    });
    list.sort((a, b) => {
      if (a.isSkillGroup !== b.isSkillGroup && skillGroupFilter !== 'groups') {
        return a.isSkillGroup ? 1 : -1;
      }
      return b.score - a.score || a.name.localeCompare(b.name);
    });
    return list;
  }, [is20SpPillarMatrix, dbData?.skills, pillarConceptKeywords, skillGroupFilter]);

  // Live counts per Skill Group, Subcategory, and Governing Attribute
  const skillFilterStats = useMemo(() => {
    const byGroup = { physical: 0, mental: 0, social: 0, combat: 0, meta: 0, groups: 0 };
    const bySubcategory = {};
    const byAttr = { STR: 0, AGI: 0, STA: 0, INT: 0, WIS: 0, CHA: 0 };
    let suggestedCount = 0;

    for (const sk of pillarSkillsCatalog) {
      if (byGroup[sk.group] !== undefined) byGroup[sk.group] += 1;
      const subKey = `${sk.group}:${sk.subcategory.toLowerCase()}`;
      bySubcategory[subKey] = (bySubcategory[subKey] || 0) + 1;
      const inAttrScope =
        !sk.isSkillGroup &&
        (skillGroupFilter === 'all' ||
          (skillGroupFilter === 'suggested' && (sk.score > 0 || pillarConceptKeywords.length === 0)) ||
          (sk.group === skillGroupFilter &&
            (skillSubcategoryFilter === 'all' ||
              sk.subcategory.toLowerCase() === skillSubcategoryFilter.toLowerCase())));
      if (inAttrScope) {
        for (const code of sk.attrCodes) {
          if (byAttr[code] !== undefined) byAttr[code] += 1;
        }
      }
      if (!sk.isSkillGroup && (sk.score > 0 || pillarConceptKeywords.length === 0)) {
        suggestedCount += 1;
      }
    }

    return { byGroup, bySubcategory, byAttr, suggestedCount };
  }, [pillarSkillsCatalog, pillarConceptKeywords.length, skillGroupFilter, skillSubcategoryFilter]);

  // Authoritative Feature Catalog for Recommended Features (-1 CP Discount)
  const pillarFeaturesCatalog = useMemo(() => {
    if (!is20SpPillarMatrix) return [];
    const normalized = buildNormalizedFeaturesCatalog(dbData?.features, { includeFeatureGroups: true });
    const list = normalized.map((raw) => {
      const name = String(raw.name || raw.title || raw.id || '').trim();
      const category = String(raw.category || 'General').trim();
      const cp = Number(raw.cp ?? raw.costs?.cp ?? 3) || 3;
      const prereq =
        raw.prerequisites && String(raw.prerequisites).toLowerCase() !== 'none'
          ? String(raw.prerequisites)
          : '';
      const desc = String(raw.mechanic || raw.description || '').trim();
      const hay = `${name} ${category} ${prereq} ${desc}`.toLowerCase();
      let score = 0;
      for (const kw of pillarConceptKeywords) {
        if (hay.includes(kw)) score += 3;
      }
      return {
        id: raw.id || name.toLowerCase(),
        name,
        category,
        isCategoryGroup: Boolean(raw.isCategoryGroup),
        cp,
        discountedCp: Math.max(1, cp - 1),
        prereq,
        description: desc,
        hay,
        score
      };
    });
    list.sort((a, b) => {
      if (a.isCategoryGroup !== b.isCategoryGroup && featureCategoryFilter !== 'Feature Groups') {
        return a.isCategoryGroup ? 1 : -1;
      }
      return b.score - a.score || a.name.localeCompare(b.name);
    });
    return list;
  }, [is20SpPillarMatrix, dbData?.features, pillarConceptKeywords, featureCategoryFilter]);

  const featureFilterCounts = useMemo(() => {
    const counts = { 'Feature Groups': 0 };
    FEATURE_CATEGORIES.forEach((c) => {
      counts[c] = 0;
    });
    let suggestedCount = 0;
    for (const ft of pillarFeaturesCatalog) {
      if (counts[ft.category] !== undefined) counts[ft.category] += 1;
      if (!ft.isCategoryGroup && (ft.score > 0 || pillarConceptKeywords.length === 0)) {
        suggestedCount += 1;
      }
    }
    return { counts, suggestedCount };
  }, [pillarFeaturesCatalog, pillarConceptKeywords.length]);

  const filteredPillarSkills = useMemo(() => {
    const q = skillCatalogSearch.trim().toLowerCase();
    return pillarSkillsCatalog.filter((sk) => {
      if (q && !sk.hay.includes(q)) return false;
      if (skillAttrFilter !== 'all' && !sk.attrCodes.includes(skillAttrFilter)) return false;
      if (skillGroupFilter === 'all') return true;
      if (skillGroupFilter === 'suggested') {
        if (sk.isSkillGroup) return false;
        return sk.score > 0 || pillarConceptKeywords.length === 0;
      }
      if (sk.group !== skillGroupFilter) return false;
      if (skillSubcategoryFilter !== 'all') {
        return sk.subcategory.toLowerCase() === skillSubcategoryFilter.toLowerCase();
      }
      return true;
    });
  }, [
    pillarSkillsCatalog,
    skillCatalogSearch,
    skillGroupFilter,
    skillSubcategoryFilter,
    skillAttrFilter,
    pillarConceptKeywords.length
  ]);

  const filteredPillarFeatures = useMemo(() => {
    const q = featureCatalogSearch.trim().toLowerCase();
    return pillarFeaturesCatalog.filter((ft) => {
      if (q && !ft.hay.includes(q)) return false;
      if (featureCategoryFilter === 'all') return true;
      if (featureCategoryFilter === 'suggested') {
        if (ft.isCategoryGroup) return false;
        return ft.score > 0 || pillarConceptKeywords.length === 0;
      }
      return ft.category.toLowerCase() === featureCategoryFilter.toLowerCase();
    });
  }, [pillarFeaturesCatalog, featureCatalogSearch, featureCategoryFilter, pillarConceptKeywords.length]);

  const togglePillarSkill = (skillName) => {
    setSelectedPillarSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const toggleRecommendedFeature = (featName) => {
    setSelectedRecommendedFeatures((prev) =>
      prev.includes(featName) ? prev.filter((f) => f !== featName) : [...prev, featName]
    );
  };

  const handleAutoLoadConceptSkills = () => {
    const top = pillarSkillsCatalog
      .filter((s) => !s.isSkillGroup)
      .slice(0, 8)
      .map((s) => s.name);
    setSelectedPillarSkills((prev) => Array.from(new Set([...prev, ...top])));
  };

  const handleAutoLoadConceptFeatures = () => {
    const top = pillarFeaturesCatalog
      .filter((f) => !f.isCategoryGroup)
      .slice(0, 4)
      .map((f) => f.name);
    setSelectedRecommendedFeatures((prev) => Array.from(new Set([...prev, ...top])));
  };

  const skillPoolTitleByPillar =
    profile.id === 'origins'
      ? 'Society Skills Pool (Fixed 20 SP)'
      : profile.id === 'occupations'
        ? 'Professional Skills Pool (Fixed 20 SP)'
        : 'Faction Skill Package (Fixed 20 SP)';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-6 sm:pt-10 pb-10 overflow-y-auto select-none font-sans">
      <div
        className={`w-full ${
          isIngestMode ? 'max-w-7xl' : 'max-w-5xl'
        } bg-[#0b1019] border-2 border-cyan-400/80 rounded-2xl ${
          isIngestMode ? 'p-0' : 'p-5 sm:p-6'
        } shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col gap-4 text-slate-100 max-h-[88vh] sm:max-h-[90vh] overflow-hidden animate-fade-in transition-all`}
      >
        {/* Header & Integrated BASTION Mode Switcher */}
        <div
          className={`flex flex-col gap-3 border-b border-slate-800 shrink-0 ${
            isIngestMode ? 'px-5 pt-4 pb-3 bg-slate-950/90' : 'pb-3'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                style={{
                  background: `${matrix?.color || '#06b6d4'}20`,
                  border: `1px solid ${matrix?.color || '#06b6d4'}60`,
                  color: matrix?.color || '#06b6d4'
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                    <Bot size={12} />{' '}
                    {isIngestMode ? 'BASTION INGESTION STUDIO' : 'BASTION TACTICAL COGNITION'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">
                    {isIngestMode
                      ? dataset?.code || matrix?.name || 'OMNICORTEX'
                      : `${matrix?.name || 'OMNICORTEX'} MATRIX`}
                  </span>
                </div>
                <h2 className="font-bold text-base font-mono text-white">
                  {isIngestMode
                    ? `Ingest & Parse ${dataset?.label || matrix?.label || 'Omnicortex Entry'}`
                    : `Engineer ${matrix?.label || 'Blueprint'} with BASTION`}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close BASTION Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Integrated Mode Switcher (Synthesizer vs Ingestion) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveMode('synthesize');
              }}
              className={`px-3 py-2 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer font-mono ${
                activeMode === 'synthesize'
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Bot size={15} className="text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                  BASTION Synthesizer
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  {profile.synthesizerSubtitle}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveMode('ingest');
              }}
              className={`px-3 py-2 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer font-mono ${
                activeMode === 'ingest'
                  ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Cpu size={15} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Ingestion
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Parse {dataset?.label || matrix?.label || 'documents'} or raw text into schema
                </div>
              </div>
            </button>
          </div>
        </div>

        {isIngestMode ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodexIngestionEngine
              initialDatasetKey={resolvedDatasetKey}
              isModal={true}
              focusedMode={true}
              onApplyEntry={(ingestedItem) => {
                if (onApplyIngestedEntry) {
                  onApplyIngestedEntry(ingestedItem);
                } else if (onApplyGeneratedData) {
                  onApplyGeneratedData(ingestedItem);
                }
                if (onClose) onClose();
              }}
              onClose={onClose}
            />
          </div>
        ) : (
          <>
            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1">
              {/* Error Alert */}
              {generationError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════════
                  1. MODULAR CONCEPT STYLE COMPOSER + PER-AXIS CUSTOM USER ENTRY FIELDS
                 ═══════════════════════════════════════════════════════════════════════ */}
              <div className="space-y-3 bg-slate-950/40 border border-slate-800/90 rounded-xl p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {profile.conceptSectionLabel}
                    </label>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                      <Layers size={10} />
                      {hasModularAxes
                        ? '3-Axis Modular Composer + Custom Axis Entries'
                        : 'Multi-Concept Blend + Custom Entry'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleRandomizeModularConcept}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-400/50 text-indigo-200 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                      title="Randomize modular concept combination across axes"
                    >
                      <Shuffle size={11} className="text-indigo-300" />
                      <span>Randomize Mix</span>
                    </button>

                    {(selectedModules.length > 0 || selectedConceptsList.length > 0) && (
                      <button
                        type="button"
                        onClick={handleClearConceptSelection}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono uppercase flex items-center gap-1 transition-all cursor-pointer"
                        title="Clear selected concept modules and custom entries"
                      >
                        <RotateCcw size={10} />
                        <span>Clear ({selectedModules.length || selectedConceptsList.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Archetype Starter Combos (1-Click Preset Templates) */}
                {hasModularAxes && Array.isArray(profile.concepts) && profile.concepts.length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-300/90 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-400" />
                        Quick Archetype Starters (1-Click Modular Combos — Click to Load, Then Customize Below)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.concepts.map((concept) => {
                        const isStarterActive = selectedConcept?.id === concept.id;
                        return (
                          <button
                            key={concept.id}
                            type="button"
                            onClick={() => handleSelectConcept(concept)}
                            title={concept.prompt}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                              isStarterActive
                                ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                            }`}
                          >
                            <span>{concept.label}</span>
                            {concept.badge && (
                              <span className="text-[8px] px-1.5 py-0.2 rounded bg-slate-900/90 text-cyan-300/90 uppercase">
                                {concept.badge.split('•')[0].trim()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Modular Concept Axes Tabs, Multi-Select Grid & Per-Axis Custom User Entry Fields */}
                {hasModularAxes ? (
                  <div className="space-y-3">
                    {/* Axis Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 pb-2">
                      <button
                        type="button"
                        onClick={() => setActiveAxisTab('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                          activeAxisTab === 'all'
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All {profile.conceptAxes.length} Axes ({selectedModules.length} Active)
                      </button>

                      {profile.conceptAxes.map((axis) => {
                        const presetCount = (axis.modules || []).filter((m) =>
                          selectedModuleIds.includes(m.id)
                        ).length;
                        const customCount =
                          (axisCustomEntries[axis.id]?.length || 0) +
                          ((axisCustomInputs[axis.id] || '').trim() ? 1 : 0);
                        const axisSelectedCount = presetCount + customCount;
                        const isTabActive = activeAxisTab === axis.id;
                        return (
                          <button
                            key={axis.id}
                            type="button"
                            onClick={() => setActiveAxisTab(axis.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border flex items-center gap-1.5 ${
                              isTabActive
                                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{axis.shortLabel || axis.label}</span>
                            {axisSelectedCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[9px]">
                                {axisSelectedCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Render Modular Axes + Custom User Entry Field per Axis */}
                    <div className="space-y-3.5">
                      {visibleAxes.map((axis) => {
                        const pinnedForAxis = axisCustomEntries[axis.id] || [];
                        const customInputVal = axisCustomInputs[axis.id] || '';
                        const customPlaceholder =
                          axis.customPlaceholder ||
                          AXIS_CUSTOM_PLACEHOLDERS[axis.id] ||
                          `Enter custom ${axis.shortLabel || axis.label} concept style...`;

                        return (
                          <div
                            key={axis.id}
                            className="space-y-2 bg-slate-900/35 border border-slate-800/80 rounded-xl p-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                                {axis.label}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                                {axis.description}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {(axis.modules || []).map((mod) => {
                                const isSelected = selectedModuleIds.includes(mod.id);
                                const traitCount = Array.isArray(mod.suggestedTraits)
                                  ? mod.suggestedTraits.length
                                  : 0;
                                return (
                                  <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => handleToggleModule(mod)}
                                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                                      isSelected
                                        ? 'bg-cyan-950/55 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.22)] ring-1 ring-cyan-400/40'
                                        : 'bg-slate-900/65 border-slate-800/90 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div className="text-xs font-mono font-bold text-slate-100 leading-snug">
                                        {mod.label}
                                      </div>
                                      <div
                                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                          isSelected
                                            ? 'bg-cyan-500 border-cyan-300 text-slate-950'
                                            : 'bg-slate-950 border-slate-700 text-slate-500'
                                        }`}
                                      >
                                        {isSelected ? <Check size={11} strokeWidth={3} /> : <Plus size={10} />}
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-1">
                                      {mod.badge && (
                                        <span
                                          className="text-[9px] font-mono font-semibold uppercase tracking-wider truncate"
                                          style={{
                                            color: isSelected ? '#67e8f9' : matrix?.color || '#38bdf8'
                                          }}
                                        >
                                          {mod.badge}
                                        </span>
                                      )}
                                      {traitCount > 0 && (
                                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300 shrink-0">
                                          {traitCount}{' '}
                                          {isPillarTraitSelector
                                            ? pillarMeta.pluralLabel
                                            : isSpeciesPackageBuilder
                                              ? 'Species Traits'
                                              : 'Matching Traits'}
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                                      {mod.prompt}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Per-Axis Custom User Concept Style Entry Field */}
                            <div className="pt-1.5 border-t border-slate-800/70 space-y-1.5">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-emerald-300/90 uppercase tracking-wider shrink-0">
                                  Custom {axis.shortLabel || axis.label}:
                                </span>
                                <div className="flex-1 flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={customInputVal}
                                    onChange={(e) =>
                                      setAxisCustomInputs((prev) => ({
                                        ...prev,
                                        [axis.id]: e.target.value
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddAxisCustomEntry(axis.id);
                                      }
                                    }}
                                    placeholder={customPlaceholder}
                                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700/90 focus:border-emerald-400 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddAxisCustomEntry(axis.id)}
                                    disabled={!customInputVal.trim()}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 disabled:opacity-40 border border-emerald-400/50 text-emerald-200 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                                    title={`Pin custom ${axis.shortLabel || axis.label} concept tag`}
                                  >
                                    <Plus size={11} />
                                    <span>Pin Custom</span>
                                  </button>
                                </div>
                              </div>

                              {/* Pinned Custom Entries for this Axis */}
                              {pinnedForAxis.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {pinnedForAxis.map((entryText) => (
                                    <span
                                      key={entryText}
                                      onClick={() => handleRemoveAxisCustomEntry(axis.id, entryText)}
                                      className="px-2 py-0.5 rounded-lg bg-emerald-950/70 border border-emerald-400/60 text-emerald-100 text-[10px] font-mono flex items-center gap-1.5 cursor-pointer hover:border-red-400 hover:text-red-200"
                                      title="Click to remove custom axis concept"
                                    >
                                      <span className="text-[9px] uppercase text-emerald-300 font-bold">
                                        Custom {axis.shortLabel || axis.id}:
                                      </span>
                                      <span className="font-bold">{entryText}</span>
                                      <X size={10} />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Standard Multi-Select Concept Cards + Custom Concept Entry (for non-axis matrices) */
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(profile.concepts || []).map((concept) => {
                        const isSelected =
                          selectedConceptIds.includes(concept.id) ||
                          selectedConcept?.id === concept.id;
                        return (
                          <button
                            key={concept.id}
                            type="button"
                            onClick={() => handleSelectConcept(concept)}
                            className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="text-xs font-mono font-bold text-slate-200 leading-snug">
                                {concept.label}
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                  isSelected
                                    ? 'bg-cyan-500 border-cyan-300 text-slate-950'
                                    : 'bg-slate-950 border-slate-700 text-slate-500'
                                }`}
                              >
                                {isSelected ? <Check size={11} strokeWidth={3} /> : <Plus size={10} />}
                              </div>
                            </div>
                            {concept.badge && (
                              <div
                                className="text-[9px] font-mono font-semibold uppercase tracking-wider truncate"
                                style={{ color: isSelected ? '#67e8f9' : matrix?.color || '#38bdf8' }}
                              >
                                {concept.badge}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                              {concept.prompt}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom User Concept Style Entry for Non-Axis Matrices */}
                    <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider shrink-0">
                          Custom Concept Style:
                        </span>
                        <div className="flex-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={generalCustomConceptInput}
                            onChange={(e) => setGeneralCustomConceptInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddGeneralCustomConcept();
                              }
                            }}
                            placeholder="Enter custom concept style or hybrid theme..."
                            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700/90 focus:border-emerald-400 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddGeneralCustomConcept}
                            disabled={!generalCustomConceptInput.trim()}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 disabled:opacity-40 border border-emerald-400/50 text-emerald-200 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus size={11} />
                            <span>Pin Custom</span>
                          </button>
                        </div>
                      </div>
                      {generalCustomConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {generalCustomConcepts.map((cText) => (
                            <span
                              key={cText}
                              onClick={() => handleRemoveGeneralCustomConcept(cText)}
                              className="px-2 py-0.5 rounded-lg bg-emerald-950/70 border border-emerald-400/60 text-emerald-100 text-[10px] font-mono flex items-center gap-1.5 cursor-pointer hover:border-red-400"
                            >
                              <span className="font-bold">{cText}</span>
                              <X size={10} />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Composed Modular Concept Blueprint Bar */}
                {composedArchetype && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                          Active Modular Concept Blueprint:
                        </span>
                        <span className="text-[10px] font-mono text-white font-semibold">
                          {composedArchetype.name}
                        </span>
                      </div>
                      {cortexTraitsCatalog.length > 0 && conceptSuggestedTraits.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAutoLoadConceptTraits}
                          className="px-2 py-0.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 border border-purple-400/50 text-purple-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title={
                            isPillarTraitSelector
                              ? pillarMeta.autoLoadTitle
                              : 'Automatically equip top Cortex Species Traits matching this modular concept'
                          }
                        >
                          {isPillarTraitSelector ? (
                            <Icon size={11} className="text-purple-300" />
                          ) : (
                            <Dna size={11} className="text-purple-300" />
                          )}
                          <span>
                            {isPillarTraitSelector
                              ? pillarMeta.autoLoadLabel
                              : '+ Auto-Load Matching Species Traits'}
                          </span>
                        </button>
                      )}
                    </div>

                    {selectedModules.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedModules.map((mod) => (
                          <span
                            key={mod.id}
                            onClick={() => handleToggleModule(mod)}
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono flex items-center gap-1 cursor-pointer hover:border-red-400/60 hover:text-red-200 ${
                              mod.isCustomAxisEntry
                                ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-200'
                                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
                            }`}
                            title="Click to remove module"
                          >
                            <span className="text-slate-400">{mod.axisLabel}:</span>
                            <span className="font-bold">{mod.label}</span>
                            <X size={10} className="text-slate-400" />
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] font-mono text-slate-300/90 leading-relaxed">
                      {composedArchetype.prompt}
                    </div>
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════════════════
                  2. SUBJECT-RELATIVE PARAMETERS & CALIBRATION
                 ═══════════════════════════════════════════════════════════════════════ */}
              <div className="space-y-3 bg-slate-950/50 border border-slate-800/90 rounded-xl p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    {profile.parametersSectionLabel}
                  </label>
                  {composedArchetype?.suggestedName &&
                    targetName !== composedArchetype.suggestedName && (
                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1050, 0.02);
                          setTargetName(composedArchetype.suggestedName);
                        }}
                        className="text-[10px] font-mono text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Fill example designation for this concept"
                      >
                        <Sparkles size={10} />
                        <span>Use &ldquo;{composedArchetype.suggestedName}&rdquo;</span>
                      </button>
                    )}
                </div>

                {/* Primary Designation + Dynamic Category Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={(profile.parameters?.length || 0) % 2 === 0 ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {profile.nameField?.label || 'Designation / Name'}
                    </label>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      placeholder={activePlaceholder}
                      className="w-full p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  {(profile.parameters || []).map((param) => {
                    const currentVal = categoryParams[param.key] ?? param.defaultValue ?? '';
                    return (
                      <div key={param.key}>
                        <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1 truncate">
                          {param.label}
                        </label>
                        {param.type === 'select' ? (
                          <select
                            value={currentVal}
                            onChange={(e) => handleParamChange(param.key, e.target.value)}
                            className="w-full p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
                          >
                            {(param.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            min={param.min ?? 0}
                            max={param.max ?? 100}
                            value={currentVal}
                            onChange={(e) => {
                              const num = e.target.value === '' ? '' : Number(e.target.value);
                              handleParamChange(param.key, num);
                            }}
                            className="w-full p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tech Level & Meta Level Calibration Sliders */}
                {(profile.showTechLevel || profile.showMetaLevel) && (
                  <div
                    className={`grid grid-cols-1 ${
                      profile.showTechLevel && profile.showMetaLevel ? 'sm:grid-cols-2' : ''
                    } gap-3 pt-2 border-t border-slate-800/80`}
                  >
                    {profile.showTechLevel && (
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Tech Level (TL: {targetTechLevel})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          value={targetTechLevel}
                          onChange={(e) => setTargetTechLevel(parseInt(e.target.value, 10))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>TL 0 (Archaic)</span>
                          <span>TL 3 (Interstellar)</span>
                          <span>TL 5 (Singularity)</span>
                        </div>
                      </div>
                    )}

                    {profile.showMetaLevel && (
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Meta Level (ML: {targetMetaLevel})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          value={targetMetaLevel}
                          onChange={(e) => setTargetMetaLevel(parseInt(e.target.value, 10))}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>ML 0 (None)</span>
                          <span>ML 2 (Awakened)</span>
                          <span>ML 5 (Cosmic)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════════════════
                  3. ASSET-EXPLICIT DIRECTIVES, TRAIT SELECTORS & CALIBRATION TRACKING
                 ═══════════════════════════════════════════════════════════════════════ */}
              <div className="space-y-3.5 bg-slate-950/40 border border-slate-800/90 rounded-xl p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    {profile.directivesLabel}
                  </label>

                  {/* Context-Aligned Calibration Summary Pill (No cross-asset CP leaks) */}
                  {calibrationContextSummary.headerPill && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 flex items-center gap-1">
                        <Calculator size={11} className="text-emerald-300" />
                        <span>{calibrationContextSummary.headerPill}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* 3A-PILLAR. DEDICATED PILLAR TRAIT SELECTOR (FACTIONS, ORIGINS, OCCUPATIONS, ARCHETYPES ONLY) */}
                {isPillarTraitSelector && cortexTraitsCatalog.length > 0 && (
                  <div className="space-y-3 bg-slate-900/70 border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className="text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                            {pillarMeta.panelTitle}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {pillarMeta.panelSubtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-cyan-500/40 text-cyan-200 font-bold">
                          Selected {pillarMeta.pluralLabel}: {compiledAdjustmentsPayload.traits.length}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-slate-400">
                          {pillarMeta.selectionRuleHint}
                        </span>
                      </div>
                    </div>

                    {/* Selected Pillar Trait Chips */}
                    {compiledAdjustmentsPayload.traits.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {adjustmentRows.map((row) => {
                          const details = computeRowCostDetails(row);
                          if (details.isBlank) return null;
                          const item = details.linkedItem;
                          const displayName = item?.name || row.customName.trim();
                          if (!displayName) return null;
                          return (
                            <span
                              key={row.rowId}
                              onClick={() => handleRemoveAdjustmentRow(row.rowId)}
                              title={`${displayName}: ${item?.mechanic || row.modNotes || 'Click to remove'}`}
                              className="px-2.5 py-1 rounded-lg bg-cyan-950/75 hover:bg-red-950/70 border border-cyan-400/50 hover:border-red-400 text-cyan-100 hover:text-red-200 text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <span className="font-bold">{displayName}</span>
                              <span className="text-[9px] text-cyan-300/80">(1 CP)</span>
                              <X size={10} />
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-slate-500 italic">
                        No {pillarMeta.pluralLabel.toLowerCase()} pinned yet — click traits in the {pillarMeta.catalogTitle} below or let BASTION curate them automatically.
                      </div>
                    )}

                    {/* Custom Pillar Trait Input */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-1 border-t border-slate-800/70">
                      <input
                        type="text"
                        value={customPillarTraitInput}
                        onChange={(e) => setCustomPillarTraitInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomPillarTrait();
                          }
                        }}
                        placeholder={pillarMeta.customPlaceholder}
                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 rounded-lg text-[11px] font-mono text-white placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomPillarTrait}
                        disabled={!customPillarTraitInput.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 disabled:opacity-40 border border-amber-400/50 text-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                      >
                        <Plus size={11} />
                        <span>Add Custom {pillarMeta.singularLabel}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3A-SPECIES. SPECIES 20-CP PACKAGE BUILDER (SPECIES MATRIX ONLY) */}
                {isSpeciesPackageBuilder && cortexTraitsCatalog.length > 0 && (
                  <div className="space-y-3 bg-slate-900/70 border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
                    {/* Header & Live Cost Breakdown Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                            Species Trait &amp; Modifier Adjustments + Live 20-CP Cost Tracker
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Select Cortex Species Traits via pulldown, configure adjoining attribute/skill/stat modifiers, and track live CP costs
                          </div>
                        </div>
                      </div>

                      {/* Itemized Cost Breakdown Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        {costTrackerSummary.chassisCp !== 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-slate-300">
                            Chassis/Size:{' '}
                            <strong className="text-cyan-300">
                              {costTrackerSummary.chassisCp > 0
                                ? `+${costTrackerSummary.chassisCp}`
                                : costTrackerSummary.chassisCp}{' '}
                              CP
                            </strong>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-purple-500/40 text-purple-200">
                          Traits: <strong>+{costTrackerSummary.traitsCp} CP</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-cyan-500/40 text-cyan-200">
                          Adjoining Mods:{' '}
                          <strong>
                            {costTrackerSummary.modifiersCp >= 0
                              ? `+${costTrackerSummary.modifiersCp}`
                              : costTrackerSummary.modifiersCp}{' '}
                            CP
                          </strong>
                        </span>
                        {costTrackerSummary.flawsCp !== 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-rose-500/40 text-rose-200">
                            Flaws: <strong>{costTrackerSummary.flawsCp} CP</strong>
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-bold border ${
                            costTrackerSummary.targetBudgetCp !== null &&
                            costTrackerSummary.totalPackageCp > costTrackerSummary.targetBudgetCp
                              ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                              : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                          }`}
                        >
                          Net Total: {costTrackerSummary.totalPackageCp} CP
                          {costTrackerSummary.targetBudgetCp !== null
                            ? ` (${
                                costTrackerSummary.targetBudgetCp - costTrackerSummary.totalPackageCp >= 0
                                  ? `${costTrackerSummary.targetBudgetCp - costTrackerSummary.totalPackageCp} CP rem.`
                                  : `${Math.abs(costTrackerSummary.targetBudgetCp - costTrackerSummary.totalPackageCp)} CP over`
                              })`
                            : ''}
                        </span>
                      </div>
                    </div>

                    {/* Adjustment Rows */}
                    <div className="space-y-2">
                      {adjustmentRows.map((row, idx) => {
                        const costDetails = computeRowCostDetails(row);
                        const linkedItem = costDetails.linkedItem;
                        const choiceCfg = linkedItem
                          ? linkedItem.choiceConfig || getTraitChoiceConfig(linkedItem)
                          : null;
                        const choiceOptions = choiceCfg
                          ? getOptionsForChoiceType(choiceCfg.type, { dbData })
                          : [];
                        const targetOptions = getDefaultTargetsForModType(
                          row.modType,
                          canonicalSkillNames
                        );

                        const selectValue =
                          row.sourceType === 'custom_trait'
                            ? '__custom_trait__'
                            : row.sourceType === 'standalone_mod'
                              ? '__standalone_mod__'
                              : row.traitId || '';

                        return (
                          <div
                            key={row.rowId}
                            className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
                              {/* 1. Species Trait / Adjustment Source Pulldown */}
                              <div className="lg:col-span-4">
                                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  #{idx + 1} Species Trait / Source Pulldown
                                </label>
                                <select
                                  value={selectValue}
                                  onChange={(e) =>
                                    handleSelectRowTraitOrSource(row.rowId, e.target.value)
                                  }
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                                >
                                  <option value="">
                                    -- Select Cortex Species Trait or Custom Mod --
                                  </option>
                                  <optgroup label="Custom & Standalone Adjustments">
                                    <option value="__custom_trait__">
                                      ★ Custom User Species Trait (Custom Name &amp; CP)
                                    </option>
                                    <option value="__standalone_mod__">
                                      ⚡ Standalone Attribute / Skill / Stat Modifier Only
                                    </option>
                                  </optgroup>

                                  {conceptSuggestedTraits.length > 0 && (
                                    <optgroup label="★ Concept-Matched Cortex Traits">
                                      {conceptSuggestedTraits.map((t) => (
                                        <option key={`sug_${t.id}`} value={t.id}>
                                          {t.name} ({t.cp} CP — {t.tier})
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}

                                  <optgroup label="Basic Cortex Traits (1 CP)">
                                    {cortexTraitsCatalog
                                      .filter((t) => t.tierKey === 'basic' || t.cp === 1)
                                      .map((t) => (
                                        <option key={`bas_${t.id}`} value={t.id}>
                                          {t.name} (1 CP)
                                        </option>
                                      ))}
                                  </optgroup>

                                  {cortexTraitsCatalog.some(
                                    (t) => t.tierKey === 'advanced' || t.cp === 2
                                  ) && (
                                    <optgroup label="Advanced Cortex Traits (2 CP)">
                                      {cortexTraitsCatalog
                                        .filter((t) => t.tierKey === 'advanced' || t.cp === 2)
                                        .map((t) => (
                                          <option key={`adv_${t.id}`} value={t.id}>
                                            {t.name} (2 CP)
                                          </option>
                                        ))}
                                    </optgroup>
                                  )}

                                  {cortexTraitsCatalog.some(
                                    (t) => t.tierKey === 'elite' || t.cp >= 4
                                  ) && (
                                    <optgroup label="Elite Cortex Traits (4 CP)">
                                      {cortexTraitsCatalog
                                        .filter((t) => t.tierKey === 'elite' || t.cp >= 4)
                                        .map((t) => (
                                          <option key={`eli_${t.id}`} value={t.id}>
                                            {t.name} ({t.cp} CP)
                                          </option>
                                        ))}
                                    </optgroup>
                                  )}

                                  {cortexDisadvantagesCatalog.length > 0 && (
                                    <optgroup label="Species Disadvantages / Flaws (-CP Rebate)">
                                      {cortexDisadvantagesCatalog.map((d) => (
                                        <option key={`flaw_${d.id}`} value={d.id}>
                                          {d.name} ({d.cp} CP Flaw)
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              </div>

                              {/* 2. Adjoining Modifier Type Pulldown */}
                              <div className="lg:col-span-3">
                                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Adjoining Modifier Type
                                </label>
                                <select
                                  value={row.modType}
                                  onChange={(e) =>
                                    handleUpdateAdjustmentRow(row.rowId, {
                                      modType: e.target.value
                                    })
                                  }
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                                >
                                  {MODIFIER_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 3. Adjoining Modifier Target Pulldown / Input */}
                              <div className="lg:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Target Attribute / Skill / Stat
                                </label>
                                {targetOptions.length > 0 ? (
                                  <select
                                    value={row.modTarget}
                                    onChange={(e) =>
                                      handleUpdateAdjustmentRow(row.rowId, {
                                        modTarget: e.target.value
                                      })
                                    }
                                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                                  >
                                    {targetOptions.map((targetOpt) => (
                                      <option key={targetOpt} value={targetOpt}>
                                        {targetOpt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={row.modTarget}
                                    onChange={(e) =>
                                      handleUpdateAdjustmentRow(row.rowId, {
                                        modTarget: e.target.value
                                      })
                                    }
                                    placeholder={
                                      row.modType === 'trait_default'
                                        ? 'Built-in trait target...'
                                        : 'E.g. Darkvision 60ft, Bite...'
                                    }
                                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                                  />
                                )}
                              </div>

                              {/* 4. Modifier Value Input */}
                              <div className="lg:col-span-1">
                                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Mod Value
                                </label>
                                <input
                                  type="number"
                                  min={-20}
                                  max={60}
                                  value={row.modValue}
                                  onChange={(e) =>
                                    handleUpdateAdjustmentRow(row.rowId, {
                                      modValue:
                                        e.target.value === '' ? '' : Number(e.target.value)
                                    })
                                  }
                                  placeholder="+0"
                                  className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-mono text-center text-emerald-300 font-bold focus:outline-none focus:border-cyan-400"
                                />
                              </div>

                              {/* 5. Tracked CP Cost Input (Auto-Calculated + Overrideable) & Delete Row */}
                              <div className="lg:col-span-2 flex items-end gap-1.5">
                                <div className="flex-1">
                                  <label className="block text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
                                    CP Cost
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min={-15}
                                      max={25}
                                      value={
                                        row.customCp !== null && row.customCp !== ''
                                          ? row.customCp
                                          : costDetails.autoCp
                                      }
                                      onChange={(e) =>
                                        handleUpdateAdjustmentRow(row.rowId, {
                                          customCp:
                                            e.target.value === '' ? null : Number(e.target.value)
                                        })
                                      }
                                      className={`w-full p-1.5 pr-7 bg-slate-900 border rounded-lg text-[11px] font-mono font-bold text-center focus:outline-none ${
                                        costDetails.effectiveCp < 0
                                          ? 'border-rose-500/60 text-rose-300'
                                          : 'border-amber-500/60 text-amber-300'
                                      }`}
                                      title="Tracked CP cost for this row (auto-calculated from trait + modifier; edit to override)"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 pointer-events-none">
                                      CP
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdjustmentRow(row.rowId)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/70 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                                  title="Remove adjustment row"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Secondary Sub-Row: Custom Trait Name / Canonical Sub-Choice Pulldown / Modifier Condition Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-slate-900">
                              {row.sourceType === 'custom_trait' && (
                                <>
                                  <div className="sm:col-span-4">
                                    <input
                                      type="text"
                                      value={row.customName}
                                      onChange={(e) =>
                                        handleUpdateAdjustmentRow(row.rowId, {
                                          customName: e.target.value
                                        })
                                      }
                                      placeholder="Custom Trait Name (e.g. Bio-Electric Synapse)..."
                                      className="w-full px-2 py-1 bg-slate-900 border border-emerald-500/40 rounded-lg text-[10px] font-mono text-emerald-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <select
                                      value={row.tier}
                                      onChange={(e) =>
                                        handleUpdateAdjustmentRow(row.rowId, {
                                          tier: e.target.value,
                                          customCp: null
                                        })
                                      }
                                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-mono text-slate-200"
                                    >
                                      <option value="Basic">Basic (1 CP)</option>
                                      <option value="Advanced">Advanced (2 CP)</option>
                                      <option value="Elite">Elite (4 CP)</option>
                                      <option value="Flaw">Flaw (-2 CP)</option>
                                    </select>
                                  </div>
                                </>
                              )}

                              {choiceCfg && choiceOptions.length > 0 && (
                                <div className="sm:col-span-5 flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono font-bold text-purple-300 uppercase shrink-0">
                                    {choiceCfg.label}:
                                  </span>
                                  <select
                                    value={row.choiceValue}
                                    onChange={(e) =>
                                      handleUpdateAdjustmentRow(row.rowId, {
                                        choiceValue: e.target.value
                                      })
                                    }
                                    className="flex-1 px-2 py-1 bg-slate-900 border border-purple-500/50 rounded-lg text-[10px] font-mono text-purple-100 focus:outline-none focus:border-purple-400 cursor-pointer"
                                  >
                                    {choiceOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <div
                                className={
                                  row.sourceType === 'custom_trait'
                                    ? 'sm:col-span-6'
                                    : choiceCfg && choiceOptions.length > 0
                                      ? 'sm:col-span-7'
                                      : 'sm:col-span-12'
                                }
                              >
                                <input
                                  type="text"
                                  value={row.modNotes}
                                  onChange={(e) =>
                                    handleUpdateAdjustmentRow(row.rowId, {
                                      modNotes: e.target.value
                                    })
                                  }
                                  placeholder={
                                    linkedItem?.mechanic
                                      ? `Mechanic / Condition: ${linkedItem.mechanic}`
                                      : 'Adjoining modifier notes or situational condition (e.g., +2 in low-light or zero-G)...'
                                  }
                                  className="w-full px-2 py-1 bg-slate-900/70 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick-Add Adjustment Row Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddAdjustmentRow('trait')}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-400/50 text-cyan-200 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus size={11} />
                        <span>Add Species Trait &amp; Modifier Row</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddAdjustmentRow('attribute')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-400/50 text-indigo-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus size={11} />
                        <span>Add Attribute Mod (+5 CP / +1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddAdjustmentRow('skill')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus size={11} />
                        <span>Add Skill Bonus (+1 CP / +1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddAdjustmentRow('flaw')}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-400/50 text-rose-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus size={11} />
                        <span>Add Flaw / Rebate (-CP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddAdjustmentRow('custom')}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-400/50 text-amber-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus size={11} />
                        <span>Add Custom User Trait</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3B. Live Canonical Traits Quick-Browser (Asset-Scoped to Species OR Active Pillar) */}
                {cortexTraitsCatalog.length > 0 && (
                  <div className="space-y-2.5 bg-slate-900/60 border border-purple-500/30 rounded-xl p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPillarTraitSelector ? (
                          <Icon size={14} className="text-purple-400 shrink-0" />
                        ) : (
                          <Dna size={14} className="text-purple-400 shrink-0" />
                        )}
                        <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                          {isPillarTraitSelector
                            ? `${pillarMeta.catalogTitle} (Click to Pin/Unpin)`
                            : 'Cortex Species Traits & Flaws Quick-Browser (Click to Add/Remove Row Above)'}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200">
                          {cortexTraitsCatalog.length} Canonical{' '}
                          {isPillarTraitSelector ? pillarMeta.pluralLabel : 'Species Traits'}
                          {cortexDisadvantagesCatalog.length > 0
                            ? ` • ${cortexDisadvantagesCatalog.length} Flaws`
                            : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleAutoLoadConceptTraits}
                          className="px-2 py-0.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 border border-purple-400/50 text-purple-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title={
                            isPillarTraitSelector
                              ? pillarMeta.autoLoadTitle
                              : 'Auto-select top Cortex Species Traits matching your Part 1 concept'
                          }
                        >
                          <Sparkles size={10} className="text-purple-300" />
                          <span>
                            {isPillarTraitSelector
                              ? pillarMeta.autoLoadLabel
                              : '+ Load Concept Traits'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRandomizeCortexTraits}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                          title={`Pick 3 random ${isPillarTraitSelector ? pillarMeta.pluralLabel : 'Cortex Species Traits'}`}
                        >
                          <Shuffle size={10} />
                          <span>Random 3</span>
                        </button>

                        {costTrackerSummary.activeRowCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setAdjustmentRows([createBlankAdjustmentRow()])}
                            className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-200 text-[10px] font-mono transition-all cursor-pointer"
                          >
                            Clear Selected ({costTrackerSummary.activeRowCount})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs + Live Search Input */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(isPillarTraitSelector
                          ? [
                              {
                                id: 'suggested',
                                label: `★ Concept Match (${conceptSuggestedTraits.length})`
                              },
                              {
                                id: 'all',
                                label: `All ${pillarMeta.pluralLabel} (${cortexTraitsCatalog.length})`
                              },
                              ...pillarClassificationTabs
                            ]
                          : [
                              {
                                id: 'suggested',
                                label: `★ Concept Match (${conceptSuggestedTraits.length})`
                              },
                              {
                                id: 'basic',
                                label: `Basic 1 CP (${
                                  cortexTraitsCatalog.filter(
                                    (t) => t.tierKey === 'basic' || t.cp === 1
                                  ).length
                                })`
                              },
                              ...(cortexTraitsCatalog.some(
                                (t) => t.tierKey === 'advanced' || t.cp === 2
                              )
                                ? [
                                    {
                                      id: 'advanced',
                                      label: `Adv 2 CP (${
                                        cortexTraitsCatalog.filter(
                                          (t) => t.tierKey === 'advanced' || t.cp === 2
                                        ).length
                                      })`
                                    }
                                  ]
                                : []),
                              ...(cortexTraitsCatalog.some(
                                (t) => t.tierKey === 'elite' || t.cp >= 4
                              )
                                ? [
                                    {
                                      id: 'elite',
                                      label: `Elite 4 CP (${
                                        cortexTraitsCatalog.filter(
                                          (t) => t.tierKey === 'elite' || t.cp >= 4
                                        ).length
                                      })`
                                    }
                                  ]
                                : []),
                              { id: 'sensory_psi', label: 'Sensory & Psi' },
                              { id: 'combat_armor', label: 'Combat & DR' },
                              { id: 'mobility_form', label: 'Mobility & Form' },
                              ...(cortexDisadvantagesCatalog.length > 0
                                ? [
                                    {
                                      id: 'flaws',
                                      label: `Flaws (${cortexDisadvantagesCatalog.length})`
                                    }
                                  ]
                                : [])
                            ]
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveTraitFilter(tab.id);
                              setShowAllTraitsInTab(false);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                              activeTraitFilter === tab.id && !traitSearchQuery
                                ? tab.id === 'flaws'
                                  ? 'bg-rose-950/80 border-rose-400 text-rose-200 font-bold'
                                  : 'bg-purple-950/80 border-purple-400 text-purple-200 font-bold'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div className="relative min-w-[210px]">
                        <Search
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        />
                        <input
                          type="text"
                          value={traitSearchQuery}
                          onChange={(e) => {
                            setTraitSearchQuery(e.target.value);
                            setShowAllTraitsInTab(false);
                          }}
                          placeholder={
                            isPillarTraitSelector
                              ? pillarMeta.searchPlaceholder
                              : 'Search Cortex Species Traits (e.g. Carapace, Flight)...'
                          }
                          className="w-full pl-7 pr-6 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                        {traitSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setTraitSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Grid of Canonical Cortex Traits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {displayedCortexTraits.map((trait) => {
                        const isSelected = selectedTraitIdsSet.has(trait.id);

                        const badgeStyle = trait.isFlaw
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : trait.cp >= 4
                            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                            : trait.cp === 2
                              ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                              : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300';

                        return (
                          <button
                            key={trait.id}
                            type="button"
                            onClick={() => handleToggleCortexTrait(trait)}
                            title={`${trait.name} (${trait.cp} CP — ${trait.tier}): ${trait.mechanic}`}
                            className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between gap-0.5 cursor-pointer ${
                              isSelected
                                ? trait.isFlaw
                                  ? 'bg-rose-950/50 border-rose-400 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                  : 'bg-purple-950/55 border-purple-400 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                                : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[11px] font-mono font-bold text-slate-100 truncate">
                                {isSelected ? '✓ ' : '+ '}
                                {trait.name}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeStyle}`}
                              >
                                {trait.cp} CP
                              </span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 truncate">
                              {trait.mechanic}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Show All / Show Fewer Toggle */}
                    {filteredCortexTraits.length > 15 && (
                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAllTraitsInTab((prev) => !prev)}
                          className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-300 hover:text-purple-200 cursor-pointer"
                        >
                          {showAllTraitsInTab
                            ? 'Show Compact List (15)'
                            : `Show All ${filteredCortexTraits.length} Matching ${
                                isPillarTraitSelector ? pillarMeta.pluralLabel : 'Species Traits'
                              }`}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3B-CATALOGS. FIXED 20-SP SKILL CATALOG & RECOMMENDED FEATURES (-1 CP) CATALOG (ORIGINS, OCCUPATIONS, FACTIONS) */}
                {is20SpPillarMatrix && (
                  <div className="space-y-3 bg-slate-900/65 border border-emerald-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <BookOpen size={15} className="text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                            {skillPoolTitleByPillar} &amp; Recommended Features Catalog
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Fixed 20-Point Skill Pool (non-adjustable) + Omnicortex Feature Catalog (-1 CP Folio Discount)
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 font-bold">
                          Fixed 20 SP Pool (Non-Adjustable)
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-cyan-500/40 text-cyan-200">
                          Skills: <strong>{selectedPillarSkills.length}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-amber-500/40 text-amber-200">
                          Features (-1 CP): <strong>{selectedRecommendedFeatures.length}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Pinned Skills & Pinned Recommended Features Chips */}
                    {(selectedPillarSkills.length > 0 || selectedRecommendedFeatures.length > 0) && (
                      <div className="space-y-1.5">
                        {selectedPillarSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9.5px] font-mono font-bold uppercase text-emerald-400 mr-1">
                              20-SP Pool Skills:
                            </span>
                            {selectedPillarSkills.map((sk) => (
                              <button
                                key={`pin_sk_${sk}`}
                                type="button"
                                onClick={() => togglePillarSkill(sk)}
                                className="px-2 py-0.5 rounded-md bg-emerald-950/80 hover:bg-red-950/70 border border-emerald-500/50 hover:border-red-400 text-emerald-100 hover:text-red-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                                title={`Remove ${sk} from 20-SP pool`}
                              >
                                <span>{sk}</span>
                                <X size={10} />
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedRecommendedFeatures.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9.5px] font-mono font-bold uppercase text-amber-300 mr-1">
                              Recommended Features (-1 CP):
                            </span>
                            {selectedRecommendedFeatures.map((ft) => (
                              <button
                                key={`pin_ft_${ft}`}
                                type="button"
                                onClick={() => toggleRecommendedFeature(ft)}
                                className="px-2 py-0.5 rounded-md bg-amber-950/70 hover:bg-red-950/70 border border-amber-500/50 hover:border-red-400 text-amber-100 hover:text-red-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                                title={`Remove ${ft} from Recommended Features`}
                              >
                                <span>{ft}</span>
                                <span className="text-[9px] text-emerald-300">(-1 CP)</span>
                                <X size={10} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Catalog Mode Switcher: Skill Catalog vs Feature Catalog */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActivePillarCatalogTab('skills')}
                          className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold uppercase border flex items-center gap-1.5 cursor-pointer transition-all ${
                            activePillarCatalogTab === 'skills'
                              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <BookOpen size={11} />
                          <span>Skill Catalog ({pillarSkillsCatalog.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePillarCatalogTab('features')}
                          className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold uppercase border flex items-center gap-1.5 cursor-pointer transition-all ${
                            activePillarCatalogTab === 'features'
                              ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Award size={11} />
                          <span>Feature Catalog ({pillarFeaturesCatalog.length})</span>
                        </button>
                      </div>

                      {activePillarCatalogTab === 'skills' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleAutoLoadConceptSkills}
                            className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles size={10} />
                            <span>+ Load Concept Skills</span>
                          </button>
                          {selectedPillarSkills.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedPillarSkills([])}
                              className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-red-950/60 border border-slate-700 text-slate-400 hover:text-red-200 text-[10px] font-mono cursor-pointer"
                            >
                              Clear Skills
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleAutoLoadConceptFeatures}
                            className="px-2 py-0.5 rounded-lg bg-amber-950/80 hover:bg-amber-900/80 border border-amber-400/50 text-amber-200 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles size={10} />
                            <span>+ Load Concept Features</span>
                          </button>
                          {selectedRecommendedFeatures.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedRecommendedFeatures([])}
                              className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-red-950/60 border border-slate-700 text-slate-400 hover:text-red-200 text-[10px] font-mono cursor-pointer"
                            >
                              Clear Features
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Active Catalog View: Skills OR Features */}
                    {activePillarCatalogTab === 'skills' ? (
                      <div className="space-y-2">
                        {/* Primary Skill Group Filter Bar + Live Search */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {[
                              { id: 'all', label: `All (${pillarSkillsCatalog.length})` },
                              { id: 'suggested', label: `★ Concept Match (${skillFilterStats.suggestedCount})` },
                              { id: 'groups', label: `Skill Groups (${skillFilterStats.byGroup.groups})` },
                              { id: 'physical', label: `Physical (${skillFilterStats.byGroup.physical})` },
                              { id: 'mental', label: `Mental (${skillFilterStats.byGroup.mental})` },
                              { id: 'social', label: `Social (${skillFilterStats.byGroup.social})` },
                              { id: 'combat', label: `Combat (${skillFilterStats.byGroup.combat})` },
                              { id: 'meta', label: `Metafocus (${skillFilterStats.byGroup.meta})` }
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                  setSkillGroupFilter(tab.id);
                                  setSkillSubcategoryFilter('all');
                                  setShowAllSkillsInCatalog(false);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                                  skillGroupFilter === tab.id
                                    ? 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-sm'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          <div className="relative min-w-[210px]">
                            <Search
                              size={12}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                            />
                            <input
                              type="text"
                              value={skillCatalogSearch}
                              onChange={(e) => {
                                setSkillCatalogSearch(e.target.value);
                                setShowAllSkillsInCatalog(false);
                              }}
                              placeholder="Search Skill Catalog (e.g. Pilot, Ballistic)..."
                              className="w-full pl-7 pr-6 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                            />
                            {skillCatalogSearch && (
                              <button
                                type="button"
                                onClick={() => setSkillCatalogSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subcategory Drill-Down Bar (Mental, Social, Combat, Metafocus) + Governing Attribute Filter Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                          {Array.isArray(SKILL_SUBCATEGORY_FILTERS[skillGroupFilter]) && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 mr-0.5">
                                Subcategory:
                              </span>
                              <button
                                type="button"
                                onClick={() => setSkillSubcategoryFilter('all')}
                                className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                                  skillSubcategoryFilter === 'all'
                                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                                    : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                All ({skillFilterStats.byGroup[skillGroupFilter] || 0})
                              </button>
                              {SKILL_SUBCATEGORY_FILTERS[skillGroupFilter].map((sub) => {
                                const subCount =
                                  skillFilterStats.bySubcategory[
                                    `${skillGroupFilter}:${sub.toLowerCase()}`
                                  ] || 0;
                                return (
                                  <button
                                    key={sub}
                                    type="button"
                                    onClick={() => setSkillSubcategoryFilter(sub)}
                                    className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                                      skillSubcategoryFilter === sub
                                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                                        : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    {sub} ({subCount})
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {skillGroupFilter !== 'groups' && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-0.5">
                                Ability:
                              </span>
                              <button
                                type="button"
                                onClick={() => setSkillAttrFilter('all')}
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                                  skillAttrFilter === 'all'
                                    ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                                    : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                All
                              </button>
                              {SKILL_ATTRIBUTE_FILTERS.map((attrCode) => (
                                <button
                                  key={attrCode}
                                  type="button"
                                  onClick={() =>
                                    setSkillAttrFilter((prev) =>
                                      prev === attrCode ? 'all' : attrCode
                                    )
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold border cursor-pointer transition-all ${
                                    skillAttrFilter === attrCode
                                      ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                                      : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                  title={`Filter skills governed by ${attrCode}`}
                                >
                                  {attrCode} ({skillFilterStats.byAttr[attrCode] || 0})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {filteredPillarSkills.length === 0 ? (
                          <div className="py-4 text-center text-[11px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                            No skills match the active filter combination.{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setSkillGroupFilter('all');
                                setSkillSubcategoryFilter('all');
                                setSkillAttrFilter('all');
                                setSkillCatalogSearch('');
                              }}
                              className="text-emerald-300 underline cursor-pointer ml-1"
                            >
                              Reset Skill Filters
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                            {(skillGroupFilter !== 'all' ||
                            skillAttrFilter !== 'all' ||
                            skillCatalogSearch.trim() ||
                            showAllSkillsInCatalog
                              ? filteredPillarSkills
                              : filteredPillarSkills.slice(0, 30)
                            ).map((sk) => {
                              const isPinned = selectedPillarSkills.includes(sk.name);
                              return (
                                <button
                                  key={sk.id}
                                  type="button"
                                  onClick={() => togglePillarSkill(sk.name)}
                                  title={sk.description || sk.name}
                                  className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between gap-0.5 cursor-pointer ${
                                    isPinned
                                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100'
                                      : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-[11px] font-mono font-bold text-slate-100 truncate">
                                      {isPinned ? '✓ ' : '+ '}
                                      {sk.name}
                                    </span>
                                    {sk.primaryAttrBadge && (
                                      <span
                                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                                          sk.isSkillGroup
                                            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                                            : 'bg-slate-900 border-slate-700 text-cyan-300'
                                        }`}
                                      >
                                        {sk.primaryAttrBadge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[9px] font-mono text-slate-400 truncate">
                                    {sk.categoryLabel}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {skillGroupFilter === 'all' &&
                          skillAttrFilter === 'all' &&
                          !skillCatalogSearch.trim() &&
                          filteredPillarSkills.length > 30 && (
                            <div className="flex justify-center pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAllSkillsInCatalog((prev) => !prev)}
                                className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300 cursor-pointer"
                              >
                                {showAllSkillsInCatalog
                                  ? 'Show Top 30 Skills'
                                  : `Show All ${filteredPillarSkills.length} Skills & Groups`}
                              </button>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {[
                              { id: 'all', label: `All (${pillarFeaturesCatalog.length})` },
                              { id: 'suggested', label: `★ Concept Match (${featureFilterCounts.suggestedCount})` },
                              { id: 'Feature Groups', label: `Feature Groups (${featureFilterCounts.counts['Feature Groups'] || 0})` },
                              ...FEATURE_CATEGORIES.map((cat) => ({
                                id: cat,
                                label: `${cat} (${featureFilterCounts.counts[cat] || 0})`
                              }))
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                  setFeatureCategoryFilter(tab.id);
                                  setShowAllFeaturesInCatalog(false);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                                  featureCategoryFilter === tab.id
                                    ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-sm'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          <div className="relative min-w-[210px]">
                            <Search
                              size={12}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                            />
                            <input
                              type="text"
                              value={featureCatalogSearch}
                              onChange={(e) => {
                                setFeatureCatalogSearch(e.target.value);
                                setShowAllFeaturesInCatalog(false);
                              }}
                              placeholder="Search Feature Catalog (e.g. Tough, Gearhead)..."
                              className="w-full pl-7 pr-6 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            {featureCatalogSearch && (
                              <button
                                type="button"
                                onClick={() => setFeatureCatalogSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                          {(featureCategoryFilter !== 'all' ||
                          featureCatalogSearch.trim() ||
                          showAllFeaturesInCatalog
                            ? filteredPillarFeatures
                            : filteredPillarFeatures.slice(0, 30)
                          ).map((ft) => {
                            const isPinned = selectedRecommendedFeatures.includes(ft.name);
                            return (
                              <button
                                key={ft.id}
                                type="button"
                                onClick={() => toggleRecommendedFeature(ft.name)}
                                title={ft.description || ft.name}
                                className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between gap-0.5 cursor-pointer ${
                                  isPinned
                                    ? 'bg-amber-950/60 border-amber-400 text-amber-100'
                                    : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[11px] font-mono font-bold text-slate-100 truncate">
                                    {isPinned ? '✓ ' : '+ '}
                                    {ft.name}
                                  </span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 shrink-0">
                                    {ft.isCategoryGroup ? 'GROUP (-1 CP)' : `${ft.discountedCp} CP (-1)`}
                                  </span>
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 truncate">
                                  {ft.category}
                                  {ft.prereq ? ` • Req: ${ft.prereq}` : ''}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {featureCategoryFilter === 'all' &&
                          !featureCatalogSearch.trim() &&
                          filteredPillarFeatures.length > 30 && (
                            <div className="flex justify-center pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAllFeaturesInCatalog((prev) => !prev)}
                                className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-300 cursor-pointer"
                              >
                                {showAllFeaturesInCatalog
                                  ? 'Show Top 30 Features'
                                  : `Show All ${filteredPillarFeatures.length} Matching Features`}
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3C. Categorized Directive Presets */}
                {visibleDirectives.length > 0 && (
                  <div className="space-y-2 bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                        {profile.directiveExamplesLabel ||
                          (isSpeciesPackageBuilder
                            ? 'Species Biological & Package Directive Presets:'
                            : `${matrix?.name || 'Matrix'} Synthesis Directive Presets:`)}
                      </span>
                      {Array.isArray(profile.directiveCategories) &&
                        profile.directiveCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveDirectiveCategory('all')}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase cursor-pointer border ${
                                activeDirectiveCategory === 'all'
                                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              All
                            </button>
                            {profile.directiveCategories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveDirectiveCategory(cat.id)}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase cursor-pointer border ${
                                  activeDirectiveCategory === cat.id
                                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {visibleDirectives.map((qDir) => {
                        const isActive = customDirectives.toLowerCase().includes(qDir.toLowerCase());
                        return (
                          <button
                            key={qDir}
                            type="button"
                            onClick={() => handleToggleQuickDirective(qDir)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                              isActive
                                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                : 'bg-slate-950/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            {isActive ? '✓ ' : '+ '}
                            {qDir}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={customDirectives}
                  onChange={(e) => setCustomDirectives(e.target.value)}
                  placeholder={profile.directivesPlaceholder}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSynthesize}
                disabled={isGenerating}
                className="flex-2 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      BASTION is Synthesizing {matrix?.label || matrix?.name || 'Matrix'}...
                    </span>
                  </>
                ) : (
                  <>
                    <Cpu size={16} />
                    <span>
                      BASTION Synthesize &amp; Pre-Fill {matrix?.name || 'Matrix'}
                      {calibrationContextSummary.buttonSuffix
                        ? ` ${calibrationContextSummary.buttonSuffix}`
                        : ''}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CodexAiSynthesizerModal;
