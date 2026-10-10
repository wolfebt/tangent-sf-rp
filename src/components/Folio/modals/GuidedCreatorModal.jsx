import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { showToast } from '../../../context/ToastContext';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  X, ChevronRight, ChevronLeft, Check, Search, Shield, Target, User, Sparkles, BookOpen, 
  Layers, Plus, Compass, Dna, Bot, RefreshCw, Wand2, ArrowRight, Zap,
  Briefcase, Sword, Package, Boxes, Scale, Trash2, Minus, Building2
} from 'lucide-react';
import { DEFAULT_SKILLS } from '../../../data/skillsData';
import { DEFAULT_FEATURES, FEATURE_CATEGORIES } from '../../../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { DEFAULT_ARCHETYPES, ARCHETYPE_SPHERES, getGroupedArchetypes } from '../../../data/archetypesData';
import { DEFAULT_SPECIES, SPECIES_LINEAGES } from '../../../data/speciesData';
import { DEFAULT_OCCUPATIONS, COMMON_OCCUPATIONAL_TRAITS } from '../../../data/occupationsData';
import { DEFAULT_WEAPONRY } from '../../../data/weaponryData';
import { DEFAULT_ARMORING } from '../../../data/armoringData';
import { DEFAULT_GEAR } from '../../../data/gearData';
import { DEFAULT_MECHA } from '../../../data/mechaData';
import { DEFAULT_ARCHITECTURE } from '../../../data/architectureData';
import { scaleCarryingCapacity } from '../../../engines/tangentScalingEngine';
import {
  synthesizeCharacterWithBastion,
  calculateRulesLedger
} from '../../../services/bastionCharacterEngine';
import {
  resolveIdentityPillarsSettingLevels,
  syncIdentitySettingLevels,
  parseSettingLevel
} from '../../../engines/tangentIdentityEngine';
import {
  AttributePoolPulldown,
  FeatureMultiselectPulldown,
  TraitMultiselectPulldown,
  SkillPoolRankPulldown
} from '../shared/IdentityPoolPulldown';
import {
  formatHeightWithConversion,
  getHeightConversion,
  formatWeightWithConversion,
  getWeightConversion
} from '../../../engines/tangentMeasurementEngine';
import { formatSpeciesTrait, getInherentSpeciesTraits } from '../../../utils/speciesDisplayUtils';

const getSpeciesAttrModifier = (sp, attrName) => {
  if (!sp) return 0;
  if (Array.isArray(sp.inherent_attribute_modifiers)) {
    const found = sp.inherent_attribute_modifiers.find(m => {
      const a = (m.attribute || m.name || '').toLowerCase();
      return a.startsWith(attrName.toLowerCase().substring(0, 3));
    });
    if (found) return found.bonus ?? found.value ?? 0;
  }
  return sp[`${attrName}_modifier`] || sp[`${attrName}_mod`] || 0;
};

const mapAttrToDraftKey = (attrName) => {
  if (!attrName) return null;
  const lower = attrName.toLowerCase().trim();
  if (lower.includes('strength') || lower.includes('might')) return 'strength';
  if (lower.includes('agility') || lower.includes('reflex')) return 'agility';
  if (lower.includes('stamina') || lower.includes('constitution') || lower.includes('fortitude')) return 'stamina';
  if (lower.includes('intellect') || lower.includes('logic') || lower.includes('technology') || lower.includes('history')) return 'intellect';
  if (lower.includes('wisdom') || lower.includes('will') || lower.includes('insight') || lower.includes('spirit')) return 'wisdom';
  if (lower.includes('charisma') || lower.includes('etiquette') || lower.includes('social')) return 'charisma';
  return null;
};

const extractNameList = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(item => {
    if (typeof item === 'object' && item !== null) {
      return item.name || item.title || item.skill || item.id || '';
    }
    return String(item);
  }).filter(Boolean);
};

const STEPS = [
  { id: 'concept', title: 'Concept & Identity', desc: 'Basic Biography' },
  { id: 'species', title: 'Species', desc: 'Biological Traits' },
  { id: 'origin', title: 'Origin & Faction', desc: 'Background & Affiliation' },
  { id: 'occupation', title: 'Occupation', desc: 'Career & Training' },
  { id: 'attributes', title: 'Core Stats', desc: 'Physical & Mental Aptitude' },
  { id: 'tech', title: 'Setting Tiers', desc: 'Tech Level & Meta Level' },
  { id: 'traits-features', title: 'Traits & Features', desc: 'Background & General Allocations' },
  { id: 'skills', title: 'Skills', desc: 'Background Packages & Point Buy' },
  { id: 'property', title: 'Property', desc: 'Weaponry, Armoring & Gear' },
  { id: 'review', title: 'Review', desc: 'Final Check' }
];

const INITIAL_DRAFT = {
  'char-name': '',
  'char-concept': '',
  'char-archetype': '',
  'char-species': '',
  'char-origin': '',
  'char-secondary-origin': '',
  'char-faction': '',
  'char-occu': '',
  'char-secondary-occu': '',
  'char-age': '',
  'char-gender': '',
  'char-height': '',
  'char-weight': '',
  'char-style': '',
  'char-motive': '',
  role: '',
  summary: '',
  backstory: '',
  strength: 0,
  agility: 0,
  stamina: 0,
  intellect: 0,
  wisdom: 0,
  charisma: 0,
  technologyLevel: 3, // Default is TL3 (0 CP)
  metaLevel: 3, // Default is ML3 (0 CP)
  baseTechLevel: 3,
  baseMetaLevel: 3,
  skills: [],
  traits: [],
  features: [],
  weapons: [],
  armor: [],
  gear: [],
  mecha: [],
  architecture: [],
  other: [],
  notes: [],
  speciesAllocations: { skills: {}, traits: [], features: [], attributes: {} },
  originAllocations: { skills: {}, traits: [], features: [] },
  factionAllocations: { skills: {}, traits: [], features: [] },
  occuAllocations: { skills: {}, traits: [], features: [] },
  generalAllocations: { skills: {}, traits: [], features: [] }
};

// Flatten canonical skills with structured category names
const ALL_CANONICAL_SKILLS = Object.entries(DEFAULT_SKILLS).flatMap(([groupKey, groupList]) =>
  groupList.flatMap(subgroup =>
    subgroup.skills.map(s => ({
      ...s,
      group: groupKey,
      subcategory: subgroup.title || 'General',
      category: subgroup.title || groupKey
    }))
  )
);

// Fallback collections fetcher with multi-path resilience
const fetchCollectionWithFallback = async (primaryPath, fallbackPath) => {
  try {
    const qSnap = await getDocs(collection(db, primaryPath));
    if (!qSnap.empty) {
      const items = [];
      qSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
      return items;
    }
  } catch (e) {
    // Primary path query failed, try fallback
  }

  if (fallbackPath) {
    try {
      const qSnap = await getDocs(collection(db, fallbackPath));
      if (!qSnap.empty) {
        const items = [];
        qSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
        return items;
      }
    } catch (e) {
      // Fallback query failed
    }
  }
  return [];
};

