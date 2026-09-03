import React, { useState, useEffect, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { X, ChevronRight, ChevronLeft, Check, Search, Shield, Target, User, Sparkles, BookOpen, Layers, Plus, Compass, Dna } from 'lucide-react';
import { DEFAULT_SKILLS } from '../../../data/skillsData';
import { DEFAULT_FEATURES, FEATURE_CATEGORIES } from '../../../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { DEFAULT_ARCHETYPES, ARCHETYPE_SPHERES, getGroupedArchetypes } from '../../../data/archetypesData';
import { DEFAULT_SPECIES, SPECIES_LINEAGES } from '../../../data/speciesData';
import { DEFAULT_OCCUPATIONS, COMMON_OCCUPATIONAL_TRAITS } from '../../../data/occupationsData';
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
  { id: 'tech', title: 'Tech Level', desc: 'Advancement & Wealth' },
  { id: 'skills', title: 'Skills & Features', desc: 'Background & General Allocations' },
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
  technologyLevel: 3, // Default is 3 (0 BP)
  skills: [],
  traits: [],
  features: [],
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
  
  // Search & Filter state for step 7
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('All');
  const [speciesLineageFilter, setSpeciesLineageFilter] = useState('All');
  const [speciesSearchQuery, setSpeciesSearchQuery] = useState('');

  // Data Caches
  const [dbData, setDbData] = useState({
    archetypes: DEFAULT_ARCHETYPES,
    species: DEFAULT_SPECIES,
    origins: [],
    factions: [],
    occupations: [],
    skills: ALL_CANONICAL_SKILLS,
    traits: ALL_CANONICAL_TRAITS,
    features: DEFAULT_FEATURES
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selected object tracking
  const [selectedSpeciesObj, setSelectedSpeciesObj] = useState(null);
  const [selectedArchetypeObj, setSelectedArchetypeObj] = useState(null);
  const [archetypeSphereFilter, setArchetypeSphereFilter] = useState('All');
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
          features: Array.from(featureMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
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

    // Technology Level Cost
    if (draft.technologyLevel === 4) spent += 10;
    else if (draft.technologyLevel === 5) spent += 20;
    else if (draft.technologyLevel < 3) spent -= 10; // Primitive TL refund

    // General allocated skills (1 CP per rank beyond background pools)
    if (draft.generalAllocations?.skills) {
      Object.values(draft.generalAllocations.skills).forEach(rank => {
        spent += (parseInt(rank, 10) || 0) * 1;
      });
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
      (pool?.traits || []).forEach(tName => {
        const cleanName = typeof tName === 'object' ? (tName.name || tName.id) : String(tName);
        if (!combinedTraitsMap.has(cleanName)) {
          const detail = traitDetailMap.get(cleanName.toLowerCase()) || (typeof tName === 'object' ? tName : {});
          combinedTraitsMap.set(cleanName, {
            id: detail.id || `trait_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: cleanName,
            category: detail.category || detail.trait_type || categoryLabel,
            trait_type: detail.trait_type || categoryLabel,
            trait_tier: detail.trait_tier || detail.tier || 'Basic',
            classification: detail.classification || 'Physical',
            source,
            description: detail.description || detail.desc || detail.mechanics || '',
            bp: isGranted ? 0 : (detail.bp !== undefined ? detail.bp : 1),
            standaloneBp: detail.bp !== undefined ? detail.bp : 1,
            cp: isGranted ? 0 : (detail.cp !== undefined ? detail.cp : 1),
            standaloneCp: detail.cp !== undefined ? detail.cp : 1,
            isGranted
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

    // Generate fully normalized sheet payload for the Persona Folio
    const payload = {
      'character-doc-id': docId,
      // Basic Identity Fields
      'char-name': draft['char-name']?.trim() || 'Unnamed Operative',
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
      'char-motive': draft['char-motive'] || '',
      'tech-level': draft.technologyLevel || 3,
      'starting-cp': 150,

      // Narrative & StoryFoundry Fields
      role: draft.role || '',
      summary: draft.summary || draft['char-concept'] || '',
      appearance: draft['char-style'] || '',
      goals: draft['char-motive'] || '',
      backstory: draft.backstory || '',

      // Primary Core Attributes (0 to +4 base + allocated species bonus points)
      'attr-strength': (draft.strength || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-strength'] || 0, 10)),
      'attr-might': parseInt(draft.speciesAllocations?.attributes?.['attr-might'] || 0, 10),
      'attr-agility': (draft.agility || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-agility'] || 0, 10)),
      'attr-reflex': parseInt(draft.speciesAllocations?.attributes?.['attr-reflex'] || 0, 10),
      'attr-stamina': (draft.stamina || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-stamina'] || 0, 10)),
      'attr-fortitude': parseInt(draft.speciesAllocations?.attributes?.['attr-fortitude'] || 0, 10),
      'attr-intellect': (draft.intellect || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-intellect'] || 0, 10)),
      'attr-logic': parseInt(draft.speciesAllocations?.attributes?.['attr-logic'] || 0, 10),
      'attr-wisdom': (draft.wisdom || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-wisdom'] || 0, 10)),
      'attr-will': parseInt(draft.speciesAllocations?.attributes?.['attr-will'] || 0, 10),
      'attr-charisma': (draft.charisma || 0) + (parseInt(draft.speciesAllocations?.attributes?.['attr-charisma'] || 0, 10)),
      'attr-etiquette': parseInt(draft.speciesAllocations?.attributes?.['attr-etiquette'] || 0, 10),

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
      armor: [],
      gear: [],
      weapons: [],
      armoring: [],
      mecha: [],
      other: [],
      specializations: [],
      skills: finalSkillsList,
      notes: [{ text: draft.backstory ? `Backstory:\n${draft.backstory}` : '' }]
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

    const success = await applyGuidedCharacter(payload);
    if (success) {
      onClose();
      if (onCharacterCreated) {
        onCharacterCreated(docId);
      }
      setTimeout(() => {
        setCurrentStep(0);
        setDraft(INITIAL_DRAFT);
        setSelectedSpeciesObj(null);
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
      if (!next['char-concept'] || next['char-concept'] === 'Unnamed Operative') {
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

  // ------------------- STEP RENDERS -------------------
  
  const renderConcept = () => {
    const filteredArchetypes = (dbData.archetypes || [])
      .filter(a => {
        if (archetypeSphereFilter === 'All') return true;
        return (a.sphere || '').toLowerCase().includes(archetypeSphereFilter.toLowerCase());
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Concept & Identity</h3>
          <p className="text-sm text-slate-400">Establish the baseline identity, physical profile, narrative foundation, and optional Archetype chassis of your operative.</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Operative Name / Callsign</label>
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
              {['All', 'Sentinels', 'Operatives', 'Visionaries', 'Savants'].map(sp => (
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
    <div className="space-y-4 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
        <p className="text-sm text-slate-400">Select an option to define your operative's background archetype.</p>
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
      <div className="space-y-4 max-w-4xl mx-auto h-full flex flex-col">
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
            const inherentFeats = Array.isArray(sp.inherent_features) ? sp.inherent_features : [];

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
                    <span>{inherentFeats.slice(0, 3).join(', ')}{inherentFeats.length > 3 ? ` +${inherentFeats.length - 3} more` : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOriginFaction = () => (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
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

  const renderOccupation = () => (
    <div className="space-y-4 max-w-4xl mx-auto">
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

  const renderAttributes = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Core Stats (Attributes)</h3>
        <p className="text-sm text-slate-400">Allocate your base attributes. Maximum +4 before species modifiers. Each +1 point costs <strong className="text-amber-400">5 CP</strong>.</p>
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

  const renderTechLevel = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Technology Level</h3>
        <p className="text-sm text-slate-400">Determine your access to advanced tech. Default is TL3 (0 CP).</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { level: 1, label: 'TL1 - Primitive', desc: 'Pre-industrial societies. Grants +10 CP refund.', cost: -10 },
          { level: 2, label: 'TL2 - Industrial', desc: 'Combustion engines & early electrical grids. Grants +10 CP refund.', cost: -10 },
          { level: 3, label: 'TL3 - Spacefaring (Standard)', desc: 'Interstellar baseline: grav-drives, standard blasters, kinetic shields. Costs 0 CP.', cost: 0 },
          { level: 4, label: 'TL4 - Advanced', desc: 'Subspace relays, plasma lattice armor, quantum AI. Costs 10 CP.', cost: 10 },
          { level: 5, label: 'TL5 - Theoretical', desc: 'Post-scarcity matter transmuters, exotic dark-matter drives. Costs 20 CP.', cost: 20 },
        ].map(tl => (
          <div 
            key={tl.level}
            onClick={() => updateDraft('technologyLevel', tl.level)}
            className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
              draft.technologyLevel === tl.level 
                ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div>
              <div className={`font-bold ${draft.technologyLevel === tl.level ? 'text-cyan-300' : 'text-slate-200'}`}>{tl.label}</div>
              <div className="text-xs text-slate-500">{tl.desc}</div>
            </div>
            <div className={`font-mono text-sm font-bold ${tl.cost > 0 ? 'text-red-400' : tl.cost < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {tl.cost > 0 ? `-${tl.cost} CP` : tl.cost < 0 ? `+${Math.abs(tl.cost)} CP` : '0 CP'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinalizeSkillsFeatures = () => {
    const primaryOrigTraits = selectedOriginObj ? extractNameList(selectedOriginObj.traits || selectedOriginObj.trait) : [];
    const secondaryOrigTraits = selectedSecondaryOriginObj ? extractNameList(selectedSecondaryOriginObj.traits || selectedSecondaryOriginObj.trait) : [];
    const origTraits = Array.from(new Set([...primaryOrigTraits, ...secondaryOrigTraits]));

    const primaryOrigSkills = selectedOriginObj ? extractNameList(selectedOriginObj.society_skills) : [];
    const secondaryOrigSkills = selectedSecondaryOriginObj ? extractNameList(selectedSecondaryOriginObj.society_skills) : [];
    const origSkills = Array.from(new Set([...primaryOrigSkills, ...secondaryOrigSkills]));
    const origMaxTraits = parseInt(selectedOriginObj?.bonus_traits || selectedOriginObj?.bonus_features || 2, 10);

    const facFeats = selectedFactionObj ? extractNameList(selectedFactionObj.features || selectedFactionObj.bonus_features || selectedFactionObj.benefits) : [];
    const facTraits = selectedFactionObj ? extractNameList(selectedFactionObj.traits || selectedFactionObj.trait) : [];
    const facSkills = selectedFactionObj ? extractNameList(selectedFactionObj.skill_package || selectedFactionObj.skills) : [];
    const facMaxFeats = parseInt(selectedFactionObj?.bonus_features || 2, 10);
    const facMaxTraits = parseInt(selectedFactionObj?.bonus_traits || (facTraits.length > 0 ? 1 : 0), 10);

    const commonOccTraitNames = COMMON_OCCUPATIONAL_TRAITS.map(t => t.name);
    const primaryOccTraits = selectedOccupationObj ? extractNameList(selectedOccupationObj.traits || selectedOccupationObj.trait) : [];
    const secondaryOccTraits = selectedSecondaryOccupationObj ? extractNameList(selectedSecondaryOccupationObj.traits || selectedSecondaryOccupationObj.trait) : [];
    const occTraits = Array.from(new Set([...primaryOccTraits, ...commonOccTraitNames, ...secondaryOccTraits]));
    const occSkills = selectedOccupationObj ? extractNameList(selectedOccupationObj.professional_skills || selectedOccupationObj.skills) : [];
    const occMaxTraits = parseInt(selectedOccupationObj?.bonus_traits || selectedOccupationObj?.bonus_features || 2, 10);

    const specAttrs = selectedSpeciesObj?.bonus_attribute_points || selectedSpeciesObj?.bonus_attribute_choices || 0;
    const specFeats = selectedSpeciesObj ? extractNameList(selectedSpeciesObj.bonus_feature_choices || selectedSpeciesObj.recommended_features) : [];
    const specTraits = selectedSpeciesObj ? extractNameList(selectedSpeciesObj.bonus_trait_choices || selectedSpeciesObj.recommended_traits || selectedSpeciesObj.traits) : [];
    const specSkills = selectedSpeciesObj ? extractNameList(selectedSpeciesObj.bonus_skill_choices) : [];
    const specMaxTraits = parseInt(selectedSpeciesObj?.bonus_traits || (specTraits.length > 0 ? 1 : 0), 10);
    const specMaxFeats = parseInt(selectedSpeciesObj?.bonus_features || (specFeats.length > 0 ? 1 : 0), 10);

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
          if (!isGeneral && currentTraits.length >= maxTraits) {
            alert(`Maximum of ${maxTraits} traits already selected in this pool.`);
            return prev;
          }
          if (isGeneral && bpRemaining < 1) {
            alert('Not enough remaining CP to purchase an additional trait (Cost: 1 CP).');
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
            alert(`Maximum of ${maxFeats} features already selected in this pool.`);
            return prev;
          }
          if (isGeneral && bpRemaining < 3) {
            alert('Not enough remaining CP to purchase an additional feature (Cost: 3 CP).');
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
          alert(`All ${maxPoints} bonus attribute points have been allocated.`);
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

    const hasSpeciesPools = specAttrs > 0 || specTraits.length > 0 || specFeats.length > 0 || specSkills.length > 0 || (selectedSpeciesObj?.bonus_skills && parseInt(selectedSpeciesObj.bonus_skills, 10) > 0) || (selectedSpeciesObj?.bonus_features && parseInt(selectedSpeciesObj.bonus_features, 10) > 0);

    return (
      <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Skills, Traits & Features Allocation</h3>
          <p className="text-sm text-slate-400">
            Allocate your free background ranks (20 SP & 2 traits each for Origin and Occupation, 20 SP & 2 benefits for Faction), spend species point pools, plus spend any remaining CP on additional skills, traits, and features.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* 1. Species Background Allocations (if available) */}
          {hasSpeciesPools && (
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-2">
                <Dna size={18} className="text-cyan-400" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  Species Background Pools: {draft['char-species'] || 'Selected Species'}
                </h4>
              </div>

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

              {(specFeats.length > 0 || specMaxFeats > 0) && (
                <FeatureMultiselectPulldown
                  title="Species Feature Choices"
                  categoryLabel="Species Feature"
                  maxSelectable={specMaxFeats || 1}
                  selectedFeatures={draft.speciesAllocations?.features || []}
                  recommendedFeatures={specFeats}
                  allFeatures={dbData.features}
                  onToggleFeature={(fName, fObj) => togglePoolFeature('speciesAllocations', fName, fObj, specMaxFeats || 1)}
                  onRemoveFeature={(fName) => removePoolFeature('speciesAllocations', fName)}
                  colorTheme="cyan"
                />
              )}

              {(specSkills.length > 0 || selectedSpeciesObj?.bonus_skills > 0) && (
                <SkillPoolRankPulldown
                  title="Species Skill Pool"
                  categoryLabel="Species Skill"
                  maxSP={parseInt(selectedSpeciesObj?.bonus_skills || 20, 10)}
                  allocatedSkills={draft.speciesAllocations?.skills || {}}
                  recommendedSkills={specSkills}
                  allSkills={dbData.skills}
                  onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('speciesAllocations', sName, newRank, delta, parseInt(selectedSpeciesObj?.bonus_skills || 20, 10))}
                  onRemoveSkill={(sName) => updatePoolSkillRank('speciesAllocations', sName, 0, 0, parseInt(selectedSpeciesObj?.bonus_skills || 20, 10))}
                  colorTheme="cyan"
                />
              )}
            </div>
          )}

          {/* 2. Origin Homeworld Allocations */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-2">
              <BookOpen size={18} className="text-emerald-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300">
                Origin Homeworld Pool: {draft['char-origin'] || 'General Origin'}
              </h4>
            </div>

            <SkillPoolRankPulldown
              title="Society Skill Point Pool"
              categoryLabel="Society Skill"
              maxSP={parseInt(selectedOriginObj?.skill_points || 20, 10)}
              allocatedSkills={draft.originAllocations?.skills || {}}
              recommendedSkills={origSkills}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('originAllocations', sName, newRank, delta, parseInt(selectedOriginObj?.skill_points || 20, 10))}
              onRemoveSkill={(sName) => updatePoolSkillRank('originAllocations', sName, 0, 0, parseInt(selectedOriginObj?.skill_points || 20, 10))}
              colorTheme="emerald"
            />

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
            />
          </div>

          {/* 3. Faction Allegiance Allocations */}
          <div className="p-4 rounded-xl border border-purple-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2">
              <Shield size={18} className="text-purple-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-purple-300">
                Faction Allegiance Pool: {draft['char-faction'] || 'General Faction'}
              </h4>
            </div>

            <SkillPoolRankPulldown
              title="Faction Skill Package Pool"
              categoryLabel="Faction Skill"
              maxSP={parseInt(selectedFactionObj?.skill_points || 20, 10)}
              allocatedSkills={draft.factionAllocations?.skills || {}}
              recommendedSkills={facSkills}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('factionAllocations', sName, newRank, delta, parseInt(selectedFactionObj?.skill_points || 20, 10))}
              onRemoveSkill={(sName) => updatePoolSkillRank('factionAllocations', sName, 0, 0, parseInt(selectedFactionObj?.skill_points || 20, 10))}
              colorTheme="purple"
            />

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

          {/* 4. Occupation Career Allocations */}
          <div className="p-4 rounded-xl border border-sky-500/40 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-sky-900/40 pb-2">
              <Shield size={18} className="text-sky-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-sky-300">
                Occupation Career Pool: {draft['char-occu'] || 'General Occupation'}
              </h4>
            </div>

            <SkillPoolRankPulldown
              title="Professional Skill Package Pool"
              subtitle="Max Rank 11 • Recommended: Rank 6"
              categoryLabel="Professional Skill"
              maxSP={parseInt(selectedOccupationObj?.skill_points || 20, 10)}
              allocatedSkills={draft.occuAllocations?.skills || {}}
              recommendedSkills={occSkills}
              allSkills={dbData.skills}
              onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('occuAllocations', sName, newRank, delta, parseInt(selectedOccupationObj?.skill_points || 20, 10))}
              onRemoveSkill={(sName) => updatePoolSkillRank('occuAllocations', sName, 0, 0, parseInt(selectedOccupationObj?.skill_points || 20, 10))}
              colorTheme="sky"
            />

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

          {/* 5. General Point Buy Allocations */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SkillPoolRankPulldown
                title="Additional Skill Ranks (1 CP / Rank)"
                categoryLabel="General Skill"
                maxSP={Math.max(0, bpRemaining + Object.values(draft.generalAllocations?.skills || {}).reduce((a, b) => a + (parseInt(b, 10) || 0), 0))}
                allocatedSkills={draft.generalAllocations?.skills || {}}
                recommendedSkills={[]}
                allSkills={dbData.skills}
                onUpdateRank={(sName, newRank, delta) => updatePoolSkillRank('generalAllocations', sName, newRank, delta, 999, true)}
                onRemoveSkill={(sName) => updatePoolSkillRank('generalAllocations', sName, 0, 0, 999, true)}
                colorTheme="cyan"
              />

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

  const renderReview = () => {
    // Combine all skills for summary display
    const summarySkills = {};
    const countSkills = (pool) => {
      Object.entries(pool?.skills || {}).forEach(([n, r]) => {
        summarySkills[n] = (summarySkills[n] || 0) + (parseInt(r, 10) || 0);
      });
    };
    countSkills(draft.speciesAllocations);
    countSkills(draft.originAllocations);
    countSkills(draft.factionAllocations);
    countSkills(draft.occuAllocations);
    countSkills(draft.generalAllocations);

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
          <p className="text-slate-400 mt-1 text-sm">Review your operative parameters before deploying to the Persona Folio.</p>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl space-y-5 shadow-xl flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Operative Name</span>
              <span className="text-lg font-bold text-white">{draft['char-name'] || 'Unnamed Operative'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Concept</span>
              <span className="text-sm text-slate-300">{draft['char-concept'] || '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 border-b border-slate-800 pb-4">
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
          </div>

          {/* Core Stats */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">Base Attributes</span>
            <div className="grid grid-cols-6 gap-2 text-center">
              {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => (
                <div key={attr} className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{attr.substring(0,3)}</div>
                  <div className="text-lg font-black text-cyan-300">{draft[attr]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocated Skills Summary */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">
              Allocated Skills ({Object.keys(summarySkills).length})
            </span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
              {Object.keys(summarySkills).length === 0 ? (
                <span className="text-xs text-slate-500 italic">No skills allocated.</span>
              ) : (
                Object.entries(summarySkills).map(([sName, r]) => (
                  <span key={sName} className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-200">
                    {sName} <strong className="text-cyan-400 font-mono">+{r}</strong>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Allocated Traits Summary */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">
              Acquired Traits ({summaryTraits.size})
            </span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
              {summaryTraits.size === 0 ? (
                <span className="text-xs text-slate-500 italic">No traits selected.</span>
              ) : (
                Array.from(summaryTraits).map(tName => (
                  <span key={tName} className="text-xs bg-slate-900 border border-cyan-500/40 px-2.5 py-1 rounded text-cyan-200 flex items-center gap-1">
                    <Sparkles size={11} className="text-cyan-400" /> {tName}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Allocated Features Summary */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">
              Acquired Features ({summaryFeatures.size})
            </span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
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
    switch (STEPS[currentStep].id) {
      case 'concept': return renderConcept();
      case 'species': return renderSpecies();
      case 'origin': return renderOriginFaction();
      case 'occupation': return renderOccupation();
      case 'attributes': return renderAttributes();
      case 'tech': return renderTechLevel();
      case 'skills': return renderFinalizeSkillsFeatures();
      case 'review': return renderReview();
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-3 sm:p-4 md:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 bg-black/80 backdrop-blur-md overflow-y-auto select-none font-sans">
      <div className="bg-[#0d1117] border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden ring-1 ring-white/10">
        
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
