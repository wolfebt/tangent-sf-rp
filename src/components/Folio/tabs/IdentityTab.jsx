import React, { useState, useEffect, useMemo } from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { useDBM } from '../../../context/DBMContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { db } from '../../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { DEFAULT_SPECIES, SPECIES_LINEAGES } from '../../../data/speciesData';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';
import { DEFAULT_OCCUPATIONS, COMMON_OCCUPATIONAL_TRAITS } from '../../../data/occupationsData';
import { DEFAULT_ORIGINS } from '../../../data/originsData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { DEFAULT_FEATURES } from '../../../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';
import {
  AttributePoolPulldown,
  FeatureMultiselectPulldown,
  TraitMultiselectPulldown,
  SkillPoolRankPulldown
} from '../shared/IdentityPoolPulldown';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  BookOpen,
  Shield,
  Check,
  Sparkles,
  Dna,
  User,
  Briefcase,
  Globe,
  Building2,
  Layers,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import {
  formatHeightWithConversion,
  getHeightConversion,
  formatWeightWithConversion,
  getWeightConversion
} from '../../../engines/tangentMeasurementEngine';

const normalizeTraitName = (trait) => {
  if (!trait) return '';
  const raw = typeof trait === 'object' ? (trait.name || trait.title || trait.id || '') : String(trait);
  const cleaned = raw.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
  return cleaned.replace(/\b\w/g, c => c.toUpperCase());
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

const formatList = (items) => {
  if (!items) return '—';
  if (Array.isArray(items)) {
    if (items.length === 0) return '—';
    return items.map(i => typeof i === 'object' ? (i.name || i.title || i.id || '') : String(i)).join(', ');
  }
  return String(items);
};

const formatTraitsList = (items) => {
  if (!items) return '—';
  const list = Array.isArray(items) ? items : [items];
  if (list.length === 0) return '—';
  return list.map(normalizeTraitName).join(', ');
};

// Check if a skill name is trained on characterData and return rank
const getSkillTrainingStatus = (skillName, characterData) => {
  if (!skillName) return { isTrained: false, rank: 0 };
  const cleanTarget = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (Array.isArray(characterData.skills)) {
    const match = characterData.skills.find(s => {
      const n = (typeof s === 'object' ? (s.name || s.id) : String(s)).toLowerCase().replace(/[^a-z0-9]/g, '');
      return n === cleanTarget;
    });
    if (match) {
      const r = typeof match === 'object' ? (match.rank || match.value || 1) : 1;
      return { isTrained: true, rank: r };
    }
  } else if (characterData.skills && typeof characterData.skills === 'object') {
    for (const [k, v] of Object.entries(characterData.skills)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget) {
        const r = typeof v === 'object' ? (v.rank || v.value || 1) : Number(v) || 1;
        return { isTrained: true, rank: r };
      }
    }
  }

  for (const key of Object.keys(characterData)) {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const rawId = key.replace('skill-', '').replace('-rank', '');
      const cleanId = rawId.replace(/[^a-z0-9]/g, '');
      const storedName = characterData[`skill-${rawId}-name`];
      if (storedName && storedName.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget) {
        const r = parseInt(characterData[key], 10);
        if (!isNaN(r) && r > 0) return { isTrained: true, rank: r };
      }
      if (cleanId === cleanTarget || cleanId.includes(cleanTarget) || cleanTarget.includes(cleanId)) {
        const r = parseInt(characterData[key], 10);
        if (!isNaN(r) && r > 0) return { isTrained: true, rank: r };
      }
    }
  }

  return { isTrained: false, rank: 0 };
};

// Check if a trait or feature is acquired on characterData
const getFeatureAcquiredStatus = (featRef, characterData) => {
  if (!featRef) return false;
  const targetNorm = normalizeTraitName(featRef).toLowerCase();
  const targetRaw = (typeof featRef === 'object' ? (featRef.name || featRef.id || '') : String(featRef)).toLowerCase();

  const feats = Array.isArray(characterData.features) ? characterData.features : [];
  return feats.some(f => {
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const norm = normalizeTraitName(fName).toLowerCase();
    const raw = fName.toLowerCase();
    return norm === targetNorm || raw === targetRaw || (targetNorm.length > 3 && (norm.includes(targetNorm) || targetNorm.includes(norm)));
  });
};

// Check if a disadvantage is active on characterData
const getDisadvantageActiveStatus = (disRef, characterData) => {
  if (!disRef) return false;
  const targetNorm = normalizeTraitName(disRef).toLowerCase();
  const targetRaw = (typeof disRef === 'object' ? (disRef.name || disRef.id || '') : String(disRef)).toLowerCase();

  const disList = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
  return disList.some(d => {
    const dName = typeof d === 'object' ? (d.name || d.title || d.id || '') : String(d);
    const norm = normalizeTraitName(dName).toLowerCase();
    const raw = dName.toLowerCase();
    return norm === targetNorm || raw === targetRaw || (targetNorm.length > 3 && (norm.includes(targetNorm) || targetNorm.includes(norm)));
  });
};

const IdentityTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { 
    characterData, 
    updateField, 
    applyArchetypeChassis, 
    applySpeciesAdjustments, 
    economyBreakdown, 
    calculateFullSpeciesCost,
    allocatePoolSkillRank,
    togglePoolTrait,
    removePoolTrait,
    togglePoolFeature,
    removePoolFeature,
    allocatePoolAttribute,
    isLocked,
    isPlayerOverride
  } = useFolio();
  const dbm = useDBM();
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);

  // Sub-Tab Navigation State: 'bio', 'archetype', 'species', 'occupation', 'origin', 'faction', 'all'
  const [activeSubTab, setActiveSubTab] = useState('bio');

  const [dbOptions, setDbOptions] = useState({});
  const [manualMode, setManualMode] = useState({});
  const [expandedCards, setExpandedCards] = useState({
    archetype: true,
    species: true,
    occupation: true,
    origin: true,
    faction: true
  });
  const [inspectItem, setInspectItem] = useState(null);

  const toggleCard = (key) => setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));

  const handleInspectItem = (item, categoryKey, title) => {
    if (!item) return;
    setInspectItem({ item, categoryKey, title: title || item.name || item.title || 'Entry Details' });
  };

  useEffect(() => {
    const paths = ['species', 'occupations', 'origins', 'factions', 'archetypes', 'skills', 'features', 'traits', 'trait'];
    const unsubs = paths.map(path => {
      try {
        const colRef = collection(db, path);
        return onSnapshot(colRef, (snap) => {
          const items = snap.docs.map(doc => ({ name: doc.data().name || doc.id, ...doc.data(), id: doc.id }));
          setDbOptions(prev => ({ ...prev, [path]: items }));
        }, (e) => {
          console.warn(`Failed to load ${path} options`, e);
          setDbOptions(prev => ({ ...prev, [path]: [] }));
        });
      } catch (err) {
        console.warn(`Failed to subscribe to ${path}`, err);
        return () => {};
      }
    });

    return () => {
      unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  useEffect(() => {
    // Automatically set manual mode if value doesn't match dbOptions
    if (Object.keys(dbOptions).length > 0) {
      let changed = false;

      setManualMode((prev) => {
        const newManualModes = { ...prev };
        const checkField = (id, browsePath) => {
          const val = characterData[id];
          if (val && typeof val === 'string' && val.trim() !== '') {
             const options = dbOptions[browsePath] || [];
             const matches = options.some(opt => opt.name === val);
             if (!matches && !newManualModes[id]) {
               newManualModes[id] = true;
               changed = true;
             }
          }
        };

        checkField('char-archetype', 'archetypes');
        checkField('char-species', 'species');
        checkField('char-occu', 'occupations');
        checkField('char-origin', 'origins');
        checkField('char-faction', 'factions');

        return changed ? newManualModes : prev;
      });
    }
  }, [characterData, dbOptions]);

  // Comprehensive Trait Catalog (Canonical baseline + DBM custom + Firestore cloud)
  const allCanonicalAndDbTraits = useMemo(() => {
    const map = new Map();
    ALL_CANONICAL_TRAITS.forEach(t => {
      const idKey = (t.id || '').toLowerCase();
      const normKey = normalizeTraitName(t.name || t.title || '').toLowerCase();
      if (idKey) map.set(idKey, t);
      if (normKey) map.set(normKey, t);
    });
    const dbmTraits = (dbm?.dbData?.trait || dbm?.dbData?.traits || []);
    if (Array.isArray(dbmTraits)) {
      dbmTraits.forEach(t => {
        if (!t) return;
        const idKey = (t.id || '').toLowerCase();
        const normKey = normalizeTraitName(t.name || t.title || '').toLowerCase();
        const merged = { ...(map.get(idKey) || map.get(normKey) || {}), ...t };
        if (idKey) map.set(idKey, merged);
        if (normKey) map.set(normKey, merged);
      });
    }
    const cloudTraits = [...(dbOptions.traits || []), ...(dbOptions.trait || [])];
    cloudTraits.forEach(t => {
      if (!t) return;
      const idKey = (t.id || '').toLowerCase();
      const normKey = normalizeTraitName(t.name || t.title || '').toLowerCase();
      const merged = { ...(map.get(idKey) || map.get(normKey) || {}), ...t };
      if (idKey) map.set(idKey, merged);
      if (normKey) map.set(normKey, merged);
    });
    return Array.from(new Set(map.values()));
  }, [dbOptions.traits, dbOptions.trait, dbm?.dbData?.trait, dbm?.dbData?.traits]);

  // Catalog option lists
  const archetypesCatalog = useMemo(() => {
    return (dbOptions.archetypes && dbOptions.archetypes.length > 0) ? dbOptions.archetypes : DEFAULT_ARCHETYPES;
  }, [dbOptions.archetypes]);

  const speciesCatalog = useMemo(() => {
    return (dbOptions.species && dbOptions.species.length > 0) ? dbOptions.species : DEFAULT_SPECIES;
  }, [dbOptions.species]);

  const occupationsCatalog = useMemo(() => {
    return (dbOptions.occupations && dbOptions.occupations.length > 0)
      ? dbOptions.occupations
      : ((dbm?.dbData?.occupations && dbm.dbData.occupations.length > 0) ? dbm.dbData.occupations : DEFAULT_OCCUPATIONS);
  }, [dbOptions.occupations, dbm?.dbData?.occupations]);

  const originsCatalog = useMemo(() => {
    return (dbOptions.origins && dbOptions.origins.length > 0)
      ? dbOptions.origins
      : ((dbm?.dbData?.origins && dbm.dbData.origins.length > 0) ? dbm.dbData.origins : DEFAULT_ORIGINS);
  }, [dbOptions.origins, dbm?.dbData?.origins]);

  const factionsCatalog = useMemo(() => {
    return (dbOptions.factions && dbOptions.factions.length > 0)
      ? dbOptions.factions
      : ((dbm?.dbData?.factions && dbm.dbData.factions.length > 0) ? dbm.dbData.factions : DEFAULT_FACTIONS);
  }, [dbOptions.factions, dbm?.dbData?.factions]);

  // Selected Archetype Object lookup
  const selectedArchetype = useMemo(() => {
    const raw = characterData['char-archetype'];
    if (!raw) return null;
    const archName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return archetypesCatalog.find(a => (a.name || a.id || '').toLowerCase() === archName.toLowerCase()) || null;
  }, [characterData['char-archetype'], archetypesCatalog]);

  // Selected Species Object lookup
  const selectedSpecies = useMemo(() => {
    const raw = characterData['char-species'];
    if (!raw) return null;
    const spName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return speciesCatalog.find(s => (s.name || s.title || s.id || '').toLowerCase() === spName.toLowerCase()) || null;
  }, [characterData['char-species'], speciesCatalog]);

  // Selected Occupation Object lookup
  const selectedOccupation = useMemo(() => {
    const raw = characterData['char-occu'];
    if (!raw) return null;
    const occName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return occupationsCatalog.find(o => (o.name || o.title || o.id || '').toLowerCase() === occName.toLowerCase()) || null;
  }, [characterData['char-occu'], occupationsCatalog]);

  // Selected Secondary / Background Occupation lookup (via Background Trait)
  const selectedSecondaryOccupation = useMemo(() => {
    const raw = characterData['char-secondary-occu'] || characterData['char-background-occu'] || characterData['char-occu-secondary'];
    if (!raw) return null;
    const secOccName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return occupationsCatalog.find(o => (o.name || o.title || o.id || '').toLowerCase() === secOccName.toLowerCase()) || null;
  }, [characterData['char-secondary-occu'], characterData['char-background-occu'], characterData['char-occu-secondary'], occupationsCatalog]);

  // Selected Origin Object lookup
  const selectedOrigin = useMemo(() => {
    const raw = characterData['char-origin'];
    if (!raw) return null;
    const origName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return originsCatalog.find(o => (o.name || o.title || o.id || '').toLowerCase() === origName.toLowerCase()) || null;
  }, [characterData['char-origin'], originsCatalog]);

  // Selected Secondary Origin Object lookup (expands skill and trait options without adding points)
  const selectedSecondaryOrigin = useMemo(() => {
    const raw = characterData['char-secondary-origin'] || characterData['char-origin-secondary'];
    if (!raw) return null;
    const secName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return originsCatalog.find(o => (o.name || o.title || o.id || '').toLowerCase() === secName.toLowerCase()) || null;
  }, [characterData['char-secondary-origin'], characterData['char-origin-secondary'], originsCatalog]);

  // Selected Faction Object lookup
  const selectedFaction = useMemo(() => {
    const raw = characterData['char-faction'];
    if (!raw) return null;
    const facName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    return factionsCatalog.find(f => (f.name || f.title || f.id || '').toLowerCase() === facName.toLowerCase()) || null;
  }, [characterData['char-faction'], factionsCatalog]);

  // Faction Benefits & Hindrances
  const { factionBenefits, factionHindrances } = useMemo(() => {
    if (!selectedFaction) return { factionBenefits: [], factionHindrances: [] };

    const benefits = new Set();
    const hindrances = new Set();

    const rawBonus = selectedFaction.bonus_features || selectedFaction.bonusFeatures || selectedFaction.benefits;
    if (Array.isArray(rawBonus)) {
      rawBonus.forEach(b => benefits.add(typeof b === 'object' ? (b.name || b.id) : String(b)));
    } else if (typeof rawBonus === 'string' && rawBonus.trim()) {
      rawBonus.split(',').forEach(b => benefits.add(b.trim()));
    }

    if (selectedFaction.social_strengths) {
      benefits.add(String(selectedFaction.social_strengths).trim());
    }

    const rawHind = selectedFaction.hindrances || selectedFaction.disadvantages || selectedFaction.social_weaknesses;
    if (Array.isArray(rawHind)) {
      rawHind.forEach(h => hindrances.add(typeof h === 'object' ? (h.name || h.id) : String(h)));
    } else if (typeof rawHind === 'string' && rawHind.trim()) {
      rawHind.split(',').forEach(h => hindrances.add(h.trim()));
    }

    if (Array.isArray(selectedFaction.modifiers)) {
      selectedFaction.modifiers.forEach(m => {
        const val = typeof m === 'object' ? (m.value ?? 1) : 1;
        const desc = typeof m === 'object' ? (m.name || m.description || `${m.aspect || 'Modifier'} ${val > 0 ? `+${val}` : val}`) : String(m);
        if (Number(val) < 0) {
          hindrances.add(desc);
        } else {
          benefits.add(desc);
        }
      });
    }

    const feats = Array.isArray(characterData.features) ? characterData.features : [];
    feats.forEach(f => {
      const fCat = typeof f === 'object' ? (f.category || '') : '';
      const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
      if (fCat.toLowerCase().includes('faction') || fName.toLowerCase().startsWith('benefit (')) {
        benefits.add(`[Gained] ${fName}`);
      }
    });

    const disList = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
    disList.forEach(d => {
      const dCat = typeof d === 'object' ? (d.category || '') : '';
      const dName = typeof d === 'object' ? (d.name || d.title || d.id || '') : String(d);
      if (dCat.toLowerCase().includes('faction')) {
        hindrances.add(`[Gained] ${dName}`);
      }
    });

    return {
      factionBenefits: Array.from(benefits),
      factionHindrances: Array.from(hindrances)
    };
  }, [selectedFaction, characterData.features, characterData.disadvantages]);

  // Allocation metrics computation for status badges
  const speciesAllocationMetrics = useMemo(() => {
    if (!selectedSpecies) return null;
    const bonusAttrPoints = parseInt(selectedSpecies.bonus_attribute_points || selectedSpecies.bonus_attribute_choices || 0, 10);
    const bonusTraitChoices = extractNameList(selectedSpecies.bonus_trait_choices || selectedSpecies.recommended_traits || selectedSpecies.traits);
    const bonusFeatureChoices = extractNameList(selectedSpecies.bonus_feature_choices || selectedSpecies.recommended_features);
    const bonusSkillChoices = extractNameList(selectedSpecies.bonus_skill_choices);
    const maxTraits = parseInt(selectedSpecies.bonus_traits || (bonusTraitChoices.length > 0 ? 1 : 0), 10);
    const maxFeats = parseInt(selectedSpecies.bonus_features || (bonusFeatureChoices.length > 0 ? 1 : 0), 10);
    const speciesSkillSP = parseInt(selectedSpecies.bonus_skills || selectedSpecies.bonus_skill_points || 0, 10);

    const allocatedAttrsCount = Object.values(characterData.speciesAllocations?.attributes || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const allocatedTraitsCount = (characterData.speciesAllocations?.traits || []).length;
    const allocatedFeaturesCount = (characterData.speciesAllocations?.features || []).length;
    const allocatedSPCount = Object.values(characterData.speciesAllocations?.skills || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);

    const pendingAttrs = bonusAttrPoints > 0 && allocatedAttrsCount < bonusAttrPoints;
    const pendingTraits = maxTraits > 0 && allocatedTraitsCount < maxTraits;
    const pendingFeats = maxFeats > 0 && allocatedFeaturesCount < maxFeats;
    const pendingSP = speciesSkillSP > 0 && allocatedSPCount < speciesSkillSP;

    const isComplete = !pendingAttrs && !pendingTraits && !pendingFeats && !pendingSP;

    return {
      bonusAttrPoints,
      allocatedAttrsCount,
      maxTraits,
      allocatedTraitsCount,
      maxFeats,
      allocatedFeaturesCount,
      speciesSkillSP,
      allocatedSPCount,
      isComplete,
      hasPending: !isComplete
    };
  }, [selectedSpecies, characterData.speciesAllocations]);

  const occuAllocationMetrics = useMemo(() => {
    if (!selectedOccupation) return null;
    const profSkills = extractNameList(selectedOccupation.professional_skills || selectedOccupation.skills);
    const occuSP = parseInt(selectedOccupation.skill_points ?? (profSkills.length > 0 ? 20 : 0), 10);
    const maxTraits = parseInt(selectedOccupation.bonus_traits || selectedOccupation.bonus_features || 2, 10);
    const occFeatures = extractNameList(selectedOccupation.features || selectedOccupation.bonus_features);
    const maxFeats = parseInt(selectedOccupation.bonus_features || (occFeatures.length > 0 ? 1 : 0), 10);

    const allocatedSPCount = Object.values(characterData.occuAllocations?.skills || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const allocatedTraitsCount = (characterData.occuAllocations?.traits || []).length;
    const allocatedFeaturesCount = (characterData.occuAllocations?.features || []).length;

    const pendingSP = occuSP > 0 && allocatedSPCount < occuSP;
    const pendingTraits = maxTraits > 0 && allocatedTraitsCount < maxTraits;
    const pendingFeats = maxFeats > 0 && allocatedFeaturesCount < maxFeats;

    const isComplete = !pendingSP && !pendingTraits && !pendingFeats;

    return {
      occuSP,
      allocatedSPCount,
      maxTraits,
      allocatedTraitsCount,
      maxFeats,
      allocatedFeaturesCount,
      isComplete,
      hasPending: !isComplete
    };
  }, [selectedOccupation, characterData.occuAllocations]);

  const originAllocationMetrics = useMemo(() => {
    if (!selectedOrigin) return null;
    const socSkills = extractNameList(selectedOrigin.society_skills);
    const origSP = parseInt(selectedOrigin.skill_points ?? (socSkills.length > 0 ? 20 : 0), 10);
    const maxTraits = parseInt(selectedOrigin.bonus_traits || selectedOrigin.bonus_features || 2, 10);
    const origFeatures = extractNameList(selectedOrigin.features || selectedOrigin.bonus_features);
    const maxFeats = parseInt(selectedOrigin.bonus_features || 0, 10);

    const allocatedSPCount = Object.values(characterData.originAllocations?.skills || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const allocatedTraitsCount = (characterData.originAllocations?.traits || []).length;
    const allocatedFeaturesCount = (characterData.originAllocations?.features || []).length;

    const pendingSP = origSP > 0 && allocatedSPCount < origSP;
    const pendingTraits = maxTraits > 0 && allocatedTraitsCount < maxTraits;
    const pendingFeats = maxFeats > 0 && allocatedFeaturesCount < maxFeats;

    const isComplete = !pendingSP && !pendingTraits && !pendingFeats;

    return {
      origSP,
      allocatedSPCount,
      maxTraits,
      allocatedTraitsCount,
      maxFeats,
      allocatedFeaturesCount,
      isComplete,
      hasPending: !isComplete
    };
  }, [selectedOrigin, characterData.originAllocations]);

  const factionAllocationMetrics = useMemo(() => {
    if (!selectedFaction) return null;
    const pkgSkills = extractNameList(selectedFaction.skill_package || selectedFaction.skills);
    const facSP = parseInt(selectedFaction.skill_points || (pkgSkills.length > 0 ? 20 : 0), 10);
    const maxFeats = parseInt(selectedFaction.bonus_features || (factionBenefits.length > 0 ? 1 : 0), 10);
    const factionTraits = extractNameList(selectedFaction.traits || selectedFaction.trait);
    const maxTraits = parseInt(selectedFaction.bonus_traits || (factionTraits.length > 0 ? 1 : 0), 10);

    const allocatedSPCount = Object.values(characterData.factionAllocations?.skills || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const allocatedFeaturesCount = (characterData.factionAllocations?.features || []).length;
    const allocatedTraitsCount = (characterData.factionAllocations?.traits || []).length;

    const pendingSP = facSP > 0 && allocatedSPCount < facSP;
    const pendingFeats = maxFeats > 0 && allocatedFeaturesCount < maxFeats;
    const pendingTraits = maxTraits > 0 && allocatedTraitsCount < maxTraits;

    const isComplete = !pendingSP && !pendingFeats && !pendingTraits;

    return {
      facSP,
      allocatedSPCount,
      maxFeats,
      allocatedFeaturesCount,
      maxTraits,
      allocatedTraitsCount,
      isComplete,
      hasPending: !isComplete
    };
  }, [selectedFaction, characterData.factionAllocations, factionBenefits]);

  const handleSpeciesChange = (value) => {
    updateField('char-species', value);
  };

  const handleArchetypeChange = (value) => {
    updateField('char-archetype', value);
  };

  const handleOccupationChange = (value) => {
    updateField('char-occu', value);
  };

  const handleOriginChange = (value) => {
    updateField('char-origin', value);
  };

  const handleFactionChange = (value) => {
    updateField('char-faction', value);
  };

  // Sub-tabs configuration
  const SUB_TABS = [
    {
      id: 'bio',
      label: 'Bio & Dossier',
      icon: <User className="w-3.5 h-3.5" />,
      activeClass: 'bg-slate-800 text-slate-100 border-slate-600 shadow-sm',
      badge: characterData['char-name'] ? characterData['char-name'] : null,
      badgeClass: 'bg-slate-900 border border-slate-700 text-cyan-300'
    },
    {
      id: 'archetype',
      label: 'Archetype',
      icon: <Shield className="w-3.5 h-3.5" />,
      activeClass: 'bg-amber-950/80 text-amber-200 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      badge: characterData['char-archetype'] || 'Optional',
      badgeClass: characterData['char-archetype'] ? 'bg-amber-950 border border-amber-500/60 text-amber-300' : 'bg-slate-900 text-slate-500'
    },
    {
      id: 'species',
      label: 'Species',
      icon: <Dna className="w-3.5 h-3.5" />,
      activeClass: 'bg-cyan-950/80 text-cyan-200 border-cyan-500/70 shadow-[0_0_12px_rgba(34,211,238,0.2)]',
      badge: characterData['char-species'] ? (speciesAllocationMetrics?.isComplete ? '✓ Ready' : 'Pending Allocation') : 'Required',
      badgeClass: characterData['char-species'] 
        ? (speciesAllocationMetrics?.isComplete ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300' : 'bg-cyan-950 border border-cyan-500/60 text-cyan-300')
        : 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-bold'
    },
    {
      id: 'occupation',
      label: 'Occupation',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      activeClass: 'bg-sky-950/80 text-sky-200 border-sky-500/70 shadow-[0_0_12px_rgba(14,165,233,0.2)]',
      badge: characterData['char-occu'] ? (occuAllocationMetrics?.isComplete ? '✓ Ready' : 'Pending Allocation') : 'Required',
      badgeClass: characterData['char-occu']
        ? (occuAllocationMetrics?.isComplete ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300' : 'bg-sky-950 border border-sky-500/60 text-sky-300')
        : 'bg-sky-950/60 border border-sky-500/40 text-sky-400 font-bold'
    },
    {
      id: 'origin',
      label: 'Origin',
      icon: <Globe className="w-3.5 h-3.5" />,
      activeClass: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      badge: characterData['char-origin'] ? (originAllocationMetrics?.isComplete ? '✓ Ready' : 'Pending Allocation') : 'Required',
      badgeClass: characterData['char-origin']
        ? (originAllocationMetrics?.isComplete ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300' : 'bg-emerald-950 border border-emerald-500/60 text-emerald-300')
        : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold'
    },
    {
      id: 'faction',
      label: 'Faction',
      icon: <Building2 className="w-3.5 h-3.5" />,
      activeClass: 'bg-purple-950/80 text-purple-200 border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
      badge: characterData['char-faction'] ? (factionAllocationMetrics?.isComplete ? '✓ Ready' : 'Pending Allocation') : 'Required',
      badgeClass: characterData['char-faction']
        ? (factionAllocationMetrics?.isComplete ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300' : 'bg-purple-950 border border-purple-500/60 text-purple-300')
        : 'bg-purple-950/60 border border-purple-500/40 text-purple-400 font-bold'
    },
    {
      id: 'all',
      label: 'All Pillars',
      icon: <Layers className="w-3.5 h-3.5" />,
      activeClass: 'bg-slate-800 text-slate-200 border-slate-600',
      badge: 'Classic View',
      badgeClass: 'bg-slate-900 border border-slate-700 text-slate-400'
    }
  ];

  // ----------------------------------------------------------------------------------
  // RENDER: ARCHETYPE CARD / WORKBENCH
  // ----------------------------------------------------------------------------------
  const renderArchetypeSection = (isDedicated = false) => {
    const fieldId = 'char-archetype';
    const label = 'Archetype';
    const browsePath = 'archetypes';
    const val = characterData[fieldId] || '';
    const isManual = Boolean(manualMode[fieldId]);
    const isExpanded = isDedicated || Boolean(expandedCards['archetype']);
    const essentialSkills = extractNameList(selectedArchetype?.essential_skills);
    const signatureFeatures = extractNameList(selectedArchetype?.signature_features);
    const recOccs = extractNameList(selectedArchetype?.recommended_occupations);
    const recOrigins = extractNameList(selectedArchetype?.recommended_origins);
    const recFactions = extractNameList(selectedArchetype?.recommended_factions);

    return (
      <div className={`bg-slate-950/90 border border-amber-500/40 rounded-xl overflow-hidden transition-all shadow-none ${isDedicated ? 'p-1' : ''}`}>
        {/* Header Bar */}
        <div
          onClick={() => {
            if (!isDedicated) {
              if (val && selectedArchetype) {
                toggleCard('archetype');
              } else if (onOpenSelectorModal) {
                onOpenSelectorModal(fieldId, label, browsePath);
              }
            }
          }}
          className={`flex flex-wrap items-center justify-between p-3 select-none transition-colors ${
            !isDedicated ? 'cursor-pointer' : ''
          } ${
            val ? 'bg-amber-950/20' : 'bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-lg shrink-0">🛡️</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-500/50 text-amber-300 shrink-0">
              {label}
            </span>
            {val ? (
              <span className="text-sm font-bold font-mono uppercase text-amber-400 truncate">
                {val}
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-400 italic truncate">
                None Selected <span className="text-slate-600 hidden sm:inline">(Optional)</span>
              </span>
            )}
            {selectedArchetype?.sphere && val && (
              <span className="text-xs font-mono text-slate-400 truncate hidden md:inline">
                • 80 CP Blueprint ({selectedArchetype.sphere})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto mt-1 sm:mt-0" onClick={e => e.stopPropagation()}>
            {/* Inline Quick Selector Dropdown */}
            {!isSheetLocked && !isManual && (
              <div className="relative">
                <select
                  value={val}
                  onChange={(e) => handleArchetypeChange(e.target.value)}
                  className="bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-200 text-xs rounded px-2.5 py-1 font-mono outline-none cursor-pointer focus:border-amber-400"
                  title="Quick select archetype from list"
                >
                  <option value="">-- Quick Select Archetype --</option>
                  {(() => {
                    const groups = {};
                    archetypesCatalog.forEach(a => {
                      const sp = a.sphere || a.category || 'General';
                      if (!groups[sp]) groups[sp] = [];
                      groups[sp].push(a);
                    });
                    return Object.entries(groups).map(([grp, list]) => (
                      <optgroup key={grp} label={grp} className="bg-slate-950 text-slate-200">
                        {list.map(item => (
                          <option key={item.name || item.id} value={item.name || item.id}>
                            {item.name || item.id} {item.primary_attribute ? `(${item.primary_attribute}/${item.secondary_attribute})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>
            )}

            {!isSheetLocked && onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer shadow-none ${
                  val
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300 hover:text-amber-100 hover:border-amber-400'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-200 hover:text-white'
                }`}
                title="Browse Full Catalog Window"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{val ? 'Browse Catalog' : 'Catalog'}</span>
              </button>
            )}

            {!isSheetLocked && val && (
              <button
                type="button"
                onClick={() => updateField(fieldId, '')}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!isSheetLocked && (
              <button
                type="button"
                onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  isManual ? 'bg-slate-800 border-amber-500 text-amber-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle custom text input"
              >
                {isManual ? 'Custom' : 'Text'}
              </button>
            )}

            {selectedArchetype && (
              <button
                type="button"
                onClick={() => handleInspectItem(selectedArchetype, browsePath, `Archetype: ${selectedArchetype.name}`)}
                className="p-1 rounded text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title="View entire archetype database entry"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {!isDedicated && selectedArchetype && (
              <button
                type="button"
                onClick={() => toggleCard('archetype')}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? "Collapse summary" : "Expand summary"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Manual Text Edit Field */}
        {!isSheetLocked && isManual && (
          <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Archetype:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => handleArchetypeChange(e.target.value)}
              placeholder="Enter custom archetype concept..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
            />
          </div>
        )}

        {/* Body Content */}
        {selectedArchetype && isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-4 text-xs bg-slate-950/60">
            {/* Top Blueprint Banner & 80 CP Pre-build Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-amber-950/30 to-slate-900/60 border border-amber-500/30 rounded-lg">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-amber-400/90 font-bold block">
                  Core Concept Blueprint
                </span>
                <p className="text-xs font-mono text-slate-300">
                  {selectedArchetype.core_concept || selectedArchetype.summary || selectedArchetype.tactical_role || 'Chassis Blueprint'}
                </p>
              </div>

              {!isSheetLocked && applyArchetypeChassis && (
                <button
                  type="button"
                  onClick={() => applyArchetypeChassis(selectedArchetype)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                  title="Apply 80 CP Archetype Pre-build: +3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Features"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply 80 CP Pre-build</span>
                </button>
              )}
            </div>

            {/* Attributes Specification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Primary Attribute:</span>
                <strong className="text-amber-300 text-sm">{selectedArchetype.primary_attribute || 'Strength'} (+3)</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Secondary Attribute:</span>
                <strong className="text-amber-300 text-sm">{selectedArchetype.secondary_attribute || 'Agility'} (+2)</strong>
              </div>
            </div>

            {/* Archetype Recommended Pathways Dossier */}
            {(recOccs.length > 0 || recOrigins.length > 0 || recFactions.length > 0) && (
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
                  <span>★</span> Recommended Pathways & Synergies
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  {recOccs.length > 0 && (
                    <div className="bg-slate-950/80 p-2.5 rounded border border-amber-900/40 space-y-1.5">
                      <span className="text-sky-400 font-bold uppercase block text-[10px]">Occupations:</span>
                      <div className="flex flex-wrap gap-1">
                        {recOccs.map(occName => {
                          const rawOcc = characterData['char-occu'];
                          const occVal = typeof rawOcc === 'object' ? (rawOcc?.name || rawOcc?.title || '') : String(rawOcc || '');
                          const isCurrent = occVal.toLowerCase().includes(occName.toLowerCase());
                          return (
                            <span
                              key={occName}
                              className={`px-2 py-0.5 rounded text-[10px] border ${
                                isCurrent
                                  ? 'bg-sky-950 border-sky-500 text-sky-200 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {occName} {isCurrent ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {recOrigins.length > 0 && (
                    <div className="bg-slate-950/80 p-2.5 rounded border border-amber-900/40 space-y-1.5">
                      <span className="text-emerald-400 font-bold uppercase block text-[10px]">Origins:</span>
                      <div className="flex flex-wrap gap-1">
                        {recOrigins.map(origName => {
                          const rawOrig = characterData['char-origin'];
                          const origVal = typeof rawOrig === 'object' ? (rawOrig?.name || rawOrig?.title || '') : String(rawOrig || '');
                          const isCurrent = origVal.toLowerCase().includes(origName.toLowerCase());
                          return (
                            <span
                              key={origName}
                              className={`px-2 py-0.5 rounded text-[10px] border ${
                                isCurrent
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {origName} {isCurrent ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {recFactions.length > 0 && (
                    <div className="bg-slate-950/80 p-2.5 rounded border border-amber-900/40 space-y-1.5">
                      <span className="text-purple-400 font-bold uppercase block text-[10px]">Factions:</span>
                      <div className="flex flex-wrap gap-1">
                        {recFactions.map(facName => {
                          const rawFac = characterData['char-faction'];
                          const facVal = typeof rawFac === 'object' ? (rawFac?.name || rawFac?.title || '') : String(rawFac || '');
                          const isCurrent = facVal.toLowerCase().includes(facName.toLowerCase());
                          return (
                            <span
                              key={facName}
                              className={`px-2 py-0.5 rounded text-[10px] border ${
                                isCurrent
                                  ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {facName} {isCurrent ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Essential Skills */}
            {essentialSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                  Essential Skills (Rank 6 Blueprint Options & Selections):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {essentialSkills.map(skName => {
                    const status = getSkillTrainingStatus(skName, characterData);
                    return (
                      <span
                        key={skName}
                        className={`px-2.5 py-1 rounded text-xs font-mono border ${
                          status.isTrained
                            ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 font-bold'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400'
                        }`}
                      >
                        {skName} {status.isTrained ? `[Rank ${status.rank}] ✓` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Signature Features */}
            {signatureFeatures.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                  Signature Features (Options & Selections):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {signatureFeatures.map(fName => {
                    const acquired = getFeatureAcquiredStatus(fName, characterData);
                    return (
                      <span
                        key={fName}
                        className={`px-2.5 py-1 rounded text-xs font-mono border ${
                          acquired
                            ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 font-bold'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400'
                        }`}
                      >
                        {fName} {acquired ? '✓' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedArchetype.description && (
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60 font-sans">
                {selectedArchetype.description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: SPECIES CARD / WORKBENCH
  // ----------------------------------------------------------------------------------
  const renderSpeciesSection = (isDedicated = false) => {
    const fieldId = 'char-species';
    const label = 'Species';
    const browsePath = 'species';
    const val = characterData[fieldId] || '';
    const isManual = Boolean(manualMode[fieldId]);
    const isExpanded = isDedicated || Boolean(expandedCards['species']);
    const inherentFeatures = extractNameList(selectedSpecies?.inherent_features);
    const bonusFeatureChoices = extractNameList(selectedSpecies?.bonus_feature_choices || selectedSpecies?.recommended_features);
    const bonusTraitChoices = extractNameList(selectedSpecies?.bonus_trait_choices || selectedSpecies?.recommended_traits || selectedSpecies?.traits);
    const bonusSkillChoices = extractNameList(selectedSpecies?.bonus_skill_choices);
    const maxTraits = parseInt(selectedSpecies?.bonus_traits || (bonusTraitChoices.length > 0 ? 1 : 0), 10);
    const maxFeats = parseInt(selectedSpecies?.bonus_features || (bonusFeatureChoices.length > 0 ? 1 : 0), 10);
    const attrMods = Array.isArray(selectedSpecies?.inherent_attribute_modifiers) ? selectedSpecies.inherent_attribute_modifiers : [];
    const skillBonuses = Array.isArray(selectedSpecies?.specific_skill_bonuses) ? selectedSpecies.specific_skill_bonuses : [];
    const speciesCost = economyBreakdown?.speciesCostBreakdown || (selectedSpecies ? calculateFullSpeciesCost?.(selectedSpecies, dbOptions) : null);
    const speciesSkillSP = parseInt(selectedSpecies?.bonus_skills || selectedSpecies?.bonus_skill_points || 0, 10);

    return (
      <div className={`bg-slate-950/90 rounded-xl overflow-hidden transition-all ${
        !val
          ? 'border border-cyan-500/60 shadow-[0_0_16px_rgba(34,211,238,0.22)] ring-1 ring-cyan-500/30'
          : 'border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
      } ${isDedicated ? 'p-1' : ''}`}>
        {/* Header Bar */}
        <div
          onClick={() => {
            if (!isDedicated) {
              if (val && selectedSpecies) {
                toggleCard('species');
              } else if (onOpenSelectorModal) {
                onOpenSelectorModal(fieldId, label, browsePath);
              }
            }
          }}
          className={`flex flex-wrap items-center justify-between p-3 select-none transition-colors ${
            !isDedicated ? 'cursor-pointer' : ''
          } ${
            val ? 'bg-cyan-950/20' : 'bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-lg shrink-0">🧬</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shrink-0">
              {label}
            </span>
            {val ? (
              <span className="text-sm font-bold font-mono uppercase text-cyan-400 truncate">
                {val}
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-400/80 italic truncate">
                None Selected <span className="text-cyan-400 font-semibold hidden sm:inline">(Required)</span>
              </span>
            )}
            {speciesCost && speciesCost.totalCost > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-950/80 border border-purple-500/50 text-purple-300 shrink-0">
                {speciesCost.totalCost} CP
              </span>
            )}
            {selectedSpecies?.parent_species && val && (
              <span className="text-xs font-mono text-slate-400 truncate hidden md:inline">
                • Lineage: {selectedSpecies.parent_species}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto mt-1 sm:mt-0" onClick={e => e.stopPropagation()}>
            {/* Inline Quick Selector Dropdown */}
            {!isSheetLocked && !isManual && (
              <div className="relative">
                <select
                  value={val}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-200 text-xs rounded px-2.5 py-1 font-mono outline-none cursor-pointer focus:border-cyan-400"
                  title="Quick select species from list"
                >
                  <option value="">-- Quick Select Species --</option>
                  {(() => {
                    const groups = {};
                    speciesCatalog.forEach(s => {
                      const lin = s.parent_species || s.lineage || 'Independent Xenotypes';
                      if (!groups[lin]) groups[lin] = [];
                      groups[lin].push(s);
                    });
                    return Object.entries(groups).map(([lin, list]) => (
                      <optgroup key={lin} label={lin} className="bg-slate-950 text-slate-200">
                        {list.map(item => (
                          <option key={item.name || item.id} value={item.name || item.id}>
                            {item.name || item.id} {item.type ? `(${Array.isArray(item.type) ? item.type.join('/') : item.type})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>
            )}

            {!isSheetLocked && onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                  val
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/60 text-cyan-200 hover:text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]'
                }`}
                title="Browse Full Catalog Window"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{val ? 'Browse Catalog' : 'Catalog'}</span>
              </button>
            )}

            {!isSheetLocked && val && (
              <button
                type="button"
                onClick={() => updateField(fieldId, '')}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!isSheetLocked && (
              <button
                type="button"
                onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  isManual ? 'bg-slate-800 border-cyan-500 text-cyan-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle custom text input"
              >
                {isManual ? 'Custom' : 'Text'}
              </button>
            )}

            {selectedSpecies && (
              <button
                type="button"
                onClick={() => handleInspectItem(selectedSpecies, browsePath, `Species: ${selectedSpecies.name || selectedSpecies.title}`)}
                className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="View entire species database entry"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {!isDedicated && selectedSpecies && (
              <button
                type="button"
                onClick={() => toggleCard('species')}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? "Collapse summary" : "Expand summary"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Manual Text Edit Field */}
        {!isSheetLocked && isManual && (
          <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Species:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              placeholder="Enter custom species name..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
            />
          </div>
        )}

        {/* Body Content */}
        {selectedSpecies && isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-4 text-xs bg-slate-950/60">
            {/* Real-time Allocation Overview Bar */}
            {speciesAllocationMetrics && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase">
                  <span>🧬</span>
                  <span>Species Allocations:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {speciesAllocationMetrics.bonusAttrPoints > 0 && (
                    <span className={`px-2 py-0.5 rounded border ${
                      speciesAllocationMetrics.allocatedAttrsCount >= speciesAllocationMetrics.bonusAttrPoints
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-amber-950/80 border-amber-500 text-amber-300'
                    }`}>
                      Attributes: {speciesAllocationMetrics.allocatedAttrsCount}/{speciesAllocationMetrics.bonusAttrPoints}
                    </span>
                  )}
                  {speciesAllocationMetrics.maxTraits > 0 && (
                    <span className={`px-2 py-0.5 rounded border ${
                      speciesAllocationMetrics.allocatedTraitsCount >= speciesAllocationMetrics.maxTraits
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-amber-950/80 border-amber-500 text-amber-300'
                    }`}>
                      Traits: {speciesAllocationMetrics.allocatedTraitsCount}/{speciesAllocationMetrics.maxTraits}
                    </span>
                  )}
                  {speciesAllocationMetrics.maxFeats > 0 && (
                    <span className={`px-2 py-0.5 rounded border ${
                      speciesAllocationMetrics.allocatedFeaturesCount >= speciesAllocationMetrics.maxFeats
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-amber-950/80 border-amber-500 text-amber-300'
                    }`}>
                      Features: {speciesAllocationMetrics.allocatedFeaturesCount}/{speciesAllocationMetrics.maxFeats}
                    </span>
                  )}
                  {speciesAllocationMetrics.speciesSkillSP > 0 && (
                    <span className={`px-2 py-0.5 rounded border ${
                      speciesAllocationMetrics.allocatedSPCount >= speciesAllocationMetrics.speciesSkillSP
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-amber-950/80 border-amber-500 text-amber-300'
                    }`}>
                      Skills: {speciesAllocationMetrics.allocatedSPCount}/{speciesAllocationMetrics.speciesSkillSP} SP
                    </span>
                  )}
                  {speciesAllocationMetrics.isComplete && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-200 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Complete
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* In dedicated tab mode, use a 2-column layout: Specs on Left, Allocation Suite on Right */}
            <div className={isDedicated ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "space-y-4"}>
              {/* Left Panel: Specifications & CP Cost Breakdown */}
              <div className={isDedicated ? "lg:col-span-5 space-y-4" : "space-y-3"}>
                {/* Cost Breakdown */}
                {speciesCost && (
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/30 text-[11px] font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-bold uppercase flex items-center gap-1">
                        <span>🧬</span> Component Breakdown:
                      </span>
                      <span className="text-purple-200 font-bold px-2 py-0.5 rounded bg-purple-950/90 border border-purple-500/60">
                        Total: {speciesCost.totalCost} CP
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Type: <strong className="text-purple-300">{speciesCost.breakdown.typeBP} CP</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Size: <strong className="text-purple-300">{speciesCost.breakdown.sizeBP} CP</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Movement: <strong className="text-purple-300">{speciesCost.breakdown.movementBP} CP</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Attributes: <strong className="text-purple-300">{speciesCost.breakdown.attributeBP >= 0 ? `+${speciesCost.breakdown.attributeBP}` : speciesCost.breakdown.attributeBP} CP</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Skills: <strong className="text-purple-300">{speciesCost.breakdown.skillsBP} CP</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Traits: <strong className="text-purple-300">{speciesCost.breakdown.traitsBP} CP</strong>
                      </span>
                      {speciesCost.breakdown.disadvantagesRefund > 0 && (
                        <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-800/60 text-red-300">
                          Disadvantages: <strong>-{speciesCost.breakdown.disadvantagesRefund} CP</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Physiology Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Lineage</span>
                    <strong className="text-cyan-300">{selectedSpecies.parent_species || 'Species'}</strong>
                  </div>
                  {selectedSpecies.type && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Type</span>
                      <strong className="text-cyan-300">{formatList(selectedSpecies.type)}</strong>
                    </div>
                  )}
                  {selectedSpecies.size && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Size</span>
                      <strong className="text-cyan-300">{formatList(selectedSpecies.size)}</strong>
                    </div>
                  )}
                  {selectedSpecies.movement && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Movement</span>
                      <strong className="text-cyan-300">{formatList(selectedSpecies.movement)}</strong>
                    </div>
                  )}
                </div>

                {/* Inherent Attributes */}
                {attrMods.length > 0 && (
                  <div className="text-xs font-mono space-y-1 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-cyan-400 font-bold uppercase block text-[10px]">Inherent Attribute Adjustments:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {attrMods.map((m, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 font-bold">
                          {m.attribute}: {Number(m.bonus) > 0 ? `+${m.bonus}` : m.bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guaranteed Inherent Traits */}
                {inherentFeatures.length > 0 && (
                  <div className="text-xs font-mono space-y-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-cyan-400 font-bold uppercase block text-[10px]">Inherent Guaranteed Traits:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {inherentFeatures.map(featName => (
                        <span key={featName} className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-100 font-semibold flex items-center gap-1.5">
                          <span>🧬</span>
                          <span>{featName} ✓</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Bonuses */}
                {skillBonuses.length > 0 && (
                  <div className="text-xs font-mono space-y-1 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-cyan-400 font-bold uppercase block text-[10px]">Specific Skill Bonuses:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillBonuses.map((sb, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded bg-slate-900 border border-cyan-900/60 text-cyan-300">
                          {sb.skill}: +{sb.bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSpecies.description && (
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60 font-sans">
                    {selectedSpecies.description}
                  </p>
                )}
              </div>

              {/* Right Panel: Allocation Suite Workbench */}
              <div className={isDedicated ? "lg:col-span-7 space-y-4" : "space-y-4 pt-2 border-t border-cyan-900/40"}>
                {/* Interactive Species Bonus Attribute Pool */}
                {(selectedSpecies.bonus_attribute_points > 0 || selectedSpecies.bonus_attribute_choices > 0 || (Array.isArray(selectedSpecies.bonus_attribute_options) && selectedSpecies.bonus_attribute_options.length > 0)) && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-cyan-500/30">
                    <AttributePoolPulldown
                      title="Species Bonus Attribute Pool"
                      maxPoints={parseInt(selectedSpecies.bonus_attribute_points || selectedSpecies.bonus_attribute_choices || 1, 10)}
                      allocatedAttrs={characterData.speciesAllocations?.attributes || {}}
                      onAllocate={(attrId, delta) => allocatePoolAttribute && allocatePoolAttribute('speciesAllocations', attrId, delta, parseInt(selectedSpecies.bonus_attribute_points || selectedSpecies.bonus_attribute_choices || 1, 10))}
                      allowedOptions={selectedSpecies.bonus_attribute_options}
                      colorTheme="cyan"
                    />
                  </div>
                )}

                {/* Interactive Species Trait Choices Multiselect Pulldown */}
                {(bonusTraitChoices.length > 0 || maxTraits > 0) && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-cyan-500/30">
                    <TraitMultiselectPulldown
                      title="Species Trait Choices Pool"
                      categoryLabel="Species Trait"
                      maxSelectable={maxTraits}
                      selectedTraits={characterData.speciesAllocations?.traits || []}
                      recommendedTraits={bonusTraitChoices}
                      allTraits={allCanonicalAndDbTraits}
                      onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('speciesAllocations', tName, tObj, maxTraits)}
                      onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('speciesAllocations', tName)}
                      colorTheme="cyan"
                    />
                  </div>
                )}

                {/* Interactive Species Feature Choices Multiselect Pulldown */}
                {(bonusFeatureChoices.length > 0 && maxFeats > 0) && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-cyan-500/30">
                    <FeatureMultiselectPulldown
                      title="Species Feature Choices Pool"
                      categoryLabel="Species Feature"
                      maxSelectable={maxFeats}
                      selectedFeatures={characterData.speciesAllocations?.features || []}
                      recommendedFeatures={bonusFeatureChoices}
                      allFeatures={dbOptions.features?.length > 0 ? dbOptions.features : DEFAULT_FEATURES}
                      onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('speciesAllocations', fName, fObj, maxFeats)}
                      onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('speciesAllocations', fName)}
                      colorTheme="cyan"
                    />
                  </div>
                )}

                {/* Interactive Species Skill Choices Rank Pulldown */}
                {(() => {
                  if (bonusSkillChoices.length === 0 || speciesSkillSP <= 0) return null;
                  return (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-cyan-500/30">
                      <SkillPoolRankPulldown
                        title="Species Skill Point Pool"
                        categoryLabel="Species Skill"
                        maxSP={speciesSkillSP}
                        allocatedSkills={characterData.speciesAllocations?.skills || {}}
                        recommendedSkills={bonusSkillChoices}
                        allSkills={dbOptions.skills?.length > 0 ? dbOptions.skills : ALL_CANONICAL_SKILLS}
                        onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('speciesAllocations', sName, newRank, delta, speciesSkillSP)}
                        onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('speciesAllocations', sName, 0, 0, speciesSkillSP)}
                        colorTheme="cyan"
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: OCCUPATION CARD / WORKBENCH
  // ----------------------------------------------------------------------------------
  const renderOccupationSection = (isDedicated = false) => {
    const fieldId = 'char-occu';
    const label = 'Occupation';
    const browsePath = 'occupations';
    const val = characterData[fieldId] || '';
    const secOccVal = characterData['char-secondary-occu'] || '';
    const isManual = Boolean(manualMode[fieldId]);
    const isExpanded = isDedicated || Boolean(expandedCards['occupation']);
    const profSkills = extractNameList(selectedOccupation?.professional_skills || selectedOccupation?.skills);

    const commonTraitNames = COMMON_OCCUPATIONAL_TRAITS.map(t => t.name);
    const primaryOccTraits = extractNameList(selectedOccupation?.traits || selectedOccupation?.trait);
    const secondaryOccTraits = extractNameList(selectedSecondaryOccupation?.traits || selectedSecondaryOccupation?.trait);
    const occTraits = Array.from(new Set([...primaryOccTraits, ...commonTraitNames, ...secondaryOccTraits]));
    const occFeatures = extractNameList(selectedOccupation?.features || selectedOccupation?.bonus_features);
    const occMaxFeats = parseInt(selectedOccupation?.bonus_features || (occFeatures.length > 0 ? 1 : 0), 10);
    const occuSP = parseInt(selectedOccupation?.skill_points ?? (profSkills.length > 0 ? 20 : 0), 10);
    const occMaxTraits = parseInt(selectedOccupation?.bonus_traits || selectedOccupation?.bonus_features || 2, 10);

    return (
      <div className={`bg-slate-950/90 rounded-xl overflow-hidden transition-all ${
        !val
          ? 'border border-cyan-500/60 shadow-[0_0_16px_rgba(34,211,238,0.22)] ring-1 ring-cyan-500/30'
          : 'border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.08)]'
      } ${isDedicated ? 'p-1' : ''}`}>
        {/* Header Bar */}
        <div
          onClick={() => {
            if (!isDedicated) {
              if (val && selectedOccupation) {
                toggleCard('occupation');
              } else if (onOpenSelectorModal) {
                onOpenSelectorModal(fieldId, label, browsePath);
              }
            }
          }}
          className={`flex flex-wrap items-center justify-between p-3 select-none transition-colors ${
            !isDedicated ? 'cursor-pointer' : ''
          } ${
            val ? 'bg-sky-950/20' : 'bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-lg shrink-0">🛠️</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-950/80 border border-sky-500/50 text-sky-300 shrink-0">
              {label}
            </span>
            {val ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm font-bold font-mono uppercase text-sky-400 truncate">
                  {val}
                </span>
                {secOccVal && (
                  <span className="text-xs font-mono text-sky-300/80 truncate">
                    (+ {secOccVal})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-400/80 italic truncate">
                None Selected <span className="text-cyan-400 font-semibold hidden sm:inline">(Required)</span>
              </span>
            )}
            {val && (
              <span className="text-xs font-mono text-slate-400 truncate hidden md:inline">
                • {selectedOccupation?.skill_points ? `${selectedOccupation.skill_points} SP Pool` : 'Career'}
                {selectedOccupation?.tech_level !== undefined ? ` (TL ${selectedOccupation.tech_level})` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto mt-1 sm:mt-0" onClick={e => e.stopPropagation()}>
            {/* Inline Quick Selector Dropdown */}
            {!isSheetLocked && !isManual && (
              <div className="relative">
                <select
                  value={val}
                  onChange={(e) => handleOccupationChange(e.target.value)}
                  className="bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-200 text-xs rounded px-2.5 py-1 font-mono outline-none cursor-pointer focus:border-sky-400"
                  title="Quick select occupation from list"
                >
                  <option value="">-- Quick Select Occupation --</option>
                  {(() => {
                    const groups = {};
                    occupationsCatalog.forEach(o => {
                      const f = o.field || o.category_type || (o.tech_level !== undefined ? `Tech Level ${o.tech_level}` : 'General Careers');
                      if (!groups[f]) groups[f] = [];
                      groups[f].push(o);
                    });
                    return Object.entries(groups).map(([grp, list]) => (
                      <optgroup key={grp} label={grp} className="bg-slate-950 text-slate-200">
                        {list.map(item => (
                          <option key={item.name || item.id} value={item.name || item.id}>
                            {item.name || item.id} {item.tech_level !== undefined ? `(TL ${item.tech_level})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>
            )}

            {!isSheetLocked && onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                  val
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-sky-300 hover:text-sky-100 hover:border-sky-400'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/60 text-cyan-200 hover:text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]'
                }`}
                title="Browse Full Catalog Window"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{val ? 'Browse Catalog' : 'Catalog'}</span>
              </button>
            )}

            {!isSheetLocked && val && (
              <button
                type="button"
                onClick={() => updateField(fieldId, '')}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!isSheetLocked && (
              <button
                type="button"
                onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  isManual ? 'bg-slate-800 border-sky-500 text-sky-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle custom text input"
              >
                {isManual ? 'Custom' : 'Text'}
              </button>
            )}

            {selectedOccupation && (
              <button
                type="button"
                onClick={() => handleInspectItem(selectedOccupation, browsePath, `Occupation: ${selectedOccupation.name || selectedOccupation.title}`)}
                className="p-1 rounded text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="View entire occupation database entry"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {!isDedicated && selectedOccupation && (
              <button
                type="button"
                onClick={() => toggleCard('occupation')}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? "Collapse summary" : "Expand summary"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Manual Text Edit Field */}
        {!isSheetLocked && isManual && (
          <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Occupation:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => updateField(fieldId, e.target.value)}
              placeholder="Enter custom occupation name..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-sky-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
            />
          </div>
        )}

        {/* Body Content */}
        {selectedOccupation && isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-4 text-xs bg-slate-950/60">
            {/* Background Occupation Sub-Bar */}
            <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase text-sky-300 shrink-0">
                  Background Career / Dual Training:
                </span>
                {secOccVal ? (
                  <span className="text-xs font-bold text-white truncate">
                    {secOccVal}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic truncate">
                    None (Optional: grants additional career training via Background Trait)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {!isSheetLocked && onOpenSelectorModal && (
                  <button
                    type="button"
                    onClick={() => onOpenSelectorModal('char-secondary-occu', 'Background Occupation', 'occupations')}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border bg-slate-900 hover:bg-slate-800 border-slate-700 text-sky-300 hover:text-sky-100 cursor-pointer"
                  >
                    {secOccVal ? 'Change Background' : '+ Add Background'}
                  </button>
                )}
                {!isSheetLocked && secOccVal && (
                  <button
                    type="button"
                    onClick={() => updateField('char-secondary-occu', '')}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Remove background occupation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Layout: Specifications on Left, Allocation Suite on Right in dedicated mode */}
            <div className={isDedicated ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "space-y-4"}>
              <div className={isDedicated ? "lg:col-span-5 space-y-3" : "space-y-3"}>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Skill Points Pool</span>
                    <strong className="text-sky-300">{selectedOccupation.skill_points || 20} SP</strong>
                  </div>
                  {selectedOccupation.tech_level !== undefined && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Tech Level</span>
                      <strong className="text-sky-300">TL {selectedOccupation.tech_level}</strong>
                    </div>
                  )}
                  {selectedOccupation.field && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[10px]">Professional Field</span>
                      <strong className="text-slate-200">{selectedOccupation.field}</strong>
                    </div>
                  )}
                </div>

                {selectedOccupation.description && (
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60 font-sans">
                    {selectedOccupation.description}
                  </p>
                )}
              </div>

              <div className={isDedicated ? "lg:col-span-7 space-y-4" : "space-y-4"}>
                {/* Professional Skill Package Pool */}
                {profSkills.length > 0 && occuSP > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-sky-500/30">
                    <SkillPoolRankPulldown
                      title="Professional Skill Package Pool"
                      subtitle="Max Rank 11 • Recommended: Rank 6"
                      categoryLabel="Professional Skill"
                      maxSP={occuSP}
                      allocatedSkills={characterData.occuAllocations?.skills || {}}
                      recommendedSkills={profSkills}
                      allSkills={dbOptions.skills?.length > 0 ? dbOptions.skills : ALL_CANONICAL_SKILLS}
                      onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('occuAllocations', sName, newRank, delta, occuSP)}
                      onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('occuAllocations', sName, 0, 0, occuSP)}
                      colorTheme="sky"
                    />
                  </div>
                )}

                {/* Career Traits Pool */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-sky-500/30">
                  <TraitMultiselectPulldown
                    title={`Occupation Career Traits Pool${secOccVal ? ' (Combined with Background)' : ''}`}
                    categoryLabel="Occupational Trait"
                    maxSelectable={occMaxTraits}
                    selectedTraits={characterData.occuAllocations?.traits || []}
                    recommendedTraits={occTraits}
                    allTraits={allCanonicalAndDbTraits}
                    onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('occuAllocations', tName, tObj, occMaxTraits)}
                    onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('occuAllocations', tName)}
                    colorTheme="sky"
                  />
                </div>

                {/* Feature Choices Pool */}
                {occFeatures.length > 0 && occMaxFeats > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-sky-500/30">
                    <FeatureMultiselectPulldown
                      title="Occupation Feature Choices Pool (0 CP Supplemental)"
                      categoryLabel="Occupation Feature"
                      maxSelectable={occMaxFeats}
                      selectedFeatures={characterData.occuAllocations?.features || []}
                      recommendedFeatures={occFeatures}
                      allFeatures={dbOptions.features?.length > 0 ? dbOptions.features : DEFAULT_FEATURES}
                      onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('occuAllocations', fName, fObj, occMaxFeats)}
                      onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('occuAllocations', fName)}
                      colorTheme="sky"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: ORIGIN CARD / WORKBENCH
  // ----------------------------------------------------------------------------------
  const renderOriginSection = (isDedicated = false) => {
    const fieldId = 'char-origin';
    const label = 'Origin';
    const browsePath = 'origins';
    const val = characterData[fieldId] || '';
    const secVal = characterData['char-secondary-origin'] || '';
    const isManual = Boolean(manualMode[fieldId]);
    const isExpanded = isDedicated || Boolean(expandedCards['origin']);

    const socSkills = Array.from(new Set([
      ...extractNameList(selectedOrigin?.society_skills),
      ...extractNameList(selectedSecondaryOrigin?.society_skills)
    ]));

    const origTraits = Array.from(new Set([
      ...extractNameList(selectedOrigin?.traits || selectedOrigin?.trait),
      ...extractNameList(selectedSecondaryOrigin?.traits || selectedSecondaryOrigin?.trait)
    ]));

    const origFeatures = Array.from(new Set([
      ...extractNameList(selectedOrigin?.features || selectedOrigin?.bonus_features),
      ...extractNameList(selectedSecondaryOrigin?.features || selectedSecondaryOrigin?.bonus_features)
    ]));

    const origSP = parseInt(selectedOrigin?.skill_points ?? (socSkills.length > 0 ? 20 : 0), 10);
    const maxOrigTraits = parseInt(selectedOrigin?.bonus_traits || selectedOrigin?.bonus_features || 2, 10);
    const origMaxFeats = parseInt(selectedOrigin?.bonus_features || 0, 10);

    return (
      <div className={`bg-slate-950/90 rounded-xl overflow-hidden transition-all ${
        !val
          ? 'border border-cyan-500/60 shadow-[0_0_16px_rgba(34,211,238,0.22)] ring-1 ring-cyan-500/30'
          : 'border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.08)]'
      } ${isDedicated ? 'p-1' : ''}`}>
        {/* Header Bar */}
        <div
          onClick={() => {
            if (!isDedicated) {
              if (val && selectedOrigin) {
                toggleCard('origin');
              } else if (onOpenSelectorModal) {
                onOpenSelectorModal(fieldId, label, browsePath);
              }
            }
          }}
          className={`flex flex-wrap items-center justify-between p-3 select-none transition-colors ${
            !isDedicated ? 'cursor-pointer' : ''
          } ${
            val ? 'hover:bg-emerald-950/30 bg-emerald-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-lg shrink-0">🌍</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shrink-0">
              {label}
            </span>
            {val ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm font-bold font-mono uppercase text-emerald-400 truncate">
                  {val}
                </span>
                {secVal && (
                  <span className="text-xs font-mono text-emerald-300/80 truncate">
                    (+ {secVal})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-400/80 italic truncate">
                None Selected <span className="text-cyan-400 font-semibold hidden sm:inline">(Required)</span>
              </span>
            )}
            {val && (
              <span className="text-xs font-mono text-slate-400 truncate hidden md:inline">
                • {selectedOrigin?.skill_points ? `${selectedOrigin.skill_points} SP Society Pool` : 'Homeworld'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto mt-1 sm:mt-0" onClick={e => e.stopPropagation()}>
            {/* Inline Quick Selector Dropdown */}
            {!isSheetLocked && !isManual && (
              <div className="relative">
                <select
                  value={val}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  className="bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-200 text-xs rounded px-2.5 py-1 font-mono outline-none cursor-pointer focus:border-emerald-400"
                  title="Quick select origin from list"
                >
                  <option value="">-- Quick Select Origin --</option>
                  {(() => {
                    const groups = {};
                    originsCatalog.forEach(o => {
                      const hab = o.habitat || o.origin_type || 'Homeworlds';
                      if (!groups[hab]) groups[hab] = [];
                      groups[hab].push(o);
                    });
                    return Object.entries(groups).map(([grp, list]) => (
                      <optgroup key={grp} label={grp} className="bg-slate-950 text-slate-200">
                        {list.map(item => (
                          <option key={item.name || item.id} value={item.name || item.id}>
                            {item.name || item.id} {item.habitat ? `(${item.habitat})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>
            )}

            {!isSheetLocked && onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                  val
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-300 hover:text-emerald-100 hover:border-emerald-400'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/60 text-cyan-200 hover:text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]'
                }`}
                title="Browse Full Catalog Window"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{val ? 'Browse Catalog' : 'Catalog'}</span>
              </button>
            )}

            {!isSheetLocked && val && (
              <button
                type="button"
                onClick={() => updateField(fieldId, '')}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!isSheetLocked && (
              <button
                type="button"
                onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  isManual ? 'bg-slate-800 border-emerald-500 text-emerald-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle custom text input"
              >
                {isManual ? 'Custom' : 'Text'}
              </button>
            )}

            {selectedOrigin && (
              <button
                type="button"
                onClick={() => handleInspectItem(selectedOrigin, browsePath, `Origin: ${selectedOrigin.name || selectedOrigin.title}`)}
                className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="View entire origin database entry"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {!isDedicated && selectedOrigin && (
              <button
                type="button"
                onClick={() => toggleCard('origin')}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? "Collapse summary" : "Expand summary"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Manual Text Edit Field */}
        {!isSheetLocked && isManual && (
          <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Origin:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => updateField(fieldId, e.target.value)}
              placeholder="Enter custom origin homeworld name..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
            />
          </div>
        )}

        {/* Body Content */}
        {selectedOrigin && isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-4 text-xs bg-slate-950/60">
            {/* Secondary Origin Sub-Bar */}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-300 shrink-0">
                  Secondary Origin / Diaspora:
                </span>
                {secVal ? (
                  <span className="text-xs font-bold text-white truncate">
                    {secVal}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic truncate">
                    None (Optional: expands society skill & trait choices without extra points)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {!isSheetLocked && onOpenSelectorModal && (
                  <button
                    type="button"
                    onClick={() => onOpenSelectorModal('char-secondary-origin', 'Secondary Origin', 'origins')}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-300 hover:text-emerald-100 cursor-pointer"
                  >
                    {secVal ? 'Change Secondary' : '+ Add Secondary'}
                  </button>
                )}
                {!isSheetLocked && secVal && (
                  <button
                    type="button"
                    onClick={() => updateField('char-secondary-origin', '')}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Remove secondary origin"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Layout: Specifications on Left, Allocation Suite on Right in dedicated mode */}
            <div className={isDedicated ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "space-y-4"}>
              <div className={isDedicated ? "lg:col-span-5 space-y-3" : "space-y-3"}>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Society Skill Points</span>
                    <strong className="text-emerald-300">{selectedOrigin.skill_points || 20} SP</strong>
                  </div>
                  {selectedOrigin.habitat && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Habitat</span>
                      <strong className="text-emerald-300">{selectedOrigin.habitat}</strong>
                    </div>
                  )}
                </div>

                {selectedOrigin.description && (
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60 font-sans">
                    {selectedOrigin.description}
                  </p>
                )}
              </div>

              <div className={isDedicated ? "lg:col-span-7 space-y-4" : "space-y-4"}>
                {/* Society Skills Pool */}
                {socSkills.length > 0 && origSP > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30">
                    <SkillPoolRankPulldown
                      title={`Society Skill Point Pool${secVal ? ' (Combined)' : ''}`}
                      categoryLabel="Society Skill"
                      maxSP={origSP}
                      allocatedSkills={characterData.originAllocations?.skills || {}}
                      recommendedSkills={socSkills}
                      allSkills={dbOptions.skills?.length > 0 ? dbOptions.skills : ALL_CANONICAL_SKILLS}
                      onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('originAllocations', sName, newRank, delta, origSP)}
                      onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('originAllocations', sName, 0, 0, origSP)}
                      colorTheme="emerald"
                    />
                  </div>
                )}

                {/* Homeworld Traits Pool */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30">
                  <TraitMultiselectPulldown
                    title={`Origin Homeworld Traits Pool${secVal ? ' (Combined)' : ''}`}
                    categoryLabel="Origin Trait"
                    maxSelectable={maxOrigTraits}
                    selectedTraits={characterData.originAllocations?.traits || []}
                    recommendedTraits={origTraits}
                    allTraits={allCanonicalAndDbTraits}
                    onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('originAllocations', tName, tObj, maxOrigTraits)}
                    onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('originAllocations', tName)}
                    colorTheme="emerald"
                  />
                </div>

                {/* Bonus Features Pool */}
                {origFeatures.length > 0 && origMaxFeats > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30">
                    <FeatureMultiselectPulldown
                      title="Origin Bonus Features"
                      categoryLabel="Origin Feature"
                      maxSelectable={origMaxFeats}
                      selectedFeatures={characterData.originAllocations?.features || []}
                      recommendedFeatures={origFeatures}
                      allFeatures={dbOptions.features?.length > 0 ? dbOptions.features : DEFAULT_FEATURES}
                      onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('originAllocations', fName, fObj, origMaxFeats)}
                      onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('originAllocations', fName)}
                      colorTheme="emerald"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: FACTION CARD / WORKBENCH
  // ----------------------------------------------------------------------------------
  const renderFactionSection = (isDedicated = false) => {
    const fieldId = 'char-faction';
    const label = 'Faction';
    const browsePath = 'factions';
    const val = characterData[fieldId] || '';
    const isManual = Boolean(manualMode[fieldId]);
    const isExpanded = isDedicated || Boolean(expandedCards['faction']);
    const pkgSkills = extractNameList(selectedFaction?.skill_package || selectedFaction?.skills);
    const factionTraits = extractNameList(selectedFaction?.traits || selectedFaction?.trait);
    const maxTraits = parseInt(selectedFaction?.bonus_traits || (factionTraits.length > 0 ? 1 : 0), 10);
    const facSP = parseInt(selectedFaction?.skill_points || (pkgSkills.length > 0 ? 20 : 0), 10);
    const facMaxFeats = parseInt(selectedFaction?.bonus_features || (factionBenefits.length > 0 ? 1 : 0), 10);

    return (
      <div className={`bg-slate-950/90 rounded-xl overflow-hidden transition-all ${
        !val
          ? 'border border-cyan-500/60 shadow-[0_0_16px_rgba(34,211,238,0.22)] ring-1 ring-cyan-500/30'
          : 'border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.08)]'
      } ${isDedicated ? 'p-1' : ''}`}>
        {/* Header Bar */}
        <div
          onClick={() => {
            if (!isDedicated) {
              if (val && selectedFaction) {
                toggleCard('faction');
              } else if (onOpenSelectorModal) {
                onOpenSelectorModal(fieldId, label, browsePath);
              }
            }
          }}
          className={`flex flex-wrap items-center justify-between p-3 select-none transition-colors ${
            !isDedicated ? 'cursor-pointer' : ''
          } ${
            val ? 'hover:bg-purple-950/30 bg-purple-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-lg shrink-0">🏛️</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-500/50 text-purple-300 shrink-0">
              {label}
            </span>
            {val ? (
              <span className="text-sm font-bold font-mono uppercase text-purple-400 truncate">
                {val}
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-400/80 italic truncate">
                None Selected <span className="text-cyan-400 font-semibold hidden sm:inline">(Required)</span>
              </span>
            )}
            {val && (
              <span className="text-xs font-mono text-slate-400 truncate hidden md:inline">
                • {selectedFaction?.archetype || selectedFaction?.faction_type || 'Allegiance'}
                {selectedFaction?.tech_level !== undefined ? ` (TL ${selectedFaction.tech_level})` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto mt-1 sm:mt-0" onClick={e => e.stopPropagation()}>
            {/* Inline Quick Selector Dropdown */}
            {!isSheetLocked && !isManual && (
              <div className="relative">
                <select
                  value={val}
                  onChange={(e) => handleFactionChange(e.target.value)}
                  className="bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-200 text-xs rounded px-2.5 py-1 font-mono outline-none cursor-pointer focus:border-purple-400"
                  title="Quick select faction from list"
                >
                  <option value="">-- Quick Select Faction --</option>
                  {(() => {
                    const groups = {};
                    factionsCatalog.forEach(f => {
                      const c = f.faction_classification || f.faction_type || 'Factions & Organizations';
                      if (!groups[c]) groups[c] = [];
                      groups[c].push(f);
                    });
                    return Object.entries(groups).map(([grp, list]) => (
                      <optgroup key={grp} label={grp} className="bg-slate-950 text-slate-200">
                        {list.map(item => (
                          <option key={item.name || item.id} value={item.name || item.id}>
                            {item.name || item.id} {item.tech_level !== undefined ? `(TL ${item.tech_level})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>
            )}

            {!isSheetLocked && onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                  val
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-purple-300 hover:text-purple-100 hover:border-purple-400'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/60 text-cyan-200 hover:text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]'
                }`}
                title="Browse Full Catalog Window"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{val ? 'Browse Catalog' : 'Catalog'}</span>
              </button>
            )}

            {!isSheetLocked && val && (
              <button
                type="button"
                onClick={() => updateField(fieldId, '')}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!isSheetLocked && (
              <button
                type="button"
                onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  isManual ? 'bg-slate-800 border-purple-500 text-purple-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle custom text input"
              >
                {isManual ? 'Custom' : 'Text'}
              </button>
            )}

            {selectedFaction && (
              <button
                type="button"
                onClick={() => handleInspectItem(selectedFaction, browsePath, `Faction: ${selectedFaction.name || selectedFaction.title}`)}
                className="p-1 rounded text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                title="View entire faction database entry"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {!isDedicated && selectedFaction && (
              <button
                type="button"
                onClick={() => toggleCard('faction')}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? "Collapse summary" : "Expand summary"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Manual Text Edit Field */}
        {!isSheetLocked && isManual && (
          <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Faction:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => updateField(fieldId, e.target.value)}
              placeholder="Enter custom faction allegiance name..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
            />
          </div>
        )}

        {/* Body Content */}
        {selectedFaction && isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-4 text-xs bg-slate-950/60">
            {/* Driving Mandate Banner */}
            {(selectedFaction.driving_mandate || selectedFaction.mandate) && (
              <div className="text-xs text-slate-200 italic font-serif bg-purple-950/40 p-3 rounded-lg border border-purple-500/40">
                <span className="text-purple-400 not-italic font-bold font-mono text-[10px] uppercase block mb-1">
                  Driving Mandate:
                </span>
                "{selectedFaction.driving_mandate || selectedFaction.mandate}"
              </div>
            )}

            {/* Layout: Sociological Profile on Left, Allocation Suite on Right */}
            <div className={isDedicated ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "space-y-4"}>
              <div className={isDedicated ? "lg:col-span-5 space-y-3" : "space-y-3"}>
                {/* Sociological profile */}
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-purple-400 font-bold uppercase block text-[10px]">
                    Sociological & Strategic Dossier
                  </span>
                  {selectedFaction.core_beliefs && (
                    <div>
                      <span className="text-slate-400 text-[10px] block">Core Beliefs:</span>
                      <p className="text-slate-300">{selectedFaction.core_beliefs}</p>
                    </div>
                  )}
                  {selectedFaction.social_structure && (
                    <div>
                      <span className="text-slate-400 text-[10px] block">Social Structure:</span>
                      <p className="text-slate-300">{selectedFaction.social_structure}</p>
                    </div>
                  )}
                </div>

                {/* Hindrances & Restrictions */}
                {factionHindrances.length > 0 && (
                  <div className="text-xs font-mono space-y-1.5 bg-rose-950/20 p-3 rounded-lg border border-rose-900/40">
                    <span className="text-rose-400 font-bold uppercase block text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Hindrances & Restrictions:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {factionHindrances.map((hind, idx) => {
                        const active = hind.startsWith('[Gained]') || getDisadvantageActiveStatus(hind, characterData);
                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded text-xs font-mono border ${
                              active
                                ? 'bg-rose-950/90 border-rose-400 text-rose-100 font-bold shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                                : 'bg-slate-900/80 border-slate-800 text-slate-400'
                            }`}
                          >
                            {hind} {active ? '⚠' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedFaction.description && (
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60 font-sans">
                    {selectedFaction.description}
                  </p>
                )}
              </div>

              <div className={isDedicated ? "lg:col-span-7 space-y-4" : "space-y-4"}>
                {/* Skill Package Pool */}
                {pkgSkills.length > 0 && facSP > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-500/30">
                    <SkillPoolRankPulldown
                      title="Faction Skill Package Pool"
                      categoryLabel="Faction Skill"
                      maxSP={facSP}
                      allocatedSkills={characterData.factionAllocations?.skills || {}}
                      recommendedSkills={pkgSkills}
                      allSkills={dbOptions.skills?.length > 0 ? dbOptions.skills : ALL_CANONICAL_SKILLS}
                      onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('factionAllocations', sName, newRank, delta, facSP)}
                      onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('factionAllocations', sName, 0, 0, facSP)}
                      colorTheme="purple"
                    />
                  </div>
                )}

                {/* Features & Benefits Pool */}
                {factionBenefits.length > 0 && facMaxFeats > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-500/30">
                    <FeatureMultiselectPulldown
                      title="Faction Features & Benefits Pool"
                      categoryLabel="Faction Feature"
                      maxSelectable={facMaxFeats}
                      selectedFeatures={characterData.factionAllocations?.features || []}
                      recommendedFeatures={factionBenefits.length > 0 ? factionBenefits : (selectedFaction.features || selectedFaction.bonus_features || selectedFaction.benefits || [])}
                      allFeatures={dbOptions.features?.length > 0 ? dbOptions.features : DEFAULT_FEATURES}
                      onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('factionAllocations', fName, fObj, facMaxFeats)}
                      onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('factionAllocations', fName)}
                      colorTheme="purple"
                    />
                  </div>
                )}

                {/* Traits Pool */}
                {maxTraits > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-500/30">
                    <TraitMultiselectPulldown
                      title="Faction Traits Pool"
                      categoryLabel="Faction Trait"
                      maxSelectable={maxTraits}
                      selectedTraits={characterData.factionAllocations?.traits || []}
                      recommendedTraits={factionTraits}
                      allTraits={allCanonicalAndDbTraits}
                      onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('factionAllocations', tName, tObj, maxTraits)}
                      onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('factionAllocations', tName)}
                      colorTheme="purple"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: BIO & EXECUTIVE DOSSIER
  // ----------------------------------------------------------------------------------
  const renderBioSection = () => {
    const creatorInfo = extractCreatorInfo(characterData, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '');
    const ownerHandle = creatorInfo.creatorTag || (typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '') || 'Local Operative';

    return (
      <div className="space-y-4">
        <FolioInput
          id="char-name"
          label="Character Name"
          value={characterData['char-name'] || ''}
          onChange={updateField}
          placeholder="Enter Character Name..."
        />

        <FolioInput
          id="char-concept"
          label="Concept"
          value={characterData['char-concept'] || ''}
          onChange={updateField}
          placeholder="Enter Character Concept..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FolioInput
            id="char-age"
            label="Age"
            value={characterData['char-age'] || ''}
            onChange={updateField}
            placeholder="28"
          />

          <FolioInput
            id="char-gender"
            label="Gender"
            value={characterData['char-gender'] || ''}
            onChange={updateField}
            placeholder="Non-Binary / Female / Male"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FolioInput
            id="char-height"
            label="Height"
            value={characterData['char-height'] || ''}
            onChange={updateField}
            onBlur={(id, val) => {
              const formatted = formatHeightWithConversion(val);
              if (formatted !== val) {
                updateField(id, formatted);
              }
            }}
            placeholder="e.g. 5'11&quot; or 1.80m"
            rightLabel={
              (() => {
                const val = characterData['char-height'] || '';
                const conv = getHeightConversion(val);
                if (conv && !val.includes(`[${conv}]`)) {
                  return `≈ [${conv}]`;
                }
                return null;
              })()
            }
          />

          <FolioInput
            id="char-weight"
            label="Weight"
            value={characterData['char-weight'] || ''}
            onChange={updateField}
            onBlur={(id, val) => {
              const formatted = formatWeightWithConversion(val);
              if (formatted !== val) {
                updateField(id, formatted);
              }
            }}
            placeholder="e.g. 180 lbs or 82kg"
            rightLabel={
              (() => {
                const val = characterData['char-weight'] || '';
                const conv = getWeightConversion(val);
                if (conv && !val.includes(`[${conv}]`)) {
                  return `≈ [${conv}]`;
                }
                return null;
              })()
            }
          />
        </div>

        <FolioInput
          id="char-style"
          label="Description / Style"
          type="textarea"
          value={characterData['char-style'] || ''}
          onChange={updateField}
          placeholder="Physical features, clothing style, distinctive markings..."
        />

        <FolioInput
          id="char-motive"
          label="Personality / Motive"
          type="textarea"
          value={characterData['char-motive'] || ''}
          onChange={updateField}
          placeholder="Personal goals, flaws, motivations, quirks..."
        />

        {/* Owner Handle Identification */}
        <div className="pt-3 pb-1 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Owner Handle:</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700/80 text-cyan-300 rounded text-xs font-mono font-bold">
            @{ownerHandle.replace(/^@/, '')}
          </span>
        </div>
      </div>
    );
  };

  const renderExecutiveDossier = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Identity Pillars Matrix
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Select a pillar to configure & allocate
          </span>
        </div>

        {/* 5 Pillar Summary Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Archetype Summary Card */}
          <div 
            onClick={() => setActiveSubTab('archetype')}
            className="p-3 bg-slate-900/60 hover:bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/70 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-500/50 text-amber-300">
                  Archetype
                </span>
                <span className="text-xs font-bold font-mono uppercase text-amber-300">
                  {characterData['char-archetype'] || 'None Selected (Optional)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-amber-300 text-xs font-mono">
                <span>Configure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            {selectedArchetype && (
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                {selectedArchetype.core_concept || selectedArchetype.summary || selectedArchetype.tactical_role}
              </p>
            )}
          </div>

          {/* Species Summary Card */}
          <div 
            onClick={() => setActiveSubTab('species')}
            className={`p-3 bg-slate-900/60 hover:bg-slate-900/90 border rounded-xl transition-all cursor-pointer group ${
              !characterData['char-species']
                ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                : 'border-cyan-500/30 hover:border-cyan-500/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🧬</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                  Species
                </span>
                <span className="text-xs font-bold font-mono uppercase text-cyan-300">
                  {characterData['char-species'] || 'Required — Not Selected'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-cyan-300 text-xs font-mono">
                {speciesAllocationMetrics?.isComplete ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : characterData['char-species'] ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[10px]">
                    Pending Allocation
                  </span>
                ) : null}
                <span>Configure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            {selectedSpecies && (
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 mt-1">
                <span>Lineage: <strong className="text-cyan-200">{selectedSpecies.parent_species || 'Species'}</strong></span>
                {selectedSpecies.size && <span>• Size: <strong className="text-cyan-200">{formatList(selectedSpecies.size)}</strong></span>}
                {selectedSpecies.movement && <span>• Movement: <strong className="text-cyan-200">{formatList(selectedSpecies.movement)}</strong></span>}
              </div>
            )}
          </div>

          {/* Occupation Summary Card */}
          <div 
            onClick={() => setActiveSubTab('occupation')}
            className={`p-3 bg-slate-900/60 hover:bg-slate-900/90 border rounded-xl transition-all cursor-pointer group ${
              !characterData['char-occu']
                ? 'border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
                : 'border-sky-500/30 hover:border-sky-500/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🛠️</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-sky-950/80 border border-sky-500/50 text-sky-300">
                  Occupation
                </span>
                <span className="text-xs font-bold font-mono uppercase text-sky-300">
                  {characterData['char-occu'] || 'Required — Not Selected'}
                </span>
                {characterData['char-secondary-occu'] && (
                  <span className="text-[10px] font-mono text-sky-400/80">
                    (+ {characterData['char-secondary-occu']})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-sky-300 text-xs font-mono">
                {occuAllocationMetrics?.isComplete ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : characterData['char-occu'] ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[10px]">
                    Pending Allocation
                  </span>
                ) : null}
                <span>Configure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            {selectedOccupation && (
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                {selectedOccupation.field ? `${selectedOccupation.field} • ` : ''}
                {selectedOccupation.skill_points ? `${selectedOccupation.skill_points} SP Package` : 'Standard Package'}
              </p>
            )}
          </div>

          {/* Origin Summary Card */}
          <div 
            onClick={() => setActiveSubTab('origin')}
            className={`p-3 bg-slate-900/60 hover:bg-slate-900/90 border rounded-xl transition-all cursor-pointer group ${
              !characterData['char-origin']
                ? 'border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'border-emerald-500/30 hover:border-emerald-500/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🌍</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                  Origin
                </span>
                <span className="text-xs font-bold font-mono uppercase text-emerald-300">
                  {characterData['char-origin'] || 'Required — Not Selected'}
                </span>
                {characterData['char-secondary-origin'] && (
                  <span className="text-[10px] font-mono text-emerald-400/80">
                    (+ {characterData['char-secondary-origin']})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-emerald-300 text-xs font-mono">
                {originAllocationMetrics?.isComplete ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : characterData['char-origin'] ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[10px]">
                    Pending Allocation
                  </span>
                ) : null}
                <span>Configure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            {selectedOrigin && (
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                {selectedOrigin.habitat ? `${selectedOrigin.habitat} • ` : ''}
                {selectedOrigin.skill_points ? `${selectedOrigin.skill_points} SP Society Pool` : 'Standard Homeworld'}
              </p>
            )}
          </div>

          {/* Faction Summary Card */}
          <div 
            onClick={() => setActiveSubTab('faction')}
            className={`p-3 bg-slate-900/60 hover:bg-slate-900/90 border rounded-xl transition-all cursor-pointer group ${
              !characterData['char-faction']
                ? 'border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'border-purple-500/30 hover:border-purple-500/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-500/50 text-purple-300">
                  Faction
                </span>
                <span className="text-xs font-bold font-mono uppercase text-purple-300">
                  {characterData['char-faction'] || 'Required — Not Selected'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-purple-300 text-xs font-mono">
                {factionAllocationMetrics?.isComplete ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : characterData['char-faction'] ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[10px]">
                    Pending Allocation
                  </span>
                ) : null}
                <span>Configure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            {selectedFaction && (
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                {selectedFaction.driving_mandate || selectedFaction.mandate || selectedFaction.faction_classification || 'Allegiance'}
              </p>
            )}
          </div>
        </div>

        {/* Action Button: Proceed to Archetype */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('archetype')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-cyan-300 hover:text-cyan-100 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Proceed to Step 2: Archetype</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-5 pb-24">
      {/* High-Tech Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 sticky top-0 z-20 shadow-md">
        {SUB_TABS.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? `${tab.activeClass} border`
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight ${tab.badgeClass}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: BIO & DOSSIER */}
      {activeSubTab === 'bio' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Left Column: Bio Details */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Operative Profile
              </span>
            </div>
            {renderBioSection()}
          </div>

          {/* Right Column: Executive Dossier & Matrix Summary */}
          <div>
            {renderExecutiveDossier()}
          </div>
        </section>
      )}

      {/* SUBTAB 2: ARCHETYPE */}
      {activeSubTab === 'archetype' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          {renderArchetypeSection(true)}
          {/* Guided Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('bio')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Bio & Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('species')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              <span>Proceed to Species →</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* SUBTAB 3: SPECIES */}
      {activeSubTab === 'species' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          {renderSpeciesSection(true)}
          {/* Guided Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('archetype')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Archetype</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('occupation')}
              className="px-3.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-500/70 text-sky-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(14,165,233,0.2)]"
            >
              <span>Proceed to Occupation →</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* SUBTAB 4: OCCUPATION */}
      {activeSubTab === 'occupation' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          {renderOccupationSection(true)}
          {/* Guided Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('species')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Species</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('origin')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <span>Proceed to Origin →</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* SUBTAB 5: ORIGIN */}
      {activeSubTab === 'origin' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          {renderOriginSection(true)}
          {/* Guided Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('occupation')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Occupation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('faction')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/70 text-purple-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            >
              <span>Proceed to Faction →</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* SUBTAB 6: FACTION */}
      {activeSubTab === 'faction' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          {renderFactionSection(true)}
          {/* Guided Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('origin')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Origin</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('bio')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/60 text-cyan-200 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review Full Bio & Dossier →</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* SUBTAB 7: ALL PILLARS (CLASSIC VIEW) */}
      {activeSubTab === 'all' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Left Column: Bio Details */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Operative Profile
              </span>
            </div>
            {renderBioSection()}
          </div>

          {/* Right Column: All 5 Selection Cards Stacked */}
          <div className="space-y-4">
            {renderArchetypeSection(false)}
            {renderSpeciesSection(false)}
            {renderOccupationSection(false)}
            {renderOriginSection(false)}
            {renderFactionSection(false)}
          </div>
        </section>
      )}

      {/* Comprehensive Full Database Entry Inspector Modal */}
      {inspectItem && (
        <div 
          className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 md:pt-16 pb-12 overflow-y-auto select-none font-sans"
          onClick={() => setInspectItem(null)}
        >
          <div 
            className="bg-slate-900 border border-cyan-500/60 rounded-xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                    {inspectItem.categoryKey}
                  </span>
                  {inspectItem.item.id && (
                    <span className="text-[10px] font-mono text-slate-500">
                      #{inspectItem.item.id}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
                  <span>{inspectItem.item.name || inspectItem.item.title || inspectItem.title}</span>
                </h2>
                {inspectItem.item.parent_species && (
                  <p className="text-xs text-cyan-400/90 font-mono">
                    Lineage: {inspectItem.item.parent_species}
                  </p>
                )}
                {inspectItem.item.sphere && (
                  <p className="text-xs text-amber-400/90 font-mono">
                    Sphere: {inspectItem.item.sphere}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onOpenAssetModal && (
                  <button
                    type="button"
                    onClick={() => {
                      const itemToEdit = inspectItem.item;
                      const colKey = inspectItem.categoryKey;
                      const modalTitle = inspectItem.title;
                      setInspectItem(null);
                      onOpenAssetModal(colKey, modalTitle, 'edit', null, itemToEdit);
                    }}
                    className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-amber-500/60 text-amber-300 hover:text-amber-100 transition-all flex items-center gap-1 cursor-pointer"
                    title="Edit database record"
                  >
                    <span>✏️</span>
                    <span className="hidden sm:inline">Edit in Database</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-300">
              {/* Quote / Mandate */}
              {(inspectItem.item.quote || inspectItem.item.driving_mandate || inspectItem.item.mandate) && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 text-cyan-200 italic font-serif text-sm">
                  "{inspectItem.item.quote || inspectItem.item.driving_mandate || inspectItem.item.mandate}"
                </div>
              )}

              {/* Specification Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                {inspectItem.item.tech_level !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Tech Level</span>
                    <strong className="text-slate-200 font-mono">TL {inspectItem.item.tech_level}</strong>
                  </div>
                )}
                {inspectItem.item.meta_level !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Meta Level</span>
                    <strong className="text-slate-200 font-mono">ML {inspectItem.item.meta_level}</strong>
                  </div>
                )}
                {inspectItem.item.skill_points !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Skill Points</span>
                    <strong className="text-cyan-300 font-mono">{inspectItem.item.skill_points} SP</strong>
                  </div>
                )}
                {inspectItem.item.capital_world && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Capital World</span>
                    <strong className="text-slate-200">{inspectItem.item.capital_world}</strong>
                  </div>
                )}
                {inspectItem.item.archetype && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 block uppercase">Archetype / Focus</span>
                    <strong className="text-amber-300">{inspectItem.item.archetype}</strong>
                  </div>
                )}
              </div>

              {/* Lore / Description */}
              {(inspectItem.item.description || inspectItem.item.body || inspectItem.item.summary) && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
                    Comprehensive Dossier & Lore
                  </h4>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed whitespace-pre-line text-slate-300">
                    {inspectItem.item.description || inspectItem.item.body || inspectItem.item.summary}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {(() => {
                const allSkills = extractNameList(
                  inspectItem.item.professional_skills || 
                  inspectItem.item.society_skills || 
                  inspectItem.item.skill_package || 
                  inspectItem.item.essential_skills || 
                  inspectItem.item.bonus_skill_choices || 
                  inspectItem.item.skills
                );
                if (allSkills.length === 0) return null;

                return (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-emerald-400">
                      Associated Skills ({allSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allSkills.map(sk => {
                        const status = getSkillTrainingStatus(sk, characterData);
                        return (
                          <span 
                            key={sk}
                            className={`px-2.5 py-1 rounded text-xs font-mono border ${
                              status.isTrained
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {sk} {status.isTrained ? `[Trained Rank ${status.rank}] ✓` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Traits & Features Section */}
              {(() => {
                const allTraits = extractNameList(
                  inspectItem.item.inherent_features || 
                  inspectItem.item.signature_features || 
                  inspectItem.item.bonus_feature_choices || 
                  inspectItem.item.traits || 
                  inspectItem.item.trait || 
                  inspectItem.item.bonus_features || 
                  inspectItem.item.features
                );
                if (allTraits.length === 0) return null;

                return (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-amber-400">
                      Features, Traits & Bonuses ({allTraits.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allTraits.map(t => {
                        const acquired = getFeatureAcquiredStatus(t, characterData);
                        const tTitle = normalizeTraitName(t);
                        return (
                          <span 
                            key={tTitle}
                            className={`px-2.5 py-1 rounded text-xs font-mono border ${
                              acquired
                                ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {tTitle} {acquired ? '✓' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Faction Sociological Profile */}
              {inspectItem.categoryKey === 'factions' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-purple-400">
                    Sociological & Strategic Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {inspectItem.item.core_beliefs && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-purple-400 font-bold block mb-0.5">Core Beliefs:</span>
                        <p className="text-slate-300">{inspectItem.item.core_beliefs}</p>
                      </div>
                    )}
                    {inspectItem.item.social_structure && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-purple-400 font-bold block mb-0.5">Social Structure:</span>
                        <p className="text-slate-300">{inspectItem.item.social_structure}</p>
                      </div>
                    )}
                    {inspectItem.item.social_strengths && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-emerald-400 font-bold block mb-0.5">Social Strengths:</span>
                        <p className="text-slate-300">{inspectItem.item.social_strengths}</p>
                      </div>
                    )}
                    {inspectItem.item.social_weaknesses && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-rose-400 font-bold block mb-0.5">Social Weaknesses:</span>
                        <p className="text-slate-300">{inspectItem.item.social_weaknesses}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mechanics & Rules Notes */}
              {(inspectItem.item.mechanic || inspectItem.item.note) && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
                    Mechanics & System Rules
                  </h4>
                  <p className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-slate-300 leading-relaxed font-mono text-[11px]">
                    {inspectItem.item.mechanic || inspectItem.item.note}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 shrink-0">
              <span className="font-mono text-[10px]">
                {inspectItem.item.id ? `Record ID: ${inspectItem.item.id}` : 'Canonical Record'}
              </span>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(IdentityTab);