const GuidedCreatorModal = ({ isOpen, onClose, onCharacterCreated }) => {
  const { applyGuidedCharacter } = useFolio();
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [bpRemaining, setBpRemaining] = useState(150);

  // BASTION Auto-Synthesizer state
  const [bastionPrompt, setBastionPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [bastionSynthesisReport, setBastionSynthesisReport] = useState(null);
  const [bastionNotice, setBastionNotice] = useState(null);
  
  // Search & Filter state
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('All');
  const [speciesLineageFilter, setSpeciesLineageFilter] = useState('All');
  const [speciesSearchQuery, setSpeciesSearchQuery] = useState('');

  // Property & Inventory state
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState('all');
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [isAddingCustomProperty, setIsAddingCustomProperty] = useState(false);
  const [customPropertyForm, setCustomPropertyForm] = useState({
    name: '',
    category: 'gear',
    qty: 1,
    weight: 0.5,
    cost: 50,
    notes: '',
    tl: 3
  });

  // Data Caches
  const [dbData, setDbData] = useState({
    archetypes: DEFAULT_ARCHETYPES,
    species: DEFAULT_SPECIES,
    origins: [],
    factions: [],
    occupations: [],
    skills: ALL_CANONICAL_SKILLS,
    traits: ALL_CANONICAL_TRAITS,
    features: DEFAULT_FEATURES,
    weapons: DEFAULT_WEAPONRY,
    armor: DEFAULT_ARMORING,
    gear: DEFAULT_GEAR,
    mecha: DEFAULT_MECHA,
    architecture: DEFAULT_ARCHITECTURE
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selected object tracking
  const [selectedSpeciesObj, setSelectedSpeciesObj] = useState(null);
  const [selectedArchetypeObj, setSelectedArchetypeObj] = useState(null);
  const [archetypeSphereFilter, setArchetypeSphereFilter] = useState('Sentinels');
  const [chassisApplied, setChassisApplied] = useState(false);

  const selectedOriginObj = useMemo(() => {
    return (dbData.origins || []).find(o => (o.name || o.title || o.id) === draft['char-origin']);
  }, [dbData.origins, draft['char-origin']]);

  const selectedSecondaryOriginObj = useMemo(() => {
    return (dbData.origins || []).find(o => (o.name || o.title || o.id) === draft['char-secondary-origin']);
  }, [dbData.origins, draft['char-secondary-origin']]);

  const selectedFactionObj = useMemo(() => {
    return (dbData.factions || []).find(f => (f.name || f.title || f.id) === draft['char-faction']);
  }, [dbData.factions, draft['char-faction']]);

  const selectedOccupationObj = useMemo(() => {
    return (dbData.occupations || []).find(oc => (oc.name || oc.title || oc.id) === draft['char-occu']);
  }, [dbData.occupations, draft['char-occu']]);

  const selectedSecondaryOccupationObj = useMemo(() => {
    return (dbData.occupations || []).find(oc => (oc.name || oc.title || oc.id) === draft['char-secondary-occu']);
  }, [dbData.occupations, draft['char-secondary-occu']]);

  // Derive Setting Levels specifically from Species or Faction
  const speciesSettingLevels = useMemo(() => {
    if (!selectedSpeciesObj) return { tl: null, ml: null };
    return {
      tl: parseSettingLevel(selectedSpeciesObj.tech_level ?? selectedSpeciesObj.techLevel, null),
      ml: parseSettingLevel(selectedSpeciesObj.meta_level ?? selectedSpeciesObj.metaLevel, null)
    };
  }, [selectedSpeciesObj]);

  const factionSettingLevels = useMemo(() => {
    if (!selectedFactionObj) return { tl: null, ml: null };
    return {
      tl: parseSettingLevel(selectedFactionObj.tech_level ?? selectedFactionObj.techLevel, null),
      ml: parseSettingLevel(selectedFactionObj.meta_level ?? selectedFactionObj.metaLevel, null)
    };
  }, [selectedFactionObj]);

  const pillarSettingLevels = useMemo(() => {
    const sTL = speciesSettingLevels.tl;
    const sML = speciesSettingLevels.ml;
    const fTL = factionSettingLevels.tl;
    const fML = factionSettingLevels.ml;

    const tlList = [sTL, fTL].filter(v => v !== null);
    const mlList = [sML, fML].filter(v => v !== null);

    const baseTechLevel = tlList.length > 0 ? Math.max(...tlList) : 3;
    const baseMetaLevel = mlList.length > 0 ? Math.max(...mlList) : 3;

    return {
      baseTechLevel,
      baseMetaLevel,
      speciesTL: sTL,
      speciesML: sML,
      factionTL: fTL,
      factionML: fML,
      highestTLSource: sTL !== null && sTL >= (fTL ?? -1)
        ? { pillar: 'Species', name: draft['char-species'] || 'Species', value: sTL }
        : (fTL !== null ? { pillar: 'Faction', name: draft['char-faction'] || 'Faction', value: fTL } : null),
      highestMLSource: sML !== null && sML >= (fML ?? -1)
        ? { pillar: 'Species', name: draft['char-species'] || 'Species', value: sML }
        : (fML !== null ? { pillar: 'Faction', name: draft['char-faction'] || 'Faction', value: fML } : null)
    };
  }, [speciesSettingLevels, factionSettingLevels, draft['char-species'], draft['char-faction']]);

  // Synchronize draft setting levels with species or faction pillar bases
  useEffect(() => {
    setDraft(prev => {
      let changed = false;
      const next = { ...prev };
      if (prev.baseTechLevel !== pillarSettingLevels.baseTechLevel) {
        next.baseTechLevel = pillarSettingLevels.baseTechLevel;
        if (prev.technologyLevel === undefined || prev.technologyLevel === null || prev.technologyLevel === (prev.baseTechLevel ?? 3)) {
          next.technologyLevel = pillarSettingLevels.baseTechLevel;
        }
        changed = true;
      }
      if (prev.baseMetaLevel !== pillarSettingLevels.baseMetaLevel) {
        next.baseMetaLevel = pillarSettingLevels.baseMetaLevel;
        if (prev.metaLevel === undefined || prev.metaLevel === null || prev.metaLevel === (prev.baseMetaLevel ?? 3)) {
          next.metaLevel = pillarSettingLevels.baseMetaLevel;
        }
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [pillarSettingLevels.baseTechLevel, pillarSettingLevels.baseMetaLevel]);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true);
      Promise.all([
        fetchCollectionWithFallback('species', 'omnicortex/species/items'),
        fetchCollectionWithFallback('origins', 'omnicortex/origins/items'),
        fetchCollectionWithFallback('factions', 'omnicortex/factions/items'),
        fetchCollectionWithFallback('occupations', 'omnicortex/occupations/items'),
        fetchCollectionWithFallback('skills', 'omnicortex/skills/items'),
        fetchCollectionWithFallback('traits', 'omnicortex/traits/items'),
        fetchCollectionWithFallback('features', 'omnicortex/features/items'),
        fetchCollectionWithFallback('archetypes', 'omnicortex/archetypes/items')
      ]).then(([species, origins, factions, occupations, cloudSkills, cloudTraits, cloudFeatures, cloudArchetypes]) => {
        // Merge cloud skills with canonical defaults
        const skillMap = new Map();
        ALL_CANONICAL_SKILLS.forEach(s => skillMap.set(s.name.toLowerCase(), s));
        cloudSkills.forEach(s => {
          const name = s.name || s.title;
          if (name) skillMap.set(name.toLowerCase(), { ...s, name });
        });

        // Merge cloud traits with canonical defaults
        const traitMap = new Map();
        ALL_CANONICAL_TRAITS.forEach(t => traitMap.set((t.name || t.id).toLowerCase(), t));
        cloudTraits.forEach(t => {
          const name = t.name || t.title;
          if (name) traitMap.set(name.toLowerCase(), { ...t, name });
        });

        // Merge cloud features with canonical defaults
        const featureMap = new Map();
        DEFAULT_FEATURES.forEach(f => featureMap.set(f.name.toLowerCase(), f));
        cloudFeatures.forEach(f => {
          const name = f.name || f.title;
          if (name) featureMap.set(name.toLowerCase(), { ...f, name, cp: f.cp || 3 });
        });

        // Merge cloud archetypes with canonical defaults
        const archetypeMap = new Map();
        DEFAULT_ARCHETYPES.forEach(a => archetypeMap.set(a.name.toLowerCase(), a));
        cloudArchetypes.forEach(a => {
          const name = a.name || a.title;
          if (name) archetypeMap.set(name.toLowerCase(), { ...a, name });
        });

        // Merge cloud species with canonical defaults
        const speciesMap = new Map();
        DEFAULT_SPECIES.forEach(sp => speciesMap.set((sp.id || sp.name).toLowerCase(), sp));
        species.forEach(sp => {
          const name = sp.name || sp.title;
          const key = (sp.id || name || '').toLowerCase();
          if (key) speciesMap.set(key, { ...sp, name: name || key });
        });

        setDbData({
          archetypes: Array.from(archetypeMap.values()),
          species: Array.from(speciesMap.values()),
          origins: origins.length > 0 ? origins : [],
          factions: factions.length > 0 ? factions : [],
          occupations: occupations.length > 0 ? occupations : [],
          skills: Array.from(skillMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
          traits: Array.from(traitMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
          features: Array.from(featureMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
          weapons: DEFAULT_WEAPONRY,
          armor: DEFAULT_ARMORING,
          gear: DEFAULT_GEAR,
          mecha: DEFAULT_MECHA,
          architecture: DEFAULT_ARCHITECTURE
        });
        setIsLoadingData(false);
      }).catch(err => {
        console.warn('Guided creator background fetch notice:', err);
        setIsLoadingData(false);
      });
    }
  }, [isOpen]);

  // Recalculate remaining CP
  useEffect(() => {
    let spent = 0;
    
    // Core attributes: 5 CP per point (starts at 0)
    spent += (draft.strength + draft.agility + draft.stamina + draft.intellect + draft.wisdom + draft.charisma) * 5;
    
    // Species Cost
    if (selectedSpeciesObj && (selectedSpeciesObj.cp || selectedSpeciesObj.costs?.bp)) {
      spent += parseInt(selectedSpeciesObj.cp ?? selectedSpeciesObj.costs?.bp, 10) || 0;
    }

    // Technology Level (TL 0-5; TL3 standard baseline; 10 CP per diff from 3)
    const tlVal = Math.min(5, Math.max(0, parseInt(draft.technologyLevel ?? 3, 10) || 3));
    spent += (tlVal - 3) * 10;

    // Meta Level (ML 0-5; ML3 standard baseline; 10 CP per diff from 3)
    const mlVal = Math.min(5, Math.max(0, parseInt(draft.metaLevel ?? 3, 10) || 3));
    spent += (mlVal - 3) * 10;

    // General allocated skills (1 CP per rank beyond background pools)
    if (draft.generalAllocations?.skills) {
      Object.values(draft.generalAllocations.skills).forEach(rank => {
        spent += (parseInt(rank, 10) || 0) * 1;
      });
    }

    // General allocated traits (1 CP each)
    if (draft.generalAllocations?.traits) {
      spent += (draft.generalAllocations.traits.length) * 1;
    }

    // Origin extra traits beyond 2 free (1 CP each)
    if (draft.originAllocations?.traits && draft.originAllocations.traits.length > 2) {
      spent += (draft.originAllocations.traits.length - 2) * 1;
    }

    // General allocated features (3 CP each)
    if (draft.generalAllocations?.features) {
      spent += (draft.generalAllocations.features.length) * 3;
    }

    setBpRemaining(150 - spent);
  }, [draft, selectedSpeciesObj]);

  // Grouped skills for organized selection (declared unconditionally at top level)
  const groupedSkillsForSelect = useMemo(() => {
    const groups = {};
    dbData.skills.forEach(s => {
      const gLabel = s.groupLabel || (s.group ? s.group.toUpperCase() : 'GENERAL SKILLS');
      if (!groups[gLabel]) groups[gLabel] = [];
      groups[gLabel].push(s);
    });
    return groups;
  }, [dbData.skills]);

  // Grouped features for organized selection (declared unconditionally at top level)
  const groupedFeaturesForSelect = useMemo(() => {
    const groups = {};
    dbData.features.forEach(f => {
      const cat = f.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    return groups;
  }, [dbData.features]);

  // Grouped archetypes for organized selection by canonical 4 spheres
  const groupedArchetypesForSelect = useMemo(() => {
    return getGroupedArchetypes(dbData.archetypes);
  }, [dbData.archetypes]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleFinish = async () => {
    // Combine all allocated skill ranks
    const combinedSkills = {};
    const skillAttrMap = {};

    dbData.skills.forEach(s => {
      if (s.name) skillAttrMap[s.name] = s.baseAttr || 'attr-intellect';
    });

    const aggregatePoolSkills = (pool) => {
      Object.entries(pool?.skills || {}).forEach(([sName, sRank]) => {
        combinedSkills[sName] = (combinedSkills[sName] || 0) + (parseInt(sRank, 10) || 0);
      });
    };

    aggregatePoolSkills(draft.speciesAllocations);
    aggregatePoolSkills(draft.originAllocations);
    aggregatePoolSkills(draft.factionAllocations);
    aggregatePoolSkills(draft.occuAllocations);
    aggregatePoolSkills(draft.generalAllocations);

    const finalSkillsList = Object.entries(combinedSkills).map(([name, rank], i) => ({
      id: `skill_${i}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      rank: Math.min(20, Math.max(0, rank)),
      baseAttr: skillAttrMap[name] || 'attr-intellect'
    }));

    // Combine all unique traits
    const combinedTraitsMap = new Map();
    const traitDetailMap = new Map();
    (dbData.traits || []).forEach(t => {
      if (t.name) traitDetailMap.set(t.name.toLowerCase(), t);
      if (t.id) traitDetailMap.set(t.id.toLowerCase(), t);
    });

    const addTraitsFromPool = (pool, categoryLabel, isGranted = true, source = 'general') => {
      (pool?.traits || []).forEach((tName, idx) => {
        const cleanName = typeof tName === 'object' ? (tName.name || tName.id) : String(tName);
        if (!combinedTraitsMap.has(cleanName)) {
          const detail = traitDetailMap.get(cleanName.toLowerCase()) || (typeof tName === 'object' ? tName : {});
          const isOrigin = source === 'origin';
          const traitIsFree = isOrigin ? idx < 2 : isGranted;
          combinedTraitsMap.set(cleanName, {
            id: detail.id || `trait_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: cleanName,
            category: detail.category || detail.trait_type || categoryLabel,
            trait_type: detail.trait_type || categoryLabel,
            trait_tier: detail.trait_tier || detail.tier || 'Basic',
            classification: detail.classification || 'Physical',
            source,
            description: detail.description || detail.desc || detail.mechanics || '',
            bp: traitIsFree ? 0 : (detail.bp !== undefined ? detail.bp : 1),
            standaloneBp: detail.bp !== undefined ? detail.bp : 1,
            cp: traitIsFree ? 0 : 1,
            standaloneCp: detail.cp !== undefined ? detail.cp : 1,
            isGranted: traitIsFree,
            isPaidOriginTrait: isOrigin ? !traitIsFree : false
          });
        }
      });
    };

    addTraitsFromPool(draft.speciesAllocations, 'Species Trait', true, 'species');
    addTraitsFromPool(draft.originAllocations, 'Origin Trait', true, 'origin');
    addTraitsFromPool(draft.factionAllocations, 'Faction Trait', true, 'faction');
    addTraitsFromPool(draft.occuAllocations, 'Occupation Trait', true, 'occupation');
    addTraitsFromPool(draft.generalAllocations, 'General Trait', false, 'general');

    // Add Inherent Species Traits if present
    if (selectedSpeciesObj && Array.isArray(selectedSpeciesObj.inherent_features)) {
      selectedSpeciesObj.inherent_features.forEach(trait => {
        const traitName = typeof trait === 'object' ? (trait.name || trait.title || trait.id) : String(trait);
        if (traitName && !combinedTraitsMap.has(traitName)) {
          combinedTraitsMap.set(traitName, {
            id: `trait_species_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: traitName,
            category: 'Species Inherent',
            trait_type: 'Species Trait',
            trait_tier: 'Basic',
            classification: 'Physical',
            description: typeof trait === 'object' ? trait.description || trait.desc || '' : '',
            bp: 0
          });
        }
      });
    }

    const finalTraitsList = Array.from(combinedTraitsMap.values());

    // Combine all unique features
    const combinedFeaturesMap = new Map();
    const featDetailMap = new Map();
    (dbData.features || []).forEach(f => {
      if (f.name) featDetailMap.set(f.name.toLowerCase(), f);
      if (f.id) featDetailMap.set(f.id.toLowerCase(), f);
    });

    const addFeatsFromPool = (pool, categoryLabel, isGranted = true, source = 'general') => {
      (pool?.features || []).forEach(fName => {
        const cleanName = typeof fName === 'object' ? (fName.name || fName.id) : String(fName);
        if (!combinedFeaturesMap.has(cleanName)) {
          const detail = featDetailMap.get(cleanName.toLowerCase()) || (typeof fName === 'object' ? fName : {});
          combinedFeaturesMap.set(cleanName, {
            id: detail.id || `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: cleanName,
            category: detail.category || categoryLabel,
            source,
            description: detail.description || '',
            mechanic: detail.mechanic || '',
            cp: isGranted ? 0 : (detail.cp !== undefined ? detail.cp : 3),
            standaloneCp: detail.cp !== undefined ? detail.cp : 3,
            isGranted
          });
        }
      });
    };

    addFeatsFromPool(draft.speciesAllocations, 'Species Feature', true, 'species');
    addFeatsFromPool(draft.originAllocations, 'Origin Feature', true, 'origin');
    addFeatsFromPool(draft.factionAllocations, 'Faction Feature', true, 'faction');
    addFeatsFromPool(draft.occuAllocations, 'Occupation Feature', true, 'occupation');
    addFeatsFromPool(draft.generalAllocations, 'General Feature', false, 'general');

    const finalFeaturesList = Array.from(combinedFeaturesMap.values());

    const docId = draft['character-doc-id'] || `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Calculate core primary and sub-attribute scores with canonical base: (Primary * 2) + 2 + species allocations
    const finalStr = (draft.strength || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-strength'] || 0, 10));
    const finalAgi = (draft.agility || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-agility'] || 0, 10));
    const finalSta = (draft.stamina || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-stamina'] || 0, 10));
    const finalInt = (draft.intellect || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-intellect'] || 0, 10));
    const finalWis = (draft.wisdom || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-wisdom'] || 0, 10));
    const finalCha = (draft.charisma || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-charisma'] || 0, 10));

    const mightScore = (finalStr * 2) + 2 + parseInt(draft.speciesAllocations?.attributes?.['attr-might'] || 0, 10);
    const reflexScore = (finalAgi * 2) + 2 + parseInt(draft.speciesAllocations?.attributes?.['attr-reflex'] || 0, 10);
    const fortScore = (finalSta * 2) + 2 + parseInt(draft.speciesAllocations?.attributes?.['attr-fortitude'] || 0, 10);
    const logicScore = (finalInt * 2) + 2 + parseInt(draft.speciesAllocations?.attributes?.['attr-logic'] || 0, 10);
    const willScore = (finalWis * 2) + 2 + parseInt(draft.speciesAllocations?.attributes?.['attr-will'] || 0, 10);
    const etiqScore = (finalCha * 2) + 2 + parseInt(draft.speciesAllocations?.attributes?.['attr-etiquette'] || 0, 10);

    // Generate fully normalized sheet payload for the Persona Folio
    const payload = {
      'character-doc-id': docId,
      // Basic Identity Fields
      'char-name': draft['char-name']?.trim() || 'Unnamed Persona',
      'char-concept': draft['char-concept']?.trim() || '',
      'char-archetype': draft['char-archetype'] || '',
      'char-species': draft['char-species'] || '',
      'char-origin': draft['char-origin'] || '',
      'char-secondary-origin': draft['char-secondary-origin'] || '',
      'char-faction': draft['char-faction'] || '',
      'char-occu': draft['char-occu'] || '',
      'char-secondary-occu': draft['char-secondary-occu'] || '',
      'char-age': draft['char-age'] || '',
      'char-gender': draft['char-gender'] || '',
      'char-height': draft['char-height'] || '',
      'char-weight': draft['char-weight'] || '',
      'char-style': draft['char-style'] || '',
      'base-tech-level': draft.baseTechLevel ?? pillarSettingLevels.baseTechLevel ?? 3,
      'base-meta-level': draft.baseMetaLevel ?? pillarSettingLevels.baseMetaLevel ?? 3,
      'tech-level': draft.technologyLevel ?? 3,
      'magic-level': draft.metaLevel ?? 3,
      'meta-level': draft.metaLevel ?? 3,
      'starting-cp': 150,

      // Narrative & StoryFoundry Fields
      role: draft.role || '',
      summary: draft.summary || draft['char-concept'] || '',
      appearance: draft['char-style'] || '',
      goals: draft['char-motive'] || '',
      backstory: draft.backstory || '',

      // Primary Core Attributes & Sub-Attributes Base Scores
      'attr-strength': finalStr,
      'attr-might': mightScore,
      'attr-agility': finalAgi,
      'attr-reflex': reflexScore,
      'attr-stamina': finalSta,
      'attr-fortitude': fortScore,
      'attr-intellect': finalInt,
      'attr-logic': logicScore,
      'attr-reason': logicScore,
      'attr-wisdom': finalWis,
      'attr-will': willScore,
      'attr-willpower': willScore,
      'attr-charisma': finalCha,
      'attr-etiquette': etiqScore,

      // Allocations metadata
      speciesAllocations: draft.speciesAllocations || { skills: {}, traits: [], features: [], attributes: {} },
      originAllocations: draft.originAllocations || { skills: {}, traits: [], features: [] },
      factionAllocations: draft.factionAllocations || { skills: {}, traits: [], features: [] },
      occuAllocations: draft.occuAllocations || { skills: {}, traits: [], features: [] },
      generalAllocations: draft.generalAllocations || { skills: {}, traits: [], features: [] },

      // Structured Arrays
      traits: finalTraitsList,
      features: finalFeaturesList,
      disadvantages: [],
      augmentations: [],
      awakened: [],
      invocations: [],
      special_abilities: [],
      attacks: [],
      armor: draft.armor && draft.armor.length > 0 ? draft.armor : [],
      gear: draft.gear && draft.gear.length > 0 ? draft.gear : [],
      weapons: draft.weapons && draft.weapons.length > 0 ? draft.weapons : [],
      armoring: draft.armor && draft.armor.length > 0 ? draft.armor : [],
      mecha: draft.mecha && draft.mecha.length > 0 ? draft.mecha : [],
      architecture: draft.architecture && draft.architecture.length > 0 ? draft.architecture : [],
      other: draft.other && draft.other.length > 0 ? draft.other : [],
      specializations: [],
      skills: finalSkillsList,
      notes: draft.notes && draft.notes.length > 0 ? draft.notes : [{ text: draft.backstory ? `Backstory:\n${draft.backstory}` : '' }]
    };

    // Flat Skill Key Bindings for high-performance reactivity across all Folio tabs
    Object.entries(combinedSkills).forEach(([sName, sRank]) => {
      const skObj = dbData.skills.find(s => (s.name || '').toLowerCase() === sName.toLowerCase());
      const skillId = skObj?.id || `skill-${sName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const cleanId = skillId.startsWith('skill-') ? skillId.replace('skill-', '') : skillId;
      const baseAttr = skObj?.baseAttr || 'attr-intellect';

      payload[`skill-${cleanId}-rank`] = Math.min(20, Math.max(0, parseInt(sRank, 10) || 0));
      payload[`skill-${cleanId}-base`] = baseAttr;
      payload[`skill-${cleanId}-mod`] = 0;
      if (skObj?.group) payload[`skill-${cleanId}-group`] = skObj.group;
      if (skObj?.subcategory) payload[`skill-${cleanId}-subcategory`] = skObj.subcategory;
      payload[`skill-${cleanId}-name`] = sName;
    });

    const syncedPayload = syncIdentitySettingLevels(payload, dbData);
    const success = await applyGuidedCharacter(syncedPayload);
    if (success) {
      onClose();
      if (onCharacterCreated) {
        onCharacterCreated(docId);
      }
      setTimeout(() => {
        setCurrentStep(0);
        setDraft(INITIAL_DRAFT);
        setSelectedSpeciesObj(null);
        setSelectedArchetypeObj(null);
        setChassisApplied(false);
        setBastionSynthesisReport(null);
      }, 300);
    }
  };

  const updateDraft = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const applyArchetypeChassis = (arch) => {
    if (!arch) return;
    const primKey = mapAttrToDraftKey(arch.primary_attribute);
    const secKey = mapAttrToDraftKey(arch.secondary_attribute);

    setDraft(prev => {
      const next = { ...prev };
      next['char-archetype'] = arch.name;
      if (primKey) next[primKey] = 3;
      if (secKey) next[secKey] = 2;
      if (!next['char-concept'] || next['char-concept'] === 'Unnamed Persona') {
        next['char-concept'] = arch.core_concept || arch.name;
      }
      if (!next['char-motive']) {
        next['char-motive'] = arch.tactical_role || '';
      }

      // Pre-allocate Essential Skills into general allocations
      const currentSkills = { ...next.generalAllocations?.skills };
      (arch.essential_skills || []).forEach((skName, idx) => {
        const clean = skName.replace(/\s*\(.*\)/, '').trim();
        currentSkills[clean] = idx < 4 ? 6 : 3;
      });

      // Pre-allocate Signature Features into general allocations
      const currentFeats = [...(next.generalAllocations?.features || [])];
      (arch.signature_features || []).forEach(fName => {
        if (!currentFeats.includes(fName)) currentFeats.push(fName);
      });

      next.generalAllocations = {
        ...next.generalAllocations,
        skills: currentSkills,
        features: currentFeats
      };

      return next;
    });
    setSelectedArchetypeObj(arch);
    setChassisApplied(true);
  };

  const handleBastionAutoBuild = async (customPrompt) => {
    setIsSynthesizing(true);
    try {
      const activePrompt = (customPrompt || bastionPrompt || draft['char-concept'] || 'Adventurous Space Persona').trim();
      const res = synthesizeCharacterWithBastion({
        prompt: activePrompt,
        preferredArchetype: draft['char-archetype'] || null,
        preferredSpecies: draft['char-species'] || null,
        dbData
      });

      if (res.success && res.character) {
        const { character, pillars, rawAttributes, allocationsReport } = res;

        setDraft(prev => ({
          ...prev,
          'char-name': character['char-name'] || prev['char-name'] || 'Unnamed Persona',
          'char-concept': character['char-concept'] || activePrompt,
          'char-archetype': pillars.archetype?.name || '',
          'char-species': pillars.species?.name || '',
          'char-origin': pillars.origin?.name || '',
          'char-secondary-origin': '',
          'char-faction': pillars.faction?.name || '',
          'char-occu': pillars.occupation?.name || '',
          'char-secondary-occu': '',
          'char-age': character['char-age'] || '28',
          'char-gender': character['char-gender'] || 'Unspecified',
          'char-height': character['char-height'] || "5'11\"",
          'char-weight': character['char-weight'] || '180 lbs',
          'char-style': character['char-style'] || '',
          'char-motive': character['char-motive'] || '',
          role: character.role || '',
          summary: character.summary || '',
          backstory: character.backstory || '',
          strength: rawAttributes?.['attr-strength'] ?? 0,
          agility: rawAttributes?.['attr-agility'] ?? 0,
          stamina: rawAttributes?.['attr-stamina'] ?? 0,
          intellect: rawAttributes?.['attr-intellect'] ?? 0,
          wisdom: rawAttributes?.['attr-wisdom'] ?? 0,
          technologyLevel: character['tech-level'] || 3,
          metaLevel: character['magic-level'] ?? character['meta-level'] ?? 3,
          baseTechLevel: character['base-tech-level'] || 3,
          baseMetaLevel: character['base-meta-level'] || 3,
          speciesAllocations: character.speciesAllocations || { skills: {}, traits: [], features: [], attributes: {} },
          originAllocations: character.originAllocations || { skills: {}, traits: [], features: [] },
          factionAllocations: character.factionAllocations || { skills: {}, traits: [], features: [] },
          occuAllocations: character.occuAllocations || { skills: {}, traits: [], features: [] },
          generalAllocations: character.generalAllocations || { skills: {}, traits: [], features: [] },
          skills: character.skills || [],
          traits: character.traits || [],
          features: character.features || [],
          weapons: character.weapons || [],
          armor: character.armor || [],
          gear: character.gear || [],
          notes: character.notes || []
        }));

        if (pillars.species) setSelectedSpeciesObj(pillars.species);
        if (pillars.archetype) setSelectedArchetypeObj(pillars.archetype);
        setChassisApplied(true);
        setBastionSynthesisReport({
          pillars,
          allocationsReport
        });
      }
    } catch (err) {
      console.error('BASTION guided creator auto-build error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const loadBastionDraft = (data) => {
    if (!data) return;
    setDraft(prev => ({
      ...prev,
      'char-name': data['char-name'] || prev['char-name'] || 'Unnamed Persona',
      'char-concept': data['char-concept'] || prev['char-concept'] || '',
      'char-archetype': data['char-archetype'] || '',
      'char-species': data['char-species'] || '',
      'char-origin': data['char-origin'] || '',
      'char-secondary-origin': data['char-secondary-origin'] || '',
      'char-faction': data['char-faction'] || '',
      'char-occu': data['char-occu'] || '',
      'char-secondary-occu': data['char-secondary-occu'] || '',
      'char-age': data['char-age'] || '28',
      'char-gender': data['char-gender'] || 'Unspecified',
      'char-height': data['char-height'] || "5'11\"",
      'char-weight': data['char-weight'] || '180 lbs',
      'char-style': data['char-style'] || '',
      'char-motive': data['char-motive'] || '',
      role: data.role || '',
      summary: data.summary || '',
      backstory: data.backstory || '',
      strength: data.strength ?? data.rawAttributes?.['attr-strength'] ?? 0,
      agility: data.agility ?? data.rawAttributes?.['attr-agility'] ?? 0,
      stamina: data.stamina ?? data.rawAttributes?.['attr-stamina'] ?? 0,
      intellect: data.intellect ?? data.rawAttributes?.['attr-intellect'] ?? 0,
      wisdom: data.wisdom ?? data.rawAttributes?.['attr-wisdom'] ?? 0,
      technologyLevel: data.technologyLevel ?? data['tech-level'] ?? 3,
      metaLevel: data.metaLevel ?? data['magic-level'] ?? data['meta-level'] ?? 3,
      baseTechLevel: data.baseTechLevel ?? data['base-tech-level'] ?? 3,
      baseMetaLevel: data.baseMetaLevel ?? data['base-meta-level'] ?? 3,
      speciesAllocations: data.speciesAllocations || { skills: {}, traits: [], features: [], attributes: {} },
      originAllocations: data.originAllocations || { skills: {}, traits: [], features: [] },
      factionAllocations: data.factionAllocations || { skills: {}, traits: [], features: [] },
      occuAllocations: data.occuAllocations || { skills: {}, traits: [], features: [] },
      generalAllocations: data.generalAllocations || { skills: {}, traits: [], features: [] },
      skills: data.skills || [],
      traits: data.traits || [],
      features: data.features || [],
      weapons: data.weapons || [],
      armor: data.armor || [],
      gear: data.gear || [],
      mecha: data.mecha || [],
      architecture: data.architecture || [],
      other: data.other || [],
      notes: data.notes || []
    }));

    if (data['char-species']) {
      const sp = (dbData.species || []).find(s => (s.name || s.id || '').toLowerCase() === data['char-species'].toLowerCase());
      if (sp) setSelectedSpeciesObj(sp);
    }
    if (data['char-archetype']) {
      const arch = (dbData.archetypes || []).find(a => (a.name || a.id || '').toLowerCase() === data['char-archetype'].toLowerCase());
      if (arch) {
        setSelectedArchetypeObj(arch);
        setChassisApplied(true);
      }
    }
    setBastionNotice(`Loaded character draft "${data['char-name'] || 'Persona'}" from BASTION Staged Persona.`);
  };

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('bastion_staged_draft');
        if (stored) {
          const parsed = JSON.parse(stored);
          loadBastionDraft(parsed);
          localStorage.removeItem('bastion_staged_draft');
        }
      } catch (err) {
        console.warn('Failed to parse bastion_staged_draft:', err);
      }
    }
  }, [isOpen, dbData.species, dbData.archetypes]);

  useEffect(() => {
    const handleGuidedOpen = (e) => {
      if (e?.detail) {
        loadBastionDraft(e.detail);
      }
    };
    window.addEventListener('open-folio-guided-creator', handleGuidedOpen);
    return () => window.removeEventListener('open-folio-guided-creator', handleGuidedOpen);
  }, [dbData.species, dbData.archetypes]);

  const handleApplyArchetypeAttributeSplit = () => {
    const arch = selectedArchetypeObj || (dbData.archetypes || []).find(a => a.name === draft['char-archetype']);
    const prim = mapAttrToDraftKey(arch?.primary_attribute) || 'agility';
    const sec = mapAttrToDraftKey(arch?.secondary_attribute) || 'intellect';
    const tertiary = (prim !== 'stamina' && sec !== 'stamina') ? 'stamina' : (prim !== 'strength' && sec !== 'strength' ? 'strength' : 'wisdom');

    setDraft(prev => ({
      ...prev,
      strength: 0,
      agility: 0,
      stamina: 0,
      intellect: 0,
      wisdom: 0,
      charisma: 0,
      [prim]: 3,
      [sec]: 2,
      [tertiary]: 1
    }));
    setBastionNotice(`Allocated Archetype Standard Attributes: ${prim.toUpperCase()} (+3), ${sec.toUpperCase()} (+2), ${tertiary.toUpperCase()} (+1) [30 CP].`);
  };

  const handleApplyBalancedAttributeSplit = () => {
    setDraft(prev => ({
      ...prev,
      strength: 1,
      agility: 1,
      stamina: 1,
      intellect: 1,
      wisdom: 1,
      charisma: 1
    }));
    setBastionNotice('Allocated Balanced Attributes: +1 across all 6 core attributes [30 CP].');
  };

  const handleAutoDistributeFoundation = () => {
    setDraft(prev => {
      const next = { ...prev };

      // 1. Origin Foundation: 20 SP across society skills + 2 traits
      if (selectedOriginObj) {
        const oSkills = extractNameList(selectedOriginObj.society_skills);
        const oTraits = extractNameList(selectedOriginObj.traits || selectedOriginObj.trait);
        const originAllocSkills = {};
        if (oSkills.length > 0) {
          let remainingSP = 20;
          const slice = oSkills.slice(0, 5);
          slice.forEach((sk, idx) => {
            const r = (idx === 0) ? Math.min(6, remainingSP - (Math.min(5, slice.length - 1) * 3)) : Math.min(6, Math.floor(remainingSP / (slice.length - idx)));
            const alloc = Math.min(r, remainingSP);
            originAllocSkills[sk] = alloc;
            remainingSP -= alloc;
          });
          if (remainingSP > 0 && slice[0]) {
            originAllocSkills[slice[0]] = Math.min(6, (originAllocSkills[slice[0]] || 0) + remainingSP);
          }
        }
        next.originAllocations = {
          ...next.originAllocations,
          skills: originAllocSkills,
          traits: oTraits.slice(0, 2)
        };
      }

      // 2. Faction Foundation: 20 SP across faction skills + 2 benefits/traits/features
      if (selectedFactionObj) {
        const fSkills = extractNameList(selectedFactionObj.skill_package || selectedFactionObj.skills);
        const fTraits = extractNameList(selectedFactionObj.traits || selectedFactionObj.trait);
        const fFeats = extractNameList(selectedFactionObj.features || selectedFactionObj.bonus_features || selectedFactionObj.benefits);
        const factionAllocSkills = {};
        if (fSkills.length > 0) {
          let remainingSP = 20;
          const slice = fSkills.slice(0, 5);
          slice.forEach((sk, idx) => {
            const r = (idx === 0) ? Math.min(6, remainingSP - (Math.min(5, slice.length - 1) * 3)) : Math.min(6, Math.floor(remainingSP / (slice.length - idx)));
            const alloc = Math.min(r, remainingSP);
            factionAllocSkills[sk] = alloc;
            remainingSP -= alloc;
          });
          if (remainingSP > 0 && slice[0]) {
            factionAllocSkills[slice[0]] = Math.min(6, (factionAllocSkills[slice[0]] || 0) + remainingSP);
          }
        }
        next.factionAllocations = {
          ...next.factionAllocations,
          skills: factionAllocSkills,
          traits: fTraits.slice(0, 2),
          features: fFeats.slice(0, 1)
        };
      }

      // 3. Occupation Foundation: 20 SP across professional skills + 2 traits
      if (selectedOccupationObj) {
        const occSkillsList = extractNameList(selectedOccupationObj.professional_skills || selectedOccupationObj.skills);
        const occTraitsList = extractNameList(selectedOccupationObj.traits || selectedOccupationObj.trait);
        const occAllocSkills = {};
        if (occSkillsList.length > 0) {
          let remainingSP = 20;
          const slice = occSkillsList.slice(0, 5);
          slice.forEach((sk, idx) => {
            const r = (idx === 0) ? Math.min(6, remainingSP - (Math.min(5, slice.length - 1) * 3)) : Math.min(6, Math.floor(remainingSP / (slice.length - idx)));
            const alloc = Math.min(r, remainingSP);
            occAllocSkills[sk] = alloc;
            remainingSP -= alloc;
          });
          if (remainingSP > 0 && slice[0]) {
            occAllocSkills[slice[0]] = Math.min(6, (occAllocSkills[slice[0]] || 0) + remainingSP);
          }
        }
        next.occuAllocations = {
          ...next.occuAllocations,
          skills: occAllocSkills,
          traits: occTraitsList.slice(0, 2)
        };
      }

      return next;
    });
    setBastionNotice('Auto-distributed canonical foundation packages (20 Origin SP, 20 Faction SP, 20 Occupation SP) and background traits.');
  };

  // ------------------- ALLOCATION & PROPERTY HELPERS -------------------
  const updatePoolSkillRank = (poolKey, skillName, newRank, delta, maxSP, isGeneral = false) => {
    setDraft(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentSkills = { ...(pool.skills || {}) };
      if (newRank > 0) {
        currentSkills[skillName] = newRank;
      } else {
        delete currentSkills[skillName];
      }
      return {
        ...prev,
        [poolKey]: {
          ...pool,
          skills: currentSkills
        }
      };
    });
  };

  const togglePoolTrait = (poolKey, traitName, traitObj, maxTraits, isGeneral = false) => {
    setDraft(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentTraits = [...(pool.traits || [])];
      const exists = currentTraits.includes(traitName);
      let nextTraits;
      if (exists) {
        nextTraits = currentTraits.filter(t => t !== traitName);
      } else {
        if (poolKey === 'originAllocations') {
          if (currentTraits.length >= maxTraits && bpRemaining < 1) {
            showToast({ type: 'warn', title: 'Insufficient CP', text: 'Not enough remaining CP to purchase an additional origin trait (Cost: 1 CP each beyond 2 free).' });
            return prev;
          }
        } else if (!isGeneral && currentTraits.length >= maxTraits) {
          showToast({ type: 'warn', title: 'Trait Limit Reached', text: `Maximum of ${maxTraits} traits already selected in this pool.` });
          return prev;
        }
        if (isGeneral && bpRemaining < 1) {
          showToast({ type: 'warn', title: 'Insufficient CP', text: 'Not enough remaining CP to purchase an additional trait (Cost: 1 CP).' });
          return prev;
        }
        nextTraits = [...currentTraits, traitName];
      }
      return {
        ...prev,
        [poolKey]: {
          ...pool,
          traits: nextTraits
        }
      };
    });
  };

  const removePoolTrait = (poolKey, traitName) => {
    setDraft(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentTraits = Array.isArray(pool.traits) ? pool.traits : [];
      return {
        ...prev,
        [poolKey]: {
          ...pool,
          traits: currentTraits.filter(t => t !== traitName)
        }
      };
    });
  };

  const togglePoolFeature = (poolKey, featName, featObj, maxFeats, isGeneral = false) => {
    setDraft(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentFeats = [...(pool.features || [])];
      const exists = currentFeats.includes(featName);
      let nextFeats;
      if (exists) {
        nextFeats = currentFeats.filter(f => f !== featName);
      } else {
        if (!isGeneral && currentFeats.length >= maxFeats) {
          showToast({ type: 'warn', title: 'Feature Limit Reached', text: `Maximum of ${maxFeats} features already selected in this pool.` });
          return prev;
        }
        if (isGeneral && bpRemaining < 3) {
          showToast({ type: 'warn', title: 'Insufficient CP', text: 'Not enough remaining CP to purchase an additional feature (Cost: 3 CP).' });
          return prev;
        }
        nextFeats = [...currentFeats, featName];
      }
      return {
        ...prev,
        [poolKey]: {
          ...pool,
          features: nextFeats
        }
      };
    });
  };

  const removePoolFeature = (poolKey, featName) => {
    setDraft(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentFeats = Array.isArray(pool.features) ? pool.features : [];
      return {
        ...prev,
        [poolKey]: {
          ...pool,
          features: currentFeats.filter(f => f !== featName)
        }
      };
    });
  };

  const allocateSpeciesAttribute = (attrId, delta, maxPoints) => {
    setDraft(prev => {
      const pool = prev.speciesAllocations || { skills: {}, traits: [], features: [], attributes: {} };
      const currentAttrs = { ...(pool.attributes || {}) };
      const currentVal = parseInt(currentAttrs[attrId] || 0, 10);
      const totalSpent = Object.values(currentAttrs).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
      if (delta > 0 && totalSpent >= maxPoints) {
        showToast({ type: 'warn', title: 'Points Allocated', text: `All ${maxPoints} bonus attribute points have been allocated.` });
        return prev;
      }
      if (delta < 0 && currentVal <= 0) return prev;
      const newVal = currentVal + delta;
      if (newVal > 0) currentAttrs[attrId] = newVal;
      else delete currentAttrs[attrId];
      return {
        ...prev,
        speciesAllocations: {
          ...pool,
          attributes: currentAttrs
        }
      };
    });
  };

  const sumPropertyWeight = (list) => {
    return (list || []).reduce((acc, item) => {
      if (typeof item === 'object' && item !== null) {
        const wt = parseFloat(item.weight ?? item.wt ?? item.mass ?? 0) || 0;
        const qty = parseInt(item.qty ?? item.quantity ?? 1, 10) || 1;
        return acc + (wt * qty);
      }
      return acc;
    }, 0);
  };

  const handleAddPropertyItem = (category, item) => {
    if (!item) return;
    const catKey = category === 'weaponry' ? 'weapons' : category === 'armoring' ? 'armor' : category === 'mech' ? 'mecha' : category;
    const currentList = Array.isArray(draft[catKey]) ? [...draft[catKey]] : [];
    
    const existingIndex = currentList.findIndex(existing => {
      const eName = typeof existing === 'object' ? (existing.name || existing.id) : String(existing);
      const iName = typeof item === 'object' ? (item.name || item.id) : String(item);
      return eName.toLowerCase() === iName.toLowerCase();
    });

    if (existingIndex >= 0) {
      const existing = typeof currentList[existingIndex] === 'object' ? { ...currentList[existingIndex] } : { name: currentList[existingIndex] };
      existing.qty = (parseInt(existing.qty || existing.quantity || 1, 10)) + 1;
      currentList[existingIndex] = existing;
    } else {
      currentList.push({
        id: item.id || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: item.name || item.id || 'Unnamed Item',
        category: category,
        qty: item.qty || 1,
        weight: parseFloat(item.weight ?? item.wt ?? item.mass ?? 0.5) || 0,
        cost: parseInt(item.cost ?? item.price ?? 50, 10) || 0,
        tl: item.tl || item.tech_level || 3,
        description: item.description || item.notes || item.mechanics || '',
        damage: item.damage || '',
        armor: item.armor || item.armor_value || '',
        type: item.type || item.weapon_type || item.armor_type || item.gear_type || ''
      });
    }

    setDraft(prev => ({
      ...prev,
      [catKey]: currentList
    }));
    showToast({ type: 'success', title: 'Item Added', text: `Added "${item.name}" to ${category}.` });
  };

  const handleUpdatePropertyQty = (catKey, index, delta) => {
    const list = Array.isArray(draft[catKey]) ? [...draft[catKey]] : [];
    if (!list[index]) return;
    const item = typeof list[index] === 'object' ? { ...list[index] } : { name: list[index] };
    const newQty = (parseInt(item.qty || item.quantity || 1, 10)) + delta;
    if (newQty <= 0) {
      list.splice(index, 1);
    } else {
      item.qty = newQty;
      list[index] = item;
    }
    setDraft(prev => ({ ...prev, [catKey]: list }));
  };

  const handleRemovePropertyItem = (catKey, index) => {
    const list = Array.isArray(draft[catKey]) ? [...draft[catKey]] : [];
    list.splice(index, 1);
    setDraft(prev => ({ ...prev, [catKey]: list }));
  };

  const handleAddCustomPropertyItem = () => {
    if (!customPropertyForm.name.trim()) {
      showToast({ type: 'warn', title: 'Missing Name', text: 'Please enter a name for the custom item.' });
      return;
    }
    const cat = customPropertyForm.category || 'gear';
    const catKey = cat === 'weaponry' ? 'weapons' : cat === 'armoring' ? 'armor' : cat === 'mech' ? 'mecha' : cat;
    const currentList = Array.isArray(draft[catKey]) ? [...draft[catKey]] : [];

    currentList.push({
      id: `prop_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: customPropertyForm.name.trim(),
      category: cat,
      qty: Math.max(1, parseInt(customPropertyForm.qty, 10) || 1),
      weight: Math.max(0, parseFloat(customPropertyForm.weight) || 0),
      cost: Math.max(0, parseInt(customPropertyForm.cost, 10) || 0),
      tl: Math.min(5, Math.max(0, parseInt(customPropertyForm.tl, 10) || 3)),
      description: customPropertyForm.notes || '',
      notes: customPropertyForm.notes || ''
    });

    setDraft(prev => ({ ...prev, [catKey]: currentList }));
    setCustomPropertyForm({
      name: '',
      category: cat,
      qty: 1,
      weight: 0.5,
      cost: 50,
      notes: '',
      tl: 3
    });
    setIsAddingCustomProperty(false);
    showToast({ type: 'success', title: 'Custom Item Created', text: `Added "${customPropertyForm.name.trim()}" to manifest.` });
  };

  const handleAddStarterKit = () => {
    const starterItems = [
      { cat: 'weapons', name: 'Laser Pistol', weight: 3, cost: 500, tl: 3, damage: '2d6 Energy', description: 'Standard military and civilian directed-energy sidearm.' },
      { cat: 'armor', name: 'Ballistic Mesh Vest', weight: 6, cost: 450, tl: 3, armor: 'AV 3', description: 'Flexible ballistic fiber torso protection against kinetic and energy lacerations.' },
      { cat: 'gear', name: 'Standard Field Commlink', weight: 0.5, cost: 150, tl: 3, description: 'Secure multi-band planetary communicator and micro-data slate.' },
      { cat: 'gear', name: 'Trauma Medkit', weight: 2, cost: 250, tl: 3, description: 'Emergency surgical foam, dermal sealants, and biomonitor injector.' },
      { cat: 'gear', name: 'Omni-Tool Utility Rig', weight: 1.5, cost: 200, tl: 3, description: 'High-frequency rotary head, laser welder, and micro-diagnostics scanner.' },
      { cat: 'other', name: 'Emergency Ration Packs (x7)', weight: 3.5, qty: 7, cost: 70, tl: 3, description: 'Standard high-nutrient compact planetary survival paste.' }
    ];

    setDraft(prev => {
      const next = { ...prev };
      starterItems.forEach(item => {
        const catKey = item.cat;
        const currentList = Array.isArray(next[catKey]) ? [...next[catKey]] : [];
        if (!currentList.some(existing => (existing.name || '').toLowerCase() === item.name.toLowerCase())) {
          currentList.push({
            id: `starter_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ...item
          });
        }
        next[catKey] = currentList;
      });
      return next;
    });
    showToast({ type: 'success', title: 'Starter Kit Added', text: 'Added standard persona survival field kit to property manifest.' });
  };

  // ------------------- STEP RENDERS -------------------
  
  const renderConcept = () => {
    const filteredArchetypes = (dbData.archetypes || [])
      .filter(a => {
        if (archetypeSphereFilter === 'All') return true;
        return (a.sphere || '').toLowerCase().includes(archetypeSphereFilter.toLowerCase());
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return (
      <div className="space-y-6 w-full">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Concept & Identity</h3>
          <p className="text-sm text-slate-400">Establish the baseline identity, physical profile, narrative foundation, and optional Archetype chassis of your persona.</p>
        </div>

        {/* BASTION 5-Pillar Auto-Synthesizer Panel */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/30 border border-cyan-500/40 rounded-xl space-y-4 shadow-xl ring-1 ring-cyan-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Bot size={22} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 flex items-center gap-2">
                  BASTION 5-Pillar Auto-Synthesizer
                </h4>
                <p className="text-[11px] text-slate-400">
                  Strictly grounded in canonical database: Archetype → Species → Faction → Origin → Occupation.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-bold">
              Database Grounded • Zero Fabrications
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={bastionPrompt}
                onChange={e => setBastionPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBastionAutoBuild();
                  }
                }}
                placeholder="Enter character concept or trope (e.g. 'covert stealth sniper', 'void privateer', 'combat trauma medic')..."
                className="flex-1 bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleBastionAutoBuild()}
                disabled={isSynthesizing}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    <span>Auto-Build</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BASTION Synthesis Result Card */}
          {bastionSynthesisReport && (
            <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400" />
                  BASTION 5-Pillar Synthesis Applied to Wizard Draft
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  10 Steps Populated
                </span>
              </div>

              {/* 5 Pillar Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                  <Compass size={12} className="text-amber-400" />
                  1. Archetype: {bastionSynthesisReport.pillars.archetype.name}
                </span>
                <span className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
                  <Dna size={12} className="text-cyan-400" />
                  2. Species: {bastionSynthesisReport.pillars.species.name}
                </span>
                <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold flex items-center gap-1">
                  <Shield size={12} className="text-purple-400" />
                  3. Faction: {bastionSynthesisReport.pillars.faction.name}
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <BookOpen size={12} className="text-emerald-400" />
                  4. Origin: {bastionSynthesisReport.pillars.origin.name}
                </span>
                <span className="px-2.5 py-1 rounded bg-sky-950/60 border border-sky-500/40 text-sky-300 text-[11px] font-bold flex items-center gap-1">
                  <User size={12} className="text-sky-400" />
                  5. Occupation: {bastionSynthesisReport.pillars.occupation.name}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>
                  Allocated: {bastionSynthesisReport.allocationsReport.skillsCount} skills • {bastionSynthesisReport.allocationsReport.traitsCount} traits • {bastionSynthesisReport.allocationsReport.featuresCount} features • {bastionSynthesisReport.allocationsReport.weaponsCount} weapons • {bastionSynthesisReport.allocationsReport.armorCount} armor.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(9)}
                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/40 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Jump to Review <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Persona Name / Callsign</label>
              <input 
                type="text" value={draft['char-name']} onChange={e => updateDraft('char-name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                placeholder="e.g. Commander Xy'larra, Dash Rendar" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Character Concept</label>
              <input 
                type="text" value={draft['char-concept']} onChange={e => updateDraft('char-concept', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                placeholder="e.g. Cybernetic Infiltrator, Void Diplomat" 
              />
            </div>
          </div>

          {/* Archetype Chassis Selector (Optional) */}
          <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-cyan-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Archetype Chassis (Optional 80-CP Blueprint)</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">100 Tangent Archetypes</span>
            </div>

            {/* Sphere Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Sentinels', 'Operatives', 'Visionaries', 'Savants', 'All'].map(sp => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setArchetypeSphereFilter(sp)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    archetypeSphereFilter === sp 
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>

            {/* Archetype Select Dropdown */}
            <div>
              <select
                value={draft['char-archetype'] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft('char-archetype', val);
                  const found = (dbData.archetypes || []).find(a => a.name === val || a.id === val);
                  setSelectedArchetypeObj(found || null);
                  setChassisApplied(false);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-cyan-500 outline-none"
              >
                <option value="">-- No Archetype (Custom Open Point-Buy) --</option>
                {archetypeSphereFilter === 'All' ? (
                  groupedArchetypesForSelect.map(([sphereName, list]) => (
                    <optgroup key={sphereName} label={`─── ${sphereName.toUpperCase()} ───`} className="bg-slate-950 text-cyan-400 font-bold font-mono">
                      {list.map(a => (
                        <option key={a.id || a.name} value={a.name} className="bg-slate-900 text-slate-100 font-normal font-sans">
                          {a.name} — {a.core_concept || `${a.primary_attribute} / ${a.secondary_attribute}`}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : (
                  filteredArchetypes.map(a => (
                    <option key={a.id || a.name} value={a.name}>
                      {a.name} ({a.sphere?.split(' ')[0] || 'Archetype'}) — {a.core_concept || `${a.primary_attribute} / ${a.secondary_attribute}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Archetype Details Card */}
            {selectedArchetypeObj && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold text-white text-sm">{selectedArchetypeObj.name}</span>
                    <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {selectedArchetypeObj.sphere}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">80 CP Chassis</span>
                </div>

                {selectedArchetypeObj.core_concept && (
                  <p className="text-slate-300 italic text-[11px]">
                    "{selectedArchetypeObj.core_concept}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold block">Key Attributes:</span>
                    <span className="text-cyan-300 font-bold">+3 {selectedArchetypeObj.primary_attribute}</span>
                    <span className="text-slate-400">, </span>
                    <span className="text-amber-300 font-bold">+2 {selectedArchetypeObj.secondary_attribute}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Tactical Role:</span>
                    <span className="text-slate-300">{selectedArchetypeObj.tactical_role || 'Specialist'}</span>
                  </div>
                </div>

                {selectedArchetypeObj.essential_skills?.length > 0 && (
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-semibold block">Essential Skills:</span>
                    <span className="text-slate-300">{selectedArchetypeObj.essential_skills.join(', ')}</span>
                  </div>
                )}

                {selectedArchetypeObj.signature_features?.length > 0 && (
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-semibold block">Signature Features:</span>
                    <span className="text-slate-300">{selectedArchetypeObj.signature_features.join(', ')}</span>
                  </div>
                )}

                <div className="pt-2">
                  {!chassisApplied ? (
                    <button
                      type="button"
                      onClick={() => applyArchetypeChassis(selectedArchetypeObj)}
                      className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                    >
                      <Sparkles size={14} />
                      Apply 80-CP Archetype Chassis (+3 Prim, +2 Sec, Skills & Features)
                    </button>
                  ) : (
                    <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400"/>
                        80-CP Chassis Applied (+3 {selectedArchetypeObj.primary_attribute}, +2 {selectedArchetypeObj.secondary_attribute}, Skills & Features).
                      </span>
                      <button 
                        type="button"
                        onClick={() => applyArchetypeChassis(selectedArchetypeObj)} 
                        className="text-xs underline text-emerald-400 hover:text-emerald-200 cursor-pointer"
                      >
                        Re-apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
              <input type="text" value={draft['char-age']} onChange={e => updateDraft('char-age', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs" placeholder="28" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Gender / Pronouns</label>
              <input type="text" value={draft['char-gender']} onChange={e => updateDraft('char-gender', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs" placeholder="Female / They" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300">Height</label>
                {(() => {
                  const val = draft['char-height'] || '';
                  const conv = getHeightConversion(val);
                  if (conv && !val.includes(`[${conv}]`)) {
                    return <span className="text-[10px] font-mono text-cyan-300">≈ [{conv}]</span>;
                  }
                  return null;
                })()}
              </div>
              <input
                type="text"
                value={draft['char-height']}
                onChange={e => updateDraft('char-height', e.target.value)}
                onBlur={e => {
                  const formatted = formatHeightWithConversion(e.target.value);
                  if (formatted !== e.target.value) {
                    updateDraft('char-height', formatted);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-cyan-500 outline-none"
                placeholder="5'11&quot; or 1.80m"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300">Weight</label>
                {(() => {
                  const val = draft['char-weight'] || '';
                  const conv = getWeightConversion(val);
                  if (conv && !val.includes(`[${conv}]`)) {
                    return <span className="text-[10px] font-mono text-cyan-300">≈ [{conv}]</span>;
                  }
                  return null;
                })()}
              </div>
              <input
                type="text"
                value={draft['char-weight']}
                onChange={e => updateDraft('char-weight', e.target.value)}
                onBlur={e => {
                  const formatted = formatWeightWithConversion(e.target.value);
                  if (formatted !== e.target.value) {
                    updateDraft('char-weight', formatted);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-cyan-500 outline-none"
                placeholder="180 lbs or 82kg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Physical Style & Appearance</label>
            <input 
              type="text" value={draft['char-style']} onChange={e => updateDraft('char-style', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-cyan-500 outline-none" 
              placeholder="e.g. Scuffed blast-vest, neon cyber-optics, rugged traveler coat" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Core Motivation / Driving Goal</label>
            <input 
              type="text" value={draft['char-motive']} onChange={e => updateDraft('char-motive', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-cyan-500 outline-none" 
              placeholder="e.g. Pay off debt to the Syndicate, unlock ancient Progenitor ruins" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Brief Backstory & Origins (Optional)</label>
            <textarea 
              rows={2}
              value={draft.backstory} onChange={e => updateDraft('backstory', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-cyan-500 outline-none resize-none" 
              placeholder="Brief notes on background, past missions, or defining events..." 
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSelectionList = (title, items, selectedName, onSelect, icon = <User size={16}/>) => (
    <div className="space-y-4 w-full h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
        <p className="text-sm text-slate-400">Select an option to define your persona's background archetype.</p>
      </div>
      
      {isLoadingData && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-cyan-500"><Search size={32} /></div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
          <p>No predefined database entries found. You may enter a custom {title} name below:</p>
          <div className="mt-4 max-w-md mx-auto flex gap-2">
            <input
              type="text"
              defaultValue={selectedName}
              placeholder={`Enter custom ${title}...`}
              id={`custom_${title}`}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
            <button
              onClick={() => {
                const el = document.getElementById(`custom_${title}`);
                if (el && el.value.trim()) onSelect({ name: el.value.trim() });
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg"
            >
              Set
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 pb-4">
          {items.map(item => {
            const name = item.name || item.title || item.id;
            const isSelected = selectedName === name;
            return (
              <div 
                key={item.id || name} 
                onClick={() => onSelect(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-bold flex items-center gap-2 ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {icon} {name}
                  </h4>
                  {item.cp !== undefined && item.cp !== 0 && (
                    <span className="text-xs font-bold bg-slate-900 px-2 py-1 rounded text-amber-400 border border-amber-500/30">
                      {item.cp} CP
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">{item.description || 'No description available.'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSpecies = () => {
    const filteredSpecies = (dbData.species || []).filter(sp => {
      const parentName = (sp.parent_species || '').toLowerCase();
      const name = (sp.name || '').toLowerCase();
      const title = (sp.title || '').toLowerCase();
      const desc = (sp.description || '').toLowerCase();
      const homeworld = (sp.homeworld || '').toLowerCase();

      // Lineage filter
      if (speciesLineageFilter !== 'All') {
        const target = speciesLineageFilter.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
        const cleanParent = parentName.replace(/[^a-z0-9]/g, '');
        const cleanId = (sp.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanParent.includes(target) && !cleanId.includes(target)) return false;
      }

      // Search query
      if (speciesSearchQuery.trim()) {
        const q = speciesSearchQuery.toLowerCase().trim();
        return name.includes(q) || title.includes(q) || desc.includes(q) || parentName.includes(q) || homeworld.includes(q);
      }

      return true;
    });

    return (
      <div className="space-y-4 w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <Dna className="text-cyan-400" size={22} />
              <span>Species & Transhuman Lineages</span>
            </h3>
            <p className="text-sm text-slate-400">Select your character's species to establish inherent traits, attribute modifiers, and biology.</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={speciesSearchQuery}
              onChange={e => setSpeciesSearchQuery(e.target.value)}
              placeholder="Search 81 species..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            {speciesSearchQuery && (
              <button
                onClick={() => setSpeciesSearchQuery('')}
                className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"
              >✕</button>
            )}
          </div>
        </div>


        {/* Lineage Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSpeciesLineageFilter('All')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              speciesLineageFilter === 'All'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({(dbData.species || []).length})
          </button>
          {SPECIES_LINEAGES.map(lin => {
            const shortName = lin.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const count = (dbData.species || []).filter(s => {
              const cleanParent = (s.parent_species || '').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
              const cleanId = (s.id || '').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
              return cleanParent.includes(shortName) || cleanId.includes(shortName);
            }).length;
            return (
              <button
                key={lin.id}
                type="button"
                onClick={() => setSpeciesLineageFilter(lin.name)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  speciesLineageFilter === lin.name
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title={lin.description}
              >
                <span>{lin.name.split(' ')[0]}</span>
                {count > 0 && (
                  <span className="text-[10px] px-1 py-0.2 rounded font-mono bg-slate-800 text-slate-400">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Species Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 pb-4">
          {filteredSpecies.map(sp => {
            const isSelected = draft['char-species'] === sp.name || draft['char-species'] === sp.title || draft['char-species'] === sp.id;
            const bpCost = parseInt(sp.cp_cost ?? sp.cp ?? 10, 10);
            const inherentMods = Array.isArray(sp.inherent_attribute_modifiers) ? sp.inherent_attribute_modifiers : [];
            const inherentFeats = getInherentSpeciesTraits(sp);

            return (
              <div
                key={sp.id || sp.name}
                onClick={() => {
                  updateDraft('char-species', sp.name || sp.title || sp.id);
                  setSelectedSpeciesObj(sp);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <div>
                      <h4 className={`font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {sp.name}
                      </h4>
                      {sp.parent_species && (
                        <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                          <span>🧬</span> {sp.parent_species}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold bg-slate-950 px-2.5 py-1 rounded text-amber-400 border border-amber-500/30 font-mono shrink-0">
                      {bpCost} CP
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{sp.description || 'Canonical species baseline.'}</p>

                  {/* Attribute & Feature Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inherentMods.map((m, i) => {
                      const aName = typeof m === 'object' ? (m.attribute || m.name) : String(m);
                      const aVal = typeof m === 'object' ? (m.bonus ?? m.value ?? 1) : 1;
                      return (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                          {aName} {aVal >= 0 ? `+${aVal}` : aVal}
                        </span>
                      );
                    })}
                    {sp.stigma && sp.stigma !== 'None' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 font-mono">
                        ⚠️ {sp.stigma}
                      </span>
                    )}
                    {sp.homeworld && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30 font-mono">
                        🪐 {sp.homeworld.split('(')[0].trim()}
                      </span>
                    )}
                  </div>
                </div>

                {inherentFeats.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-semibold">Inherent: </span>
                    <span>
                      {inherentFeats.slice(0, 3).map(f => formatSpeciesTrait(f, sp).label).join(', ')}
                      {inherentFeats.length > 3 ? ` +${inherentFeats.length - 3} more` : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOriginFaction = () => {
    return (
      <div className="space-y-6 w-full h-full flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Origin & Faction</h3>
          <p className="text-sm text-slate-400">
            Choose your homeworld origin and faction allegiance. Your chosen origin grants 20 SP for society skills and 2 bonus features/traits reflecting your upbringing environment, while your faction grants a 20 SP skill package and 2 organizational benefits.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-1">
        {/* Origin Column */}
        <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col">
          <div>
            <h4 className="font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-2">
              <BookOpen size={16} /> Origin Homeworld (Primary)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Defines your home environment and grants 20 SP & 2 traits.</p>
          </div>

          {dbData.origins.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 italic">No origin presets found. Enter custom origin:</p>
              <input 
                type="text" 
                value={draft['char-origin']} 
                onChange={e => updateDraft('char-origin', e.target.value)}
                placeholder="e.g. Core World, Outer Fringe, Orbital Station"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {dbData.origins.map(org => {
                const name = org.name || org.title || org.id;
                const isSelected = draft['char-origin'] === name;
                return (
                  <div 
                    key={org.id || name} onClick={() => updateDraft('char-origin', name)}
                    className={`p-2.5 rounded-lg border text-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between items-center">
                      <span>{name}</span>
                      {isSelected && <span className="text-[10px] text-amber-400 font-mono">PRIMARY</span>}
                    </div>
                    {org.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{org.description}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional Secondary Origin (Expands Options) */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-300/90 block uppercase tracking-wide">
                  Optional Secondary Origin
                </span>
                <span className="text-[10px] text-slate-400">
                  Expands available skill & trait options without gaining extra points.
                </span>
              </div>
              {draft['char-secondary-origin'] && (
                <button
                  type="button"
                  onClick={() => updateDraft('char-secondary-origin', '')}
                  className="text-[10px] text-slate-400 hover:text-red-400 uppercase font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <select
              value={draft['char-secondary-origin'] || ''}
              onChange={e => updateDraft('char-secondary-origin', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2 text-xs text-slate-200 outline-none font-mono"
            >
              <option value="">-- No Secondary Origin --</option>
              {dbData.origins
                .filter(o => (o.name || o.title || o.id) !== draft['char-origin'])
                .map(org => {
                  const name = org.name || org.title || org.id;
                  return (
                    <option key={org.id || name} value={name}>
                      + {name}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Faction Column */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <Shield size={16} /> Faction Allegiance
          </h4>
          {dbData.factions.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 italic">No faction presets found. Enter custom faction:</p>
              <input 
                type="text" 
                value={draft['char-faction']} 
                onChange={e => updateDraft('char-faction', e.target.value)}
                placeholder="e.g. Sol Alliance, Syndicate Guild, Independent"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
          ) : (
            dbData.factions.map(fac => {
              const name = fac.name || fac.title || fac.id;
              return (
                <div 
                  key={fac.id || name} onClick={() => updateDraft('char-faction', name)}
                  className={`p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                    draft['char-faction'] === name
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold">{name}</div>
                  {fac.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{fac.description}</p>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    );
  };

  const renderOccupation = () => {
    return (
      <div className="space-y-4 w-full">

        {renderSelectionList(
          'Occupation', 
          dbData.occupations, 
          draft['char-occu'], 
          (occ) => updateDraft('char-occu', occ.name || occ.title || occ.id),
          <Shield size={16} />
        )}

      {/* Optional Background Occupation (via Background Trait) */}
      <div className="bg-slate-900/60 border border-sky-900/50 p-3.5 rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-sky-300 block uppercase tracking-wider">
              Optional Background Occupation (via Background Trait)
            </span>
            <span className="text-[10px] text-slate-400">
              The Background trait enables selecting training from another profession, expanding trait options from that background.
            </span>
          </div>
          {draft['char-secondary-occu'] && (
            <button
              type="button"
              onClick={() => updateDraft('char-secondary-occu', '')}
              className="text-[10px] text-slate-400 hover:text-red-400 uppercase font-mono cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={draft['char-secondary-occu'] || ''}
          onChange={e => updateDraft('char-secondary-occu', e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-lg p-2 text-xs text-slate-200 outline-none font-mono"
        >
          <option value="">-- No Background Occupation --</option>
          {dbData.occupations
            .filter(oc => (oc.name || oc.title || oc.id) !== draft['char-occu'])
            .map(oc => {
              const name = oc.name || oc.title || oc.id;
              return (
                <option key={oc.id || name} value={name}>
                  + {name}
                </option>
              );
            })}
        </select>
      </div>
    </div>
    );
  };

  const renderAttributes = () => (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Core Stats (Attributes)</h3>
        <p className="text-sm text-slate-400">Allocate your base attributes. Maximum +4 before species modifiers. Each +1 point costs <strong className="text-amber-400">5 CP</strong>.</p>
        
        {/* BASTION Co-Pilot Quick Stats Allocation */}
        <div className="mt-3 p-3 bg-slate-900/80 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide block">
                BASTION Co-Pilot • Quick Stats Allocation
              </span>
              <span className="text-[10px] text-slate-400">
                Canonical baseline allocation: max +4 raw before species modifiers (5 CP / pt).
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApplyArchetypeAttributeSplit}
              className="px-2.5 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Allocates Primary +3, Secondary +2, Stamina +1 (30 CP)"
            >
              <Zap size={12} />
              <span>Archetype Split (+3 / +2 / +1)</span>
            </button>
            <button
              type="button"
              onClick={handleApplyBalancedAttributeSplit}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Allocates +1 across all 6 core attributes (30 CP)"
            >
              <span>Balanced (+1 All)</span>
            </button>
          </div>
        </div>

        {selectedSpeciesObj && (
          <div className="mt-3 p-3 bg-cyan-950/30 border border-cyan-800 rounded-lg text-xs">
            <span className="font-bold text-cyan-300 block mb-1">Species Modifiers ({selectedSpeciesObj.name || selectedSpeciesObj.title || 'Selected Species'}):</span>
            <div className="flex flex-wrap gap-4">
              {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => {
                const mod = getSpeciesAttrModifier(selectedSpeciesObj, attr);
                if (mod === 0) return null;
                return <span key={attr} className="text-slate-300 capitalize">{attr}: <span className={mod > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{mod > 0 ? `+${mod}` : mod}</span></span>;
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => {
          const val = draft[attr];
          return (
            <div key={attr} className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="capitalize font-bold text-slate-200 tracking-wide">{attr}</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateDraft(attr, Math.max(0, val - 1))} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  -
                </button>
                <div className="w-8 text-center text-xl font-black text-cyan-300">{val}</div>
                <button 
                  onClick={() => updateDraft(attr, Math.min(4, val + 1))} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTechLevel = () => {
    const currentTL = Math.min(5, Math.max(0, parseInt(draft.technologyLevel ?? 3, 10) || 3));
    const currentML = Math.min(5, Math.max(0, parseInt(draft.metaLevel ?? 3, 10) || 3));
    const baseTL = pillarSettingLevels.baseTechLevel ?? 3;
    const baseML = pillarSettingLevels.baseMetaLevel ?? 3;
    const speciesTL = speciesSettingLevels.tl;
    const speciesML = speciesSettingLevels.ml;
    const factionTL = factionSettingLevels.tl;
    const factionML = factionSettingLevels.ml;
    const tlDelta = (currentTL - 3) * 10;
    const mlDelta = (currentML - 3) * 10;

    const isMatchingSpecies = speciesTL !== null && speciesML !== null && currentTL === speciesTL && currentML === speciesML;
    const isMatchingFaction = factionTL !== null && factionML !== null && currentTL === factionTL && currentML === factionML;
    const isMatchingHighest = currentTL === baseTL && currentML === baseML;

    const tlOptions = [
      { level: 0, label: 'TL0 - Stone Age', desc: 'Pre-metal stone tool cultures. Grants +30 CP award.', cost: -30 },
      { level: 1, label: 'TL1 - Primitive', desc: 'Pre-industrial bronze/iron & agrarian societies. Grants +20 CP award.', cost: -20 },
      { level: 2, label: 'TL2 - Industrial', desc: 'Combustion engines, steam, & early electrical grids. Grants +10 CP award.', cost: -10 },
      { level: 3, label: 'TL3 - Spacefaring (Standard)', desc: 'Interstellar baseline: grav-drives, blasters, kinetic shields. 0 CP Baseline.', cost: 0 },
      { level: 4, label: 'TL4 - Advanced', desc: 'Subspace relays, plasma lattice armor, quantum AI. Costs 10 CP.', cost: 10 },
      { level: 5, label: 'TL5 - Theoretical', desc: 'Post-scarcity matter transmuters, exotic dark-matter drives. Costs 20 CP.', cost: 20 },
    ];

    const mlOptions = [
      { level: 0, label: 'ML0 - Mundane / Null', desc: 'Null etheric presence; complete metaphysics absence. Grants +30 CP award.', cost: -30 },
      { level: 1, label: 'ML1 - Latent / Low Magic', desc: 'Subtle psychic intuition & raw metaphysical latency. Grants +20 CP award.', cost: -20 },
      { level: 2, label: 'ML2 - Practiced', desc: 'Structured ritualism, meditation, & basic channeling. Grants +10 CP award.', cost: -10 },
      { level: 3, label: 'ML3 - Standard Metaphysics', desc: 'Galactic baseline: awakened disciples, etheric shielding, psionic telemetry. 0 CP Baseline.', cost: 0 },
      { level: 4, label: 'ML4 - High Magic / Adept', desc: 'Master psionics, dimensional warping, reality shaping. Costs 10 CP.', cost: 10 },
      { level: 5, label: 'ML5 - Archon / Mythic', desc: 'Cosmic scale metaphysics, spontaneous materialization, void transcendence. Costs 20 CP.', cost: 20 },
    ];

    return (
      <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-xl font-bold text-cyan-400">Setting Tiers: Technology Level &amp; Meta Level</h3>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded font-bold border ${tlDelta + mlDelta > 0 ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : tlDelta + mlDelta < 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                Tier Net CP: {tlDelta + mlDelta > 0 ? `-${tlDelta + mlDelta} CP Cost` : tlDelta + mlDelta < 0 ? `+${Math.abs(tlDelta + mlDelta)} CP Awarded` : '0 CP (Baseline)'}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Establish your character's technology and metaphysics setting tiers. Scores under 3 award <strong className="text-emerald-400">+10 CP per level difference</strong>. Increases over 3 cost <strong className="text-amber-400">10 CP per level</strong>.
          </p>

          {/* Setting Tiers from Species & Faction Baseline Panel */}
          <div className="mt-4 p-4 bg-slate-900/90 border border-cyan-500/40 rounded-xl space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                <div>
                  <span className="font-bold text-cyan-300 uppercase tracking-wider text-xs block">
                    Establish TL &amp; ML From Species or Faction
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Apply canonical civilization tiers directly from your chosen species lineage or faction allegiance.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">Current Setting:</span>
                <span className="font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  TL{currentTL} / ML{currentML}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Species Card */}
              <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isMatchingSpecies
                  ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/40 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-cyan-600/50'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Dna size={14} className="text-cyan-400" />
                      <span>Species Setting</span>
                    </span>
                    {isMatchingSpecies && (
                      <span className="text-[9px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1 truncate">
                    {draft['char-species'] || 'No Species Selected'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {speciesTL !== null ? `TL${speciesTL}` : 'TL3 (Def)'} • {speciesML !== null ? `ML${speciesML}` : 'ML3 (Def)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetTL = speciesTL ?? 3;
                    const targetML = speciesML ?? 3;
                    updateDraft('technologyLevel', targetTL);
                    updateDraft('metaLevel', targetML);
                    setBastionNotice(`Set TL & ML from Species (${draft['char-species'] || 'Species'}): TL${targetTL} / ML${targetML}`);
                  }}
                  className="mt-2.5 w-full py-1.5 px-2 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 rounded text-[11px] font-bold transition-all cursor-pointer text-center"
                >
                  Set From Species (TL{speciesTL ?? 3} / ML{speciesML ?? 3})
                </button>
              </div>

              {/* Faction Card */}
              <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isMatchingFaction
                  ? 'bg-purple-950/60 border-purple-400 ring-1 ring-purple-400/40 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-purple-600/50'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Shield size={14} className="text-purple-400" />
                      <span>Faction Setting</span>
                    </span>
                    {isMatchingFaction && (
                      <span className="text-[9px] bg-purple-500 text-slate-950 font-black px-1.5 py-0.2 rounded">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1 truncate">
                    {draft['char-faction'] || 'No Faction Selected'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {factionTL !== null ? `TL${factionTL}` : 'TL3 (Def)'} • {factionML !== null ? `ML${factionML}` : 'ML3 (Def)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetTL = factionTL ?? 3;
                    const targetML = factionML ?? 3;
                    updateDraft('technologyLevel', targetTL);
                    updateDraft('metaLevel', targetML);
                    setBastionNotice(`Set TL & ML from Faction (${draft['char-faction'] || 'Faction'}): TL${targetTL} / ML${targetML}`);
                  }}
                  className="mt-2.5 w-full py-1.5 px-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded text-[11px] font-bold transition-all cursor-pointer text-center"
                >
                  Set From Faction (TL{factionTL ?? 3} / ML{factionML ?? 3})
                </button>
              </div>

              {/* Highest Combined Base Card */}
              <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isMatchingHighest
                  ? 'bg-blue-950/60 border-blue-400 ring-1 ring-blue-400/40 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-blue-600/50'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Zap size={14} className="text-blue-400" />
                      <span>Highest Combined</span>
                    </span>
                    {isMatchingHighest && (
                      <span className="text-[9px] bg-blue-500 text-slate-950 font-black px-1.5 py-0.2 rounded">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">
                    Combined Baseline
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    TL{baseTL} ({pillarSettingLevels.highestTLSource?.pillar || 'Base'}) • ML{baseML} ({pillarSettingLevels.highestMLSource?.pillar || 'Base'})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateDraft('technologyLevel', baseTL);
                    updateDraft('metaLevel', baseML);
                    setBastionNotice(`Applied highest combined setting tiers: TL${baseTL} / ML${baseML}`);
                  }}
                  className="mt-2.5 w-full py-1.5 px-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/40 rounded text-[11px] font-bold transition-all cursor-pointer text-center"
                >
                  Apply Highest Base (TL{baseTL} / ML{baseML})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-1">
          {/* Column 1: Technology Level */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-cyan-900/50 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  Technology Level (TL 0–5)
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {speciesTL !== null && (
                  <button
                    type="button"
                    onClick={() => updateDraft('technologyLevel', speciesTL)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currentTL === speciesTL ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800'
                    }`}
                    title={`Set TL from Species: TL${speciesTL}`}
                  >
                    Species TL{speciesTL}
                  </button>
                )}
                {factionTL !== null && (
                  <button
                    type="button"
                    onClick={() => updateDraft('technologyLevel', factionTL)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currentTL === factionTL ? 'bg-purple-500 text-slate-950 shadow' : 'bg-slate-800 hover:bg-purple-900/60 text-purple-300 border border-purple-800'
                    }`}
                    title={`Set TL from Faction: TL${factionTL}`}
                  >
                    Faction TL{factionTL}
                  </button>
                )}
                <span className={`text-xs font-mono font-bold ${tlDelta > 0 ? 'text-amber-400' : tlDelta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {tlDelta > 0 ? `-${tlDelta} CP` : tlDelta < 0 ? `+${Math.abs(tlDelta)} CP` : '0 CP'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {tlOptions.map(tl => {
                const isSelected = currentTL === tl.level;
                const isBase = baseTL === tl.level;
                return (
                  <div
                    key={tl.level}
                    onClick={() => updateDraft('technologyLevel', tl.level)}
                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {tl.label}
                        </span>
                        {isBase && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-500/40">
                            Pillar Base
                          </span>
                        )}
                        {isSelected && currentTL > baseTL && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            +{currentTL - baseTL} Upgraded
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{tl.desc}</div>
                    </div>
                    <div className={`font-mono text-xs font-bold shrink-0 ml-3 ${tl.cost > 0 ? 'text-amber-400' : tl.cost < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {tl.cost > 0 ? `-${tl.cost} CP` : tl.cost < 0 ? `+${Math.abs(tl.cost)} CP` : '0 CP'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Meta Level */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-purple-900/50 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔮</span>
                <h4 className="font-bold text-sm uppercase tracking-wider text-purple-300">
                  Meta Level (ML 0–5)
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {speciesML !== null && (
                  <button
                    type="button"
                    onClick={() => updateDraft('metaLevel', speciesML)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currentML === speciesML ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800'
                    }`}
                    title={`Set ML from Species: ML${speciesML}`}
                  >
                    Species ML{speciesML}
                  </button>
                )}
                {factionML !== null && (
                  <button
                    type="button"
                    onClick={() => updateDraft('metaLevel', factionML)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currentML === factionML ? 'bg-purple-500 text-slate-950 shadow' : 'bg-slate-800 hover:bg-purple-900/60 text-purple-300 border border-purple-800'
                    }`}
                    title={`Set ML from Faction: ML${factionML}`}
                  >
                    Faction ML{factionML}
                  </button>
                )}
                <span className={`text-xs font-mono font-bold ${mlDelta > 0 ? 'text-amber-400' : mlDelta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {mlDelta > 0 ? `-${mlDelta} CP` : mlDelta < 0 ? `+${Math.abs(mlDelta)} CP` : '0 CP'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {mlOptions.map(ml => {
                const isSelected = currentML === ml.level;
                const isBase = baseML === ml.level;
                return (
                  <div
                    key={ml.level}
                    onClick={() => updateDraft('metaLevel', ml.level)}
                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                          {ml.label}
                        </span>
                        {isBase && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-500/40">
                            Pillar Base
                          </span>
                        )}
                        {isSelected && currentML > baseML && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            +{currentML - baseML} Upgraded
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{ml.desc}</div>
                    </div>
                    <div className={`font-mono text-xs font-bold shrink-0 ml-3 ${ml.cost > 0 ? 'text-amber-400' : ml.cost < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {ml.cost > 0 ? `-${ml.cost} CP` : ml.cost < 0 ? `+${Math.abs(ml.cost)} CP` : '0 CP'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTraitsAndFeatures = () => {
    const primaryOrigTraits = selectedOriginObj ? extractNameList(selectedOriginObj.traits || selectedOriginObj.trait) : [];
    const secondaryOrigTraits = selectedSecondaryOriginObj ? extractNameList(selectedSecondaryOriginObj.traits || selectedSecondaryOriginObj.trait) : [];
    const origTraits = Array.from(new Set([...primaryOrigTraits, ...secondaryOrigTraits]));
    const origMaxTraits = parseInt(selectedOriginObj?.bonus_traits || selectedOriginObj?.bonus_features || 2, 10);

    const facFeats = selectedFactionObj ? extractNameList(selectedFactionObj.features || selectedFactionObj.bonus_features || selectedFactionObj.benefits) : [];
    const facTraits = selectedFactionObj ? extractNameList(selectedFactionObj.traits || selectedFactionObj.trait) : [];
    const facMaxFeats = parseInt(selectedFactionObj?.bonus_features || (facFeats.length > 0 ? 1 : 0), 10);
    const facMaxTraits = parseInt(selectedFactionObj?.bonus_traits || (facTraits.length > 0 ? 1 : 0), 10);

    const commonOccTraitNames = COMMON_OCCUPATIONAL_TRAITS.map(t => t.name);
    const primaryOccTraits = selectedOccupationObj ? extractNameList(selectedOccupationObj.traits || selectedOccupationObj.trait) : [];
    const secondaryOccTraits = selectedSecondaryOccupationObj ? extractNameList(selectedSecondaryOccupationObj.traits || selectedSecondaryOccupationObj.trait) : [];
    const occTraits = Array.from(new Set([...primaryOccTraits, ...commonOccTraitNames, ...secondaryOccTraits]));
    const occMaxTraits = parseInt(selectedOccupationObj?.bonus_traits || selectedOccupationObj?.bonus_features || 2, 10);

    const specAttrs = selectedSpeciesObj?.bonus_attribute_points || selectedSpeciesObj?.bonus_attribute_choices || 0;
    const specFeats = selectedSpeciesObj ? extractNameList(selectedSpeciesObj.bonus_feature_choices || selectedSpeciesObj.recommended_features) : [];
    const specTraits = selectedSpeciesObj ? extractNameList(selectedSpeciesObj.bonus_trait_choices || selectedSpeciesObj.recommended_traits || selectedSpeciesObj.traits) : [];
    const specMaxTraits = parseInt(selectedSpeciesObj?.bonus_traits || (specTraits.length > 0 ? 1 : 0), 10);
    const specMaxFeats = parseInt(selectedSpeciesObj?.bonus_features || (specFeats.length > 0 ? 1 : 0), 10);

    const inherentSpeciesTraits = getInherentSpeciesTraits(selectedSpeciesObj);

    return (
      <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <Sparkles size={22} className="text-amber-400" />
              <span>Step 7: Traits &amp; Features Allocation</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Budget: <strong className={bpRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}>{bpRemaining} CP</strong>
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Establish your character's physiological traits, homeworld adaptations, organizational benefits, and acquired perks. Free traits are granted by background pillars; additional traits cost <strong className="text-cyan-300">1 CP each</strong> and features cost <strong className="text-purple-300">3 CP each</strong>.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* 1. Species Traits & Features (Inherent + Optional Pools) */}
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
              <div className="flex items-center gap-2">
                <Dna size={18} className="text-cyan-400" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  Species Lineage Traits: {draft['char-species'] || 'Selected Species'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Physiological Baseline
              </span>
            </div>

            {/* Inherent species traits summary badges */}
            {inherentSpeciesTraits.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-500/30 space-y-1.5">
                <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>🧬 Inherent Biological Traits (Granted Free):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inherentSpeciesTraits.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 font-mono"
                      title={t.description || ''}
                    >
                      {t.name || t.title || t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {specAttrs > 0 && (
              <AttributePoolPulldown
                title="Species Bonus Attribute Points"
                maxPoints={parseInt(specAttrs, 10)}
                allocatedAttrs={draft.speciesAllocations?.attributes || {}}
                onAllocate={(attrId, delta) => allocateSpeciesAttribute(attrId, delta, parseInt(specAttrs, 10))}
                allowedOptions={selectedSpeciesObj?.bonus_attribute_options}
                colorTheme="cyan"
              />
            )}

            {(specTraits.length > 0 || specMaxTraits > 0) && (
              <TraitMultiselectPulldown
                title="Species Trait Choices"
                categoryLabel="Species Trait"
                maxSelectable={specMaxTraits || 1}
                selectedTraits={draft.speciesAllocations?.traits || []}
                recommendedTraits={specTraits}
                allTraits={dbData.traits}
                onToggleTrait={(tName, tObj) => togglePoolTrait('speciesAllocations', tName, tObj, specMaxTraits || 1)}
                onRemoveTrait={(tName) => removePoolTrait('speciesAllocations', tName)}
                colorTheme="cyan"
              />
            )}

            {(specFeats.length > 0 && specMaxFeats > 0) && (
              <FeatureMultiselectPulldown
                title="Species Feature Choices"
                categoryLabel="Species Feature"
                maxSelectable={specMaxFeats}
                selectedFeatures={draft.speciesAllocations?.features || []}
                recommendedFeatures={specFeats}
                allFeatures={dbData.features}
                onToggleFeature={(fName, fObj) => togglePoolFeature('speciesAllocations', fName, fObj, specMaxFeats)}
                onRemoveFeature={(fName) => removePoolFeature('speciesAllocations', fName)}
                colorTheme="cyan"
              />
            )}
          </div>

          {/* 2. Origin Homeworld Traits */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-2">
              <BookOpen size={18} className="text-emerald-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300">
                Origin Homeworld Traits: {draft['char-origin'] || 'General Origin'}
              </h4>
            </div>

            {origMaxTraits > 0 && (
              <TraitMultiselectPulldown
                title="Origin Homeworld Traits Pool"
                categoryLabel="Origin Trait"
                maxSelectable={origMaxTraits}
                selectedTraits={draft.originAllocations?.traits || []}
                recommendedTraits={origTraits}
                allTraits={dbData.traits}
                onToggleTrait={(tName, tObj) => togglePoolTrait('originAllocations', tName, tObj, origMaxTraits)}
                onRemoveTrait={(tName) => removePoolTrait('originAllocations', tName)}
                colorTheme="emerald"
                allowExtraWithCpCost={true}
                extraCpCost={1}
                subtitle="2 Free Traits • +1 CP each for additional"
              />
            )}
          </div>

          {/* 3. Faction Allegiance Benefits & Traits */}
          <div className="p-4 rounded-xl border border-purple-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2">
              <Shield size={18} className="text-purple-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-purple-300">
                Faction Allegiance Benefits &amp; Traits: {draft['char-faction'] || 'General Faction'}
              </h4>
            </div>

            {(facFeats.length > 0 && facMaxFeats > 0) && (
              <FeatureMultiselectPulldown
                title="Faction Features & Benefits Pool"
                categoryLabel="Faction Feature"
                maxSelectable={facMaxFeats}
                selectedFeatures={draft.factionAllocations?.features || []}
                recommendedFeatures={facFeats}
                allFeatures={dbData.features}
                onToggleFeature={(fName, fObj) => togglePoolFeature('factionAllocations', fName, fObj, facMaxFeats)}
                onRemoveFeature={(fName) => removePoolFeature('factionAllocations', fName)}
                colorTheme="purple"
              />
            )}

            {facMaxTraits > 0 && (
              <TraitMultiselectPulldown
                title="Faction Traits Pool"
                categoryLabel="Faction Trait"
                maxSelectable={facMaxTraits}
                selectedTraits={draft.factionAllocations?.traits || []}
                recommendedTraits={facTraits}
                allTraits={dbData.traits}
                onToggleTrait={(tName, tObj) => togglePoolTrait('factionAllocations', tName, tObj, facMaxTraits)}
                onRemoveTrait={(tName) => removePoolTrait('factionAllocations', tName)}
                colorTheme="purple"
              />
            )}
          </div>

          {/* 4. Occupation Career Traits */}
          <div className="p-4 rounded-xl border border-sky-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-sky-900/40 pb-2">
              <Briefcase size={18} className="text-sky-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-sky-300">
                Occupation Career Traits: {draft['char-occu'] || 'General Occupation'}
              </h4>
            </div>

            <TraitMultiselectPulldown
              title={`Occupation Career Traits Pool${draft['char-secondary-occu'] ? ' (Combined with Background)' : ''}`}
              categoryLabel="Occupational Trait"
              maxSelectable={occMaxTraits}
              selectedTraits={draft.occuAllocations?.traits || []}
              recommendedTraits={occTraits}
              allTraits={dbData.traits}
              onToggleTrait={(tName, tObj) => togglePoolTrait('occuAllocations', tName, tObj, occMaxTraits)}
              onRemoveTrait={(tName) => removePoolTrait('occuAllocations', tName)}
              colorTheme="sky"
            />
          </div>

          {/* 5. General Point Buy Traits & Features */}
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/60 space-y-3">
            <div className="flex justify-between items-center border-b border-cyan-900/40 pb-2">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-cyan-400" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  General Point Buy (Open CP Budget)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {bpRemaining} CP Remaining
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TraitMultiselectPulldown
                title="Additional Traits (1 CP / Trait)"
                categoryLabel="General Trait"
                maxSelectable={99}
                selectedTraits={draft.generalAllocations?.traits || []}
                recommendedTraits={[]}
                allTraits={dbData.traits}
                onToggleTrait={(tName, tObj) => togglePoolTrait('generalAllocations', tName, tObj, 99, true)}
                onRemoveTrait={(tName) => removePoolTrait('generalAllocations', tName)}
                colorTheme="cyan"
              />

              <FeatureMultiselectPulldown
                title="Additional Features & Perks (3 CP each)"
                categoryLabel="General Feature"
                maxSelectable={99}
                selectedFeatures={draft.generalAllocations?.features || []}
                recommendedFeatures={[]}
                allFeatures={dbData.features}
                onToggleFeature={(fName, fObj) => togglePoolFeature('generalAllocations', fName, fObj, 99, true)}
                onRemoveFeature={(fName) => removePoolFeature('generalAllocations', fName)}
                colorTheme="cyan"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const primaryOrigSkills = selectedOriginObj ? extractNameList(selectedOriginObj.society_skills) : [];
    const secondaryOrigSkills = selectedSecondaryOriginObj ? extractNameList(selectedSecondaryOriginObj.society_skills) : [];
    const origSkills = Array.from(new Set([...primaryOrigSkills, ...secondaryOrigSkills]));
    const origSP = parseInt(selectedOriginObj?.skill_points ?? (origSkills.length > 0 ? 20 : 0), 10);

    const facSkills = selectedFactionObj ? extractNameList(selectedFactionObj.skill_package || selectedFactionObj.skills) : [];
    const facSP = parseInt(selectedFactionObj?.skill_points || (facSkills.length > 0 ? 20 : 0), 10);

    const occSkills = selectedOccupationObj ? extractNameList(selectedOccupationObj.professional_skills || selectedOccupationObj.skills) : [];
    const occuSP = parseInt(selectedOccupationObj?.skill_points ?? (occSkills.length > 0 ? 20 : 0), 10);

    const specSkills = selectedSpeciesObj ? extractNameList(selectedSpeciesObj.bonus_skill_choices) : [];
    const specSP = parseInt(selectedSpeciesObj?.bonus_skills || selectedSpeciesObj?.bonus_skill_points || 0, 10);

    // Track SP spent in each pool
    const origSpent = Object.values(draft.originAllocations?.skills || {}).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
    const facSpent = Object.values(draft.factionAllocations?.skills || {}).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
    const occSpent = Object.values(draft.occuAllocations?.skills || {}).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
    const generalSkillRanks = Object.values(draft.generalAllocations?.skills || {}).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
    const foundationSpent = origSpent + facSpent + occSpent;

    return (
      <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <Target size={22} className="text-cyan-400" />
              <span>Step 8: Skill Proficiencies &amp; Foundation Packages</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Foundation SP: <strong className={foundationSpent >= 60 ? 'text-emerald-400' : 'text-amber-400'}>{foundationSpent} / 60 SP</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                CP Budget: <strong className={bpRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}>{bpRemaining} CP</strong>
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Allocate your canonical 60 SP foundation across society, faction, and professional packages. Maximum rank at creation is Rank 11 (Rank 6 recommended for starting balance). Additional ranks beyond background pools cost <strong className="text-cyan-300">1 CP per rank</strong>.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* BASTION Foundation Co-Pilot Banner */}
          <div className="p-3.5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-sky-950/60 border border-cyan-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Bot size={20} className="text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  BASTION Foundation Co-Pilot (60 SP Foundation)
                </span>
                <span className="text-[10px] text-slate-400">
                  Auto-distribute canonical 20 Origin SP, 20 Faction SP, and 20 Occupation SP across your primary packages.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeFoundation}
              className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Zap size={14} />
              <span>Auto-Distribute Foundation (60 SP)</span>
            </button>
          </div>

          {/* Foundation Progress Meter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-emerald-500/30">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Origin Society SP</div>
              <div className="text-sm font-black font-mono text-white mt-0.5">{origSpent} / {origSP || 20} SP</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (origSpent / (origSP || 20)) * 100)}%` }} />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/30">
              <div className="text-[10px] uppercase font-bold text-purple-400">Faction Package SP</div>
              <div className="text-sm font-black font-mono text-white mt-0.5">{facSpent} / {facSP || 20} SP</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (facSpent / (facSP || 20)) * 100)}%` }} />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-sky-500/30">
              <div className="text-[10px] uppercase font-bold text-sky-400">Professional SP</div>
              <div className="text-sm font-black font-mono text-white mt-0.5">{occSpent} / {occuSP || 20} SP</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (occSpent / (occuSP || 20)) * 100)}%` }} />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/30">
              <div className="text-[10px] uppercase font-bold text-cyan-400">Total Foundation SP</div>
              <div className="text-sm font-black font-mono text-white mt-0.5">{foundationSpent} / 60 SP</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (foundationSpent / 60) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Species Skill Pool if present */}
          {specSkills.length > 0 && specSP > 0 && (
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-2">
                <Dna size={18} className="text-cyan-400" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  Species Skill Pool: {draft['char-species'] || 'Selected Species'}
                </h4>
              </div>
              <SkillPoolRankPulldown
                title="Species Skill Pool"
                categoryLabel="Species Skill"
                maxSP={specSP}
                allocatedSkills={draft.speciesAllocations?.skills || {}}
                recommendedSkills={specSkills}
                allSkills={dbData.skills}
                onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('speciesAllocations', sName, newRank, delta, specSP)}
                onRemoveSkill={(sName) => updatePoolSkillRank('speciesAllocations', sName, 0, 0, specSP)}
                colorTheme="cyan"
              />
            </div>
          )}

          {/* Origin Society Skills */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-2">
              <BookOpen size={18} className="text-emerald-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300">
                Origin Homeworld Skills: {draft['char-origin'] || 'General Origin'} (20 SP)
              </h4>
            </div>
            <SkillPoolRankPulldown
              title="Society Skill Point Pool"
              categoryLabel="Society Skill"
              maxSP={origSP || 20}
              allocatedSkills={draft.originAllocations?.skills || {}}
              recommendedSkills={origSkills}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('originAllocations', sName, newRank, delta, origSP || 20)}
              onRemoveSkill={(sName) => updatePoolSkillRank('originAllocations', sName, 0, 0, origSP || 20)}
              colorTheme="emerald"
            />
          </div>

          {/* Faction Skill Package */}
          <div className="p-4 rounded-xl border border-purple-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2">
              <Shield size={18} className="text-purple-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-purple-300">
                Faction Allegiance Skills: {draft['char-faction'] || 'General Faction'} (20 SP)
              </h4>
            </div>
            <SkillPoolRankPulldown
              title="Faction Skill Package Pool"
              categoryLabel="Faction Skill"
              maxSP={facSP || 20}
              allocatedSkills={draft.factionAllocations?.skills || {}}
              recommendedSkills={facSkills}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('factionAllocations', sName, newRank, delta, facSP || 20)}
              onRemoveSkill={(sName) => updatePoolSkillRank('factionAllocations', sName, 0, 0, facSP || 20)}
              colorTheme="purple"
            />
          </div>

          {/* Occupation Professional Skills */}
          <div className="p-4 rounded-xl border border-sky-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-sky-900/40 pb-2">
              <Briefcase size={18} className="text-sky-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-sky-300">
                Occupation Career Skills: {draft['char-occu'] || 'General Occupation'} (20 SP)
              </h4>
            </div>
            <SkillPoolRankPulldown
              title="Professional Skill Package Pool"
              subtitle="Max Rank 11 • Recommended: Rank 6"
              categoryLabel="Professional Skill"
              maxSP={occuSP || 20}
              allocatedSkills={draft.occuAllocations?.skills || {}}
              recommendedSkills={occSkills}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('occuAllocations', sName, newRank, delta, occuSP || 20)}
              onRemoveSkill={(sName) => updatePoolSkillRank('occuAllocations', sName, 0, 0, occuSP || 20)}
              colorTheme="sky"
            />
          </div>

          {/* General Point Buy Skills */}
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/60 space-y-3">
            <div className="flex justify-between items-center border-b border-cyan-900/40 pb-2">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-cyan-400" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  Additional Skill Ranks (Point Buy: 1 CP / Rank)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {bpRemaining} CP Remaining • {generalSkillRanks} Ranks Purchased
              </span>
            </div>
            <SkillPoolRankPulldown
              title="Additional Skill Ranks (1 CP / Rank)"
              categoryLabel="General Skill"
              maxSP={Math.max(0, bpRemaining + generalSkillRanks)}
              allocatedSkills={draft.generalAllocations?.skills || {}}
              recommendedSkills={[]}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('generalAllocations', sName, newRank, delta, 999, true)}
              onRemoveSkill={(sName) => updatePoolSkillRank('generalAllocations', sName, 0, 0, 999, true)}
              colorTheme="cyan"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderProperty = () => {
    const weaponsList = Array.isArray(draft.weapons) ? draft.weapons : [];
    const armorList = Array.isArray(draft.armor) ? draft.armor : [];
    const gearList = Array.isArray(draft.gear) ? draft.gear : [];
    const mechaList = Array.isArray(draft.mecha) ? draft.mecha : [];
    const architectureList = Array.isArray(draft.architecture) ? draft.architecture : [];
    const otherList = Array.isArray(draft.other) ? draft.other : [];

    // Calculate Carried Weight (Weapons, Armor, Gear, Other)
    const carriedWeight = Math.round((sumPropertyWeight(weaponsList) + sumPropertyWeight(armorList) + sumPropertyWeight(gearList) + sumPropertyWeight(otherList)) * 10) / 10;
    const strScore = parseInt(draft.strength || 0, 10);
    const sizeKey = selectedSpeciesObj?.size || selectedSpeciesObj?.size_category || 'Medium';
    const baseMaxCapacity = (Math.max(0, strScore) + 2) * 50; // 100 lbs base at STR 0
    const maxCapacity = scaleCarryingCapacity(baseMaxCapacity, sizeKey);
    const lightCapacity = Math.round(maxCapacity * 0.5);
    const loadPercent = Math.min(100, Math.round((carriedWeight / Math.max(1, maxCapacity)) * 100));
    const isOverburdened = carriedWeight > maxCapacity;
    const isEncumbered = carriedWeight > lightCapacity && !isOverburdened;

    // Total Inventory Value in Credits
    const calculateTotalCost = (list) => (list || []).reduce((acc, item) => acc + ((parseInt(item.cost || item.price || 0, 10)) * (parseInt(item.qty || item.quantity || 1, 10))), 0);
    const totalInventoryValue = calculateTotalCost(weaponsList) + calculateTotalCost(armorList) + calculateTotalCost(gearList) + calculateTotalCost(mechaList) + calculateTotalCost(architectureList) + calculateTotalCost(otherList);
    const totalItemCount = weaponsList.length + armorList.length + gearList.length + mechaList.length + architectureList.length + otherList.length;

    // Catalog items based on active category
    let catalogItems = [];
    if (propertyCategoryFilter === 'all' || propertyCategoryFilter === 'weapons') {
      catalogItems = catalogItems.concat((dbData.weapons || []).map(w => ({ ...w, propertyCategory: 'weapons' })));
    }
    if (propertyCategoryFilter === 'all' || propertyCategoryFilter === 'armor') {
      catalogItems = catalogItems.concat((dbData.armor || []).map(a => ({ ...a, propertyCategory: 'armor' })));
    }
    if (propertyCategoryFilter === 'all' || propertyCategoryFilter === 'gear') {
      catalogItems = catalogItems.concat((dbData.gear || []).map(g => ({ ...g, propertyCategory: 'gear' })));
    }
    if (propertyCategoryFilter === 'all' || propertyCategoryFilter === 'mecha') {
      catalogItems = catalogItems.concat((dbData.mecha || []).map(m => ({ ...m, propertyCategory: 'mecha' })));
    }
    if (propertyCategoryFilter === 'all' || propertyCategoryFilter === 'architecture') {
      catalogItems = catalogItems.concat((dbData.architecture || []).map(arc => ({ ...arc, propertyCategory: 'architecture' })));
    }

    if (propertySearchQuery.trim()) {
      const q = propertySearchQuery.toLowerCase().trim();
      catalogItems = catalogItems.filter(item => {
        const name = (item.name || item.id || '').toLowerCase();
        const desc = (item.description || item.notes || item.mechanics || '').toLowerCase();
        const type = (item.type || item.category || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || type.includes(q);
      });
    }

    // Category Tabs Configuration
    const categoryTabs = [
      { id: 'all', label: 'All Items', count: totalItemCount },
      { id: 'weapons', label: 'Weaponry', icon: '⚔️', count: weaponsList.length },
      { id: 'armor', label: 'Armoring', icon: '🛡️', count: armorList.length },
      { id: 'gear', label: 'Gear', icon: '🎒', count: gearList.length },
      { id: 'mecha', label: 'Mech', icon: '🤖', count: mechaList.length },
      { id: 'architecture', label: 'Architecture', icon: '🏛️', count: architectureList.length },
      { id: 'other', label: 'Other', icon: '📦', count: otherList.length }
    ];

    // Manifest categories to show in the right column
    const manifestCategoriesToShow = propertyCategoryFilter === 'all' 
      ? [
          { key: 'weapons', label: 'Weaponry', icon: '⚔️', list: weaponsList, color: 'text-amber-400' },
          { key: 'armor', label: 'Armoring', icon: '🛡️', list: armorList, color: 'text-emerald-400' },
          { key: 'gear', label: 'Gear', icon: '🎒', list: gearList, color: 'text-cyan-400' },
          { key: 'mecha', label: 'Mech & Vehicles', icon: '🤖', list: mechaList, color: 'text-purple-400' },
          { key: 'architecture', label: 'Architecture & Bases', icon: '🏛️', list: architectureList, color: 'text-blue-400' },
          { key: 'other', label: 'Other Assets', icon: '📦', list: otherList, color: 'text-slate-400' }
        ]
      : [
          {
            key: propertyCategoryFilter,
            label: categoryTabs.find(t => t.id === propertyCategoryFilter)?.label || 'Items',
            icon: categoryTabs.find(t => t.id === propertyCategoryFilter)?.icon || '📦',
            list: Array.isArray(draft[propertyCategoryFilter]) ? draft[propertyCategoryFilter] : [],
            color: 'text-cyan-400'
          }
        ];

    return (
      <div className="space-y-5 max-w-5xl mx-auto h-full flex flex-col">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <Package size={22} className="text-amber-400" />
              <span>Step 9: Property &amp; Equipment Manifest</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddStarterKit}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Add a standard survival kit: Laser Pistol, Mesh Vest, Commlink, Medkit, Omni-Tool, Rations"
              >
                <Zap size={13} />
                <span>Equip Standard Field Kit</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustomProperty(prev => !prev)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>{isAddingCustomProperty ? 'Close Custom Form' : '+ Custom Item'}</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Outfit your persona with weaponry, personal armoring, tactical field gear, mecha, architecture, and other assets. Monitor carrying capacity to avoid encumbrance penalties.
          </p>

          {/* Carrying Capacity & Encumbrance Meter */}
          <div className="mt-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <Scale size={16} className={isOverburdened ? 'text-red-400' : isEncumbered ? 'text-amber-400' : 'text-emerald-400'} />
                <span className="text-slate-300 font-bold">Carried Load:</span>
                <span className="font-bold text-white">{carriedWeight} lbs</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{maxCapacity} lbs Max</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">(Light Load &le; {lightCapacity} lbs)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border font-mono ${
                  isOverburdened
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : isEncumbered
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                }`}>
                  {isOverburdened ? '⚠️ OVERBURDENED' : isEncumbered ? '⚡ ENCUMBERED' : '✅ LIGHT LOAD'}
                </span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  Value: {totalInventoryValue.toLocaleString()} Cr
                </span>
              </div>
            </div>

            {/* Load bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverburdened ? 'bg-red-500' : isEncumbered ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, loadPercent)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              {isOverburdened
                ? 'Overburdened: Persona cannot run; combat speed halved; disadvantage on Agility checks.'
                : isEncumbered
                  ? 'Encumbered: Movement speed reduced by 5 ft/rnd; mild athletic penalties.'
                  : 'Unimpeded: Persona carries gear with maximum agility and normal tactical movement speed.'}
            </div>
          </div>
        </div>

        {/* Custom Item Form Modal / Drawer */}
        {isAddingCustomProperty && (
          <div className="p-4 bg-slate-900 border border-cyan-500/50 rounded-xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                <Plus size={14} /> Create Custom Property Item
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCustomProperty(false)}
                className="text-slate-400 hover:text-white text-xs"
              >✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={customPropertyForm.name}
                  onChange={e => setCustomPropertyForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Heavy Gauss Rifle, Grav Skiff"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={customPropertyForm.category}
                  onChange={e => setCustomPropertyForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="weapons">Weaponry (weapons)</option>
                  <option value="armor">Armoring (armor)</option>
                  <option value="gear">Field Gear (gear)</option>
                  <option value="mecha">Mech / Vehicle (mecha)</option>
                  <option value="architecture">Architecture (architecture)</option>
                  <option value="other">Other Property (other)</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={customPropertyForm.qty}
                    onChange={e => setCustomPropertyForm(p => ({ ...p, qty: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white outline-none focus:border-cyan-500 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Wt (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customPropertyForm.weight}
                    onChange={e => setCustomPropertyForm(p => ({ ...p, weight: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white outline-none focus:border-cyan-500 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Cost (Cr)</label>
                  <input
                    type="number"
                    min="0"
                    value={customPropertyForm.cost}
                    onChange={e => setCustomPropertyForm(p => ({ ...p, cost: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white outline-none focus:border-cyan-500 text-center font-mono"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Notes / Description / Damage / AV</label>
              <input
                type="text"
                value={customPropertyForm.notes}
                onChange={e => setCustomPropertyForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. Damage 3d6 Kinetic, AV 4, Thermal optic, Range 200 ft"
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white outline-none focus:border-cyan-500 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCustomProperty(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomPropertyItem}
                className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all cursor-pointer shadow"
              >
                Add Custom Item to Manifest
              </button>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
          {categoryTabs.map(tab => {
            const isActive = propertyCategoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPropertyCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Two-Column Browser & Manifest View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Left Column: Catalog Browser */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                <Search size={14} /> Catalog Browser ({catalogItems.length})
              </span>
              <div className="relative w-48">
                <input
                  type="text"
                  value={propertySearchQuery}
                  onChange={e => setPropertySearchQuery(e.target.value)}
                  placeholder="Search catalog..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
                <Search size={12} className="absolute left-2 top-2 text-slate-500" />
                {propertySearchQuery && (
                  <button
                    onClick={() => setPropertySearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs"
                  >✕</button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {catalogItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  No catalog items found matching "{propertySearchQuery}". Try another category or add a custom item.
                </div>
              ) : (
                catalogItems.map((item, idx) => {
                  const cat = item.propertyCategory || 'gear';
                  const catKey = cat === 'weaponry' ? 'weapons' : cat === 'armoring' ? 'armor' : cat === 'mech' ? 'mecha' : cat;
                  const equippedList = Array.isArray(draft[catKey]) ? draft[catKey] : [];
                  const existingItem = equippedList.find(e => {
                    const eName = typeof e === 'object' ? (e.name || e.id) : String(e);
                    const iName = typeof item === 'object' ? (item.name || item.id) : String(item);
                    return eName.toLowerCase() === iName.toLowerCase();
                  });
                  const isEquipped = Boolean(existingItem);
                  const equippedQty = existingItem ? (parseInt(existingItem.qty || existingItem.quantity || 1, 10)) : 0;

                  return (
                    <div
                      key={item.id || `${item.name}-${idx}`}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-slate-700 flex flex-col justify-between gap-1.5 transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{item.name || item.id}</span>
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1 rounded border border-cyan-800">
                              TL{item.tl || item.tech_level || 3}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-amber-300 text-xs block">
                            {(parseInt(item.cost || item.price || 0, 10)).toLocaleString()} Cr
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            {parseFloat(item.weight || item.wt || 0) || 0} lbs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                        <div className="flex items-center gap-2 text-slate-400">
                          {item.damage && (
                            <span className="text-red-400 font-mono font-semibold">⚔️ {item.damage}</span>
                          )}
                          {(item.armor || item.armor_value) && (
                            <span className="text-emerald-400 font-mono font-semibold">🛡️ {item.armor || item.armor_value}</span>
                          )}
                          {item.type && (
                            <span className="text-slate-500 uppercase">{item.type}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddPropertyItem(cat, item)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isEquipped
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900'
                              : 'bg-slate-800 hover:bg-cyan-600 text-white'
                          }`}
                        >
                          <Plus size={11} />
                          <span>{isEquipped ? `Add Another (${equippedQty})` : 'Equip'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Persona Manifest */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Briefcase size={14} /> Persona Manifest ({totalItemCount} Assets)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Total Mass: <strong className="text-white">{carriedWeight} lbs</strong>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {totalItemCount === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center h-full space-y-2">
                  <Package size={28} className="text-slate-600" />
                  <p>Your property manifest is currently empty.</p>
                  <p className="text-[11px] text-slate-600">Select items from the catalog or click "Equip Standard Field Kit" above.</p>
                </div>
              ) : (
                manifestCategoriesToShow.map(catGroup => {
                  if (catGroup.list.length === 0) return null;
                  return (
                    <div key={catGroup.key} className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-b border-slate-800/80 pb-1">
                        <span>{catGroup.icon}</span>
                        <span>{catGroup.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({catGroup.list.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {catGroup.list.map((item, idx) => {
                          const itemName = typeof item === 'object' ? (item.name || item.id || 'Item') : String(item);
                          const qty = parseInt(item.qty || item.quantity || 1, 10) || 1;
                          const wt = parseFloat(item.weight || item.wt || 0) || 0;
                          const cost = parseInt(item.cost || item.price || 0, 10) || 0;
                          const totalWt = Math.round(wt * qty * 10) / 10;
                          const totalCost = cost * qty;

                          return (
                            <div
                              key={item.id || `${catGroup.key}-${idx}`}
                              className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                                  <span>{itemName}</span>
                                  {item.tl !== undefined && (
                                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1 rounded">
                                      TL{item.tl}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                                  <span>{totalWt} lbs</span>
                                  {qty > 1 && <span className="text-slate-500">({wt} ea)</span>}
                                  <span>•</span>
                                  <span className="text-amber-300 font-semibold">{totalCost.toLocaleString()} Cr</span>
                                  {item.damage && <span className="text-red-400">⚔️ {item.damage}</span>}
                                  {(item.armor || item.armor_value) && <span className="text-emerald-400">🛡️ {item.armor || item.armor_value}</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Quantity controls */}
                                <div className="flex items-center bg-slate-900 rounded border border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePropertyQty(catGroup.key, idx, -1)}
                                    className="px-1.5 py-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    title="Decrease Quantity"
                                  >
                                    <Minus size={11} />
                                  </button>
                                  <span className="px-1 text-[11px] font-mono font-bold text-cyan-300 min-w-5 text-center">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePropertyQty(catGroup.key, idx, 1)}
                                    className="px-1.5 py-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    title="Increase Quantity"
                                  >
                                    <Plus size={11} />
                                  </button>
                                </div>

                                {/* Delete item */}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePropertyItem(catGroup.key, idx)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Remove Item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = () => {
    // Combine all skills for summary display
    const summarySkills = {};
    const skillSources = {};
    const countSkills = (pool, sourceLabel) => {
      Object.entries(pool?.skills || {}).forEach(([n, r]) => {
        const val = parseInt(r, 10) || 0;
        if (val > 0) {
          summarySkills[n] = (summarySkills[n] || 0) + val;
          if (!skillSources[n]) skillSources[n] = [];
          if (sourceLabel && !skillSources[n].includes(sourceLabel)) {
            skillSources[n].push(sourceLabel);
          }
        }
      });
    };
    countSkills(draft.speciesAllocations, 'Species');
    countSkills(draft.originAllocations, 'Origin');
    countSkills(draft.factionAllocations, 'Faction');
    countSkills(draft.occuAllocations, 'Occupation');
    countSkills(draft.generalAllocations, 'Point Buy');

    const allTrainedSkillsList = Object.entries(summarySkills)
      .filter(([_, rank]) => rank > 0)
      .map(([name, rank], idx) => ({
        id: `summary_skill_${idx}_${name}`,
        name,
        rank,
        source: (skillSources[name] || []).join(', ')
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Combine all traits
    const summaryTraits = new Set();
    draft.speciesAllocations?.traits?.forEach(t => summaryTraits.add(t));
    draft.originAllocations?.traits?.forEach(t => summaryTraits.add(t));
    draft.factionAllocations?.traits?.forEach(t => summaryTraits.add(t));
    draft.occuAllocations?.traits?.forEach(t => summaryTraits.add(t));
    draft.generalAllocations?.traits?.forEach(t => summaryTraits.add(t));

    // Combine all features
    const summaryFeatures = new Set();
    draft.speciesAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.originAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.factionAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.occuAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.generalAllocations?.features?.forEach(f => summaryFeatures.add(f));

    return (
      <div className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
        <div className="text-center">
          <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-widest">Initialization Matrix Complete</h3>
          <p className="text-slate-400 mt-1 text-sm">Review your persona parameters before deploying to the Persona Folio.</p>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl space-y-5 shadow-xl flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Persona Name</span>
              <span className="text-lg font-bold text-white">{draft['char-name'] || 'Unnamed Persona'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Concept</span>
              <span className="text-sm text-slate-300">{draft['char-concept'] || '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Archetype</span>
              <span className="font-bold text-emerald-400">{draft['char-archetype'] || 'Custom'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Species</span>
              <span className="font-bold text-cyan-300">{draft['char-species'] || 'None'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Origin</span>
              <span className="font-bold text-amber-300 block">{draft['char-origin'] || 'None'}</span>
              {draft['char-secondary-origin'] && (
                <span className="text-[10px] text-amber-400 font-mono block">
                  + {draft['char-secondary-origin']}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Occupation</span>
              <span className="font-bold text-purple-400 block">{draft['char-occu'] || 'None'}</span>
              {draft['char-secondary-occu'] && (
                <span className="text-[10px] text-purple-300 font-mono block">
                  + {draft['char-secondary-occu']}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Faction</span>
              <span className="font-bold text-blue-300 block">{draft['char-faction'] || 'Independent'}</span>
            </div>
          </div>

          {/* Setting Tiers (Tech Level & Meta Level) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-800 pb-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Tech Level (TL)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-cyan-400 text-base">TL{draft.technologyLevel ?? 3}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (Base {draft.baseTechLevel ?? pillarSettingLevels.baseTechLevel ?? 3}
                  {(draft.technologyLevel ?? 3) > (draft.baseTechLevel ?? pillarSettingLevels.baseTechLevel ?? 3) ? ` +${(draft.technologyLevel ?? 3) - (draft.baseTechLevel ?? pillarSettingLevels.baseTechLevel ?? 3)} Upgraded` : ''})
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Meta Level (ML)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-purple-400 text-base">ML{draft.metaLevel ?? 3}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (Base {draft.baseMetaLevel ?? pillarSettingLevels.baseMetaLevel ?? 3}
                  {(draft.metaLevel ?? 3) > (draft.baseMetaLevel ?? pillarSettingLevels.baseMetaLevel ?? 3) ? ` +${(draft.metaLevel ?? 3) - (draft.baseMetaLevel ?? pillarSettingLevels.baseMetaLevel ?? 3)} Upgraded` : ''})
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Tier CP Impact</span>
              <div className="font-mono font-bold text-xs mt-1">
                {(() => {
                  const tlCost = ((draft.technologyLevel ?? 3) - 3) * 10;
                  const mlCost = ((draft.metaLevel ?? 3) - 3) * 10;
                  const total = tlCost + mlCost;
                  if (total === 0) return <span className="text-slate-400">0 CP (Standard Baseline)</span>;
                  if (total < 0) return <span className="text-emerald-400">+{Math.abs(total)} CP Awarded</span>;
                  return <span className="text-amber-400">{total} CP Cost</span>;
                })()}
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block uppercase mb-2">Allocated Core Stats</span>
            <div className="grid grid-cols-6 gap-2 text-center">
              {['Strength', 'Agility', 'Stamina', 'Intellect', 'Wisdom', 'Charisma'].map(stat => (
                <div key={stat} className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">{stat.slice(0, 3)}</span>
                  <span className="font-bold font-mono text-cyan-400">
                    +{draft[stat.toLowerCase()] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* All Trained Skills Tag Cloud */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 block uppercase">All Trained Skills</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {allTrainedSkillsList.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No skills trained.</span>
              ) : (
                allTrainedSkillsList.map(s => (
                  <span key={s.id || s.name} className="text-xs bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300 flex items-center gap-1">
                    <span>{s.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1 rounded">R{s.rank}</span>
                    {s.source && <span className="text-[9px] text-slate-500 uppercase">({s.source})</span>}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* All Acquired Traits & Features Tag Cloud */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 block uppercase">Acquired Traits &amp; Features</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {summaryTraits.size === 0 && summaryFeatures.size === 0 ? (
                <span className="text-xs text-slate-500 italic">None selected.</span>
              ) : (
                <>
                  {Array.from(summaryTraits).map(tName => (
                    <span key={tName} className="text-xs bg-slate-950 border border-amber-500/40 px-2 py-0.5 rounded text-amber-200 flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-400" /> {tName}
                    </span>
                  ))}
                  {Array.from(summaryFeatures).map(fName => (
                    <span key={fName} className="text-xs bg-slate-950 border border-purple-500/40 px-2 py-0.5 rounded text-purple-200 flex items-center gap-1">
                      <Sparkles size={10} className="text-purple-400" /> {fName}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Selected Chassis Features */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 block uppercase">Selected Chassis Features</span>
            <div className="flex flex-wrap gap-1.5">
              {summaryFeatures.size === 0 ? (
                <span className="text-xs text-slate-500 italic">No features selected.</span>
              ) : (
                Array.from(summaryFeatures).map(fName => (
                  <span key={fName} className="text-xs bg-slate-900 border border-purple-500/40 px-2.5 py-1 rounded text-purple-200 flex items-center gap-1">
                    <Sparkles size={11} className="text-purple-400" /> {fName}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Property & Equipment Summary Card */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Package size={14} className="text-amber-400" />
                <span>Property &amp; Equipment Manifest</span>
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {(
                  (draft.weapons?.length || 0) +
                  (draft.armor?.length || 0) +
                  (draft.gear?.length || 0) +
                  (draft.mecha?.length || 0) +
                  (draft.architecture?.length || 0) +
                  (draft.other?.length || 0)
                )} Assets Equipped
              </span>
            </div>

            {((draft.weapons?.length || 0) + (draft.armor?.length || 0) + (draft.gear?.length || 0) + (draft.mecha?.length || 0) + (draft.architecture?.length || 0) + (draft.other?.length || 0)) === 0 ? (
              <span className="text-xs text-slate-500 italic block">No equipment or property items in manifest.</span>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(draft.weapons || []).map((w, idx) => (
                    <span key={w.id || idx} className="text-xs bg-slate-950 border border-amber-500/40 px-2 py-0.5 rounded text-amber-200 flex items-center gap-1">
                      <Sword size={10} className="text-amber-400" />
                      <span>{typeof w === 'object' ? (w.name || w.id) : w}</span>
                      {w.qty > 1 && <span className="text-[10px] text-slate-400 font-mono">x{w.qty}</span>}
                    </span>
                  ))}
                  {(draft.armor || []).map((a, idx) => (
                    <span key={a.id || idx} className="text-xs bg-slate-950 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-200 flex items-center gap-1">
                      <Shield size={10} className="text-emerald-400" />
                      <span>{typeof a === 'object' ? (a.name || a.id) : a}</span>
                      {a.qty > 1 && <span className="text-[10px] text-slate-400 font-mono">x{a.qty}</span>}
                    </span>
                  ))}
                  {(draft.gear || []).map((g, idx) => (
                    <span key={g.id || idx} className="text-xs bg-slate-950 border border-cyan-500/40 px-2 py-0.5 rounded text-cyan-200 flex items-center gap-1">
                      <Package size={10} className="text-cyan-400" />
                      <span>{typeof g === 'object' ? (g.name || g.id) : g}</span>
                      {g.qty > 1 && <span className="text-[10px] text-slate-400 font-mono">x{g.qty}</span>}
                    </span>
                  ))}
                  {(draft.mecha || []).map((m, idx) => (
                    <span key={m.id || idx} className="text-xs bg-slate-950 border border-purple-500/40 px-2 py-0.5 rounded text-purple-200 flex items-center gap-1">
                      <Bot size={10} className="text-purple-400" />
                      <span>{typeof m === 'object' ? (m.name || m.id) : m}</span>
                      {m.qty > 1 && <span className="text-[10px] text-slate-400 font-mono">x{m.qty}</span>}
                    </span>
                  ))}
                  {(draft.architecture || []).map((arc, idx) => (
                    <span key={arc.id || idx} className="text-xs bg-slate-950 border border-blue-500/40 px-2 py-0.5 rounded text-blue-200 flex items-center gap-1">
                      <Building2 size={10} className="text-blue-400" />
                      <span>{typeof arc === 'object' ? (arc.name || arc.id) : arc}</span>
                      {arc.qty > 1 && <span className="text-[10px] text-slate-400 font-mono">x{arc.qty}</span>}
                    </span>
                  ))}
                  {(draft.other || []).map((o, idx) => (
                    <span key={o.id || idx} className="text-xs bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-slate-300 flex items-center gap-1">
                      <Boxes size={10} className="text-slate-400" />
                      <span>{typeof o === 'object' ? (o.name || o.id) : o}</span>
                      {o.qty > 1 && <span className="text-[10px] text-slate-400 font-mono">x{o.qty}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget Display */}
          <div className="bg-slate-950 p-4 rounded-lg flex justify-between items-center border border-slate-800">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block">Remaining Character Points</span>
              <span className="text-[11px] text-slate-500">Starting Budget: 150 CP</span>
            </div>
            <span className={`text-2xl font-black font-mono ${bpRemaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {bpRemaining} CP
            </span>
          </div>
          
          {bpRemaining < 0 && (
            <div className="p-3 bg-red-950/30 border border-red-900 rounded text-red-400 text-xs font-bold text-center">
              ⚠️ Warning: Your build exceeds the 150 CP starting pool by {Math.abs(bpRemaining)} CP. You can still finalize and balance it manually in the Persona Folio.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep]?.id) {
      case 'concept': return renderConcept();
      case 'species': return renderSpecies();
      case 'origin': return renderOriginFaction();
      case 'occupation': return renderOccupation();
      case 'attributes': return renderAttributes();
      case 'tech': return renderTechLevel();
      case 'traits-features': return renderTraitsAndFeatures();
      case 'skills': return renderSkills();
      case 'property': return renderProperty();
      case 'review': return renderReview();
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-2 sm:p-4 md:p-6 pt-6 sm:pt-10 md:pt-12 pb-8 bg-black/80 backdrop-blur-md overflow-y-auto select-none font-sans">
      <div className="bg-[#0d1117] border border-cyan-500/30 rounded-xl shadow-2xl w-[96vw] max-w-7xl max-h-[96vh] sm:max-h-[96dvh] flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest flex items-center gap-2">
              <Shield size={20} className="text-cyan-400"/>
              Guided Creator
            </h2>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Budget</span>
              <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded border ${
                bpRemaining >= 0 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-950/30 border-red-500/30 text-red-400'
              }`}>
                {bpRemaining} CP
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <button
              type="button"
              onClick={() => {
                setCurrentStep(0);
                if (!bastionPrompt && draft['char-concept']) {
                  setBastionPrompt(draft['char-concept']);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-cyan-400"
              title="Jump to BASTION 5-Pillar Auto-Build in Step 1"
            >
              <Bot size={13} className="text-cyan-400" />
              <span>BASTION Auto-Build</span>
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Steps */}
          <div className="w-56 bg-slate-950 border-r border-slate-800 p-4 hidden md:flex flex-col gap-1 overflow-y-auto">
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-950/40 border-cyan-500/50' 
                      : isPast 
                        ? 'bg-slate-900/50 border-transparent hover:bg-slate-800' 
                        : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-600'
                  }`}
                >
                  <div className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-cyan-400' : isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                    Step {idx + 1}
                  </div>
                  <div className={`text-sm font-bold ${isActive ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden relative">
            {bastionNotice && (
              <div className="mx-6 mt-4 p-3 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-xs text-cyan-200 flex items-center justify-between shadow-lg shrink-0">
                <div className="flex items-center gap-2.5">
                  <Bot size={16} className="text-cyan-400 shrink-0" />
                  <span className="font-semibold">{bastionNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBastionNotice(null)}
                  className="text-cyan-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-cyan-900/50 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {renderStepContent()}
            </div>

            {/* Footer / Navigation */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-bold uppercase tracking-wider text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <div className="flex gap-3">
                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={16} /> Finalize & Deploy to Folio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedCreatorModal;
