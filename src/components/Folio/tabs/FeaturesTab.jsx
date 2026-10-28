import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { useDice } from '../../../context/DiceContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { AudioService } from '../../../services/audioService';
import { 
  Sparkles, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Lock, 
  BookOpen, 
  Dices, 
  Search, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  Info,
  ArrowUpDown,
  Repeat,
  TrendingUp,
  Shuffle,
  Target
} from 'lucide-react';
import FolioTooltip from '../shared/FolioTooltip';
import SkillChoiceSelector from '../shared/SkillChoiceSelector';
import { checkPrerequisite } from '../../../utils/prerequisiteEvaluator';
import { enrichItemWithModifiers } from '../../../engines/tangentModifierEngine';
import AugmentationsManager from '../augmentations/AugmentationsManager';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';
import { DEFAULT_OCCUPATIONS } from '../../../data/occupationsData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_ORIGINS } from '../../../data/originsData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { DEFAULT_FEATURES, getEnrichedFeatureData } from '../../../data/featuresData';
import { 
  ALL_CANONICAL_TRAITS,
  SPECIES_TRAITS_BASIC,
  SPECIES_TRAITS_ADVANCED,
  SPECIES_TRAITS_ELITE,
  OCCUPATIONAL_TRAITS,
  ORIGIN_TRAITS,
  getEnrichedTraitData
} from '../../../data/speciesTraitsData';
import { DEFAULT_INVOCATIONS, getEnrichedInvocationData } from '../../../data/invocationsData';
import { getEnrichedHindranceData } from '../../../data/speciesDisadvantagesData';
import { formatSpeciesTrait, getInherentSpeciesTraits } from '../../../utils/speciesDisplayUtils';
import { METAPHYSICAL_DISCIPLINES, SKILL_CATEGORY_SECTIONS } from '../../../data/skillsData';
import { resolveCatalogItem } from '../../../engines/tangentIdentityEngine';
import { getCanonicalTraitCost, formatGrantedCost } from '../../../engines/tangentEntityEngines';
import { determineAugmentationStage } from '../../../engines/tangentComplexEngines';
import {
  extractPillarFeatureSets,
  getPillarFeatureRecommendations,
  getFeatureDiscountedCost,
  FEATURE_SYNONYMS,
  PillarMarkerDots,
  PillarRecommendationLegend
} from '../../../utils/pillarRecommendations.jsx';

/**
 * Normalizes feat/trait strings for matching
 */
const normalizeLookupName = (name) => {
  if (!name) return '';
  return String(name).replace(/^(feature|trait)-/i, '').replace(/[-_]/g, ' ').trim().toLowerCase();
};

// Unified trait lookup pool covering all canonical categories and species lineages
const ALL_TRAIT_LOOKUP = [
  ...ALL_CANONICAL_TRAITS,
  ...SPECIES_TRAITS_ADVANCED,
  ...SPECIES_TRAITS_BASIC,
  ...SPECIES_TRAITS_ELITE,
  ...OCCUPATIONAL_TRAITS,
  ...ORIGIN_TRAITS
];

/**
 * Resolves a canonical trait object from ID or name
 */
const findCanonicalTrait = (traitIdOrName, speciesContext = null) => {
  if (!traitIdOrName) return null;
  const rawStr = typeof traitIdOrName === 'object' ? (traitIdOrName.id || traitIdOrName.name || traitIdOrName.title || '') : String(traitIdOrName);
  const clean = String(rawStr).trim().toLowerCase();
  const normalized = clean.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();

  // Check pillar-specific traits_detail first (e.g. Occupation or Origin specific traits)
  if (speciesContext && Array.isArray(speciesContext.traits_detail)) {
    const detailFound = speciesContext.traits_detail.find(t => {
      const tId = (t.id || '').toLowerCase();
      const tName = (t.name || t.title || '').toLowerCase();
      const tNorm = tName.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
      return tId === clean || tName === clean || tNorm === normalized;
    });
    if (detailFound) {
      const canonicalMatch = ALL_TRAIT_LOOKUP.find(t => {
        const tId = (t.id || '').toLowerCase();
        const tName = (t.name || t.title || '').toLowerCase();
        const tNorm = tName.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
        return tId === clean || tName === clean || tNorm === normalized;
      });
      return {
        ...(canonicalMatch || {}),
        ...detailFound,
        ...(typeof traitIdOrName === 'object' ? traitIdOrName : {}),
        description: detailFound.description || detailFound.desc || canonicalMatch?.description || '',
        mechanic: detailFound.mechanic || detailFound.mechanics || canonicalMatch?.mechanic || ''
      };
    }
  }

  if (typeof traitIdOrName === 'object' && traitIdOrName !== null && (traitIdOrName.description || traitIdOrName.desc) && (traitIdOrName.mechanic || traitIdOrName.mechanics)) {
    return traitIdOrName;
  }
  
  const found = ALL_TRAIT_LOOKUP.find(t => {
    const tId = (t.id || '').toLowerCase();
    const tName = (t.name || t.title || '').toLowerCase();
    const tNorm = tName.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
    return tId === clean || tName === clean || tNorm === normalized;
  });

  if (found) {
    return typeof traitIdOrName === 'object' ? { ...found, ...traitIdOrName, description: traitIdOrName.description || found.description, mechanic: traitIdOrName.mechanic || found.mechanic } : found;
  }

  const formatted = formatSpeciesTrait(traitIdOrName, speciesContext);
  if (formatted && formatted.name && formatted.name !== 'Species Adaptation') {
    return {
      id: formatted.id || clean,
      name: formatted.name,
      category: 'traits',
      trait_type: formatted.category || 'Species Trait',
      trait_tier: 'Basic',
      cp: 1,
      description: formatted.description || formatted.tooltip?.description || `${formatted.name} species trait.`,
      mechanic: formatted.mechanic || formatted.tooltip?.rules || '',
      rules: formatted.tooltip?.rules || '',
      modifiers: []
    };
  }

  const formattedName = String(traitIdOrName)
    .replace(/^(trait|feature)-/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    id: clean.startsWith('trait-') ? clean : `trait-${clean.replace(/\s+/g, '-')}`,
    name: formattedName,
    category: 'traits',
    trait_type: 'Column Trait',
    trait_tier: 'Basic',
    cp: 1,
    description: 'Character trait from chosen identity column.',
    mechanic: '',
    modifiers: []
  };
};

export const FeaturesTab = ({ 
  onOpenSelectorModal, 
  onOpenAssetModal, 
  activeSection = 'features', 
  onOpenMetaphysicsModal,
  onBackToHub,
  onNavigate
}) => {
  const { characterData, updateField, handleAddItem, handleUpdateItem, handleDeleteItem } = useFolio();
  const { isAdmin } = useAuth() || {};
  const { openDiceRoller } = useDice();
  
  const handleOpenFeatureDataset = useCallback((feat, itemIndex = null) => {
    const enriched = getEnrichedFeatureData(feat);
    if (onOpenAssetModal) {
      onOpenAssetModal('features', `${enriched?.name || 'Feature'} Matrix`, 'edit', itemIndex, enriched);
    } else {
      window.dispatchEvent(new CustomEvent('open-folio-asset', {
        detail: {
          key: 'features',
          title: `${enriched?.name || 'Feature'} Matrix`,
          mode: 'edit',
          itemIndex,
          initialData: enriched
        }
      }));
    }
  }, [onOpenAssetModal]);

  const handleOpenTraitDataset = useCallback((trait, itemIndex = null) => {
    const enriched = getEnrichedTraitData(trait);
    if (onOpenAssetModal) {
      onOpenAssetModal('traits', `${enriched?.name || 'Trait'} Matrix`, 'edit', itemIndex, enriched);
    } else {
      window.dispatchEvent(new CustomEvent('open-folio-asset', {
        detail: {
          key: 'traits',
          title: `${enriched?.name || 'Trait'} Matrix`,
          mode: 'edit',
          itemIndex,
          initialData: enriched
        }
      }));
    }
  }, [onOpenAssetModal]);

  const handleOpenInvocationDataset = useCallback((inv, itemIndex = null) => {
    const enriched = getEnrichedInvocationData(inv);
    if (onOpenAssetModal) {
      onOpenAssetModal('invocations', `${enriched?.name || 'Invocation'} Matrix`, 'edit', itemIndex, enriched);
    } else {
      window.dispatchEvent(new CustomEvent('open-folio-asset', {
        detail: {
          key: 'invocations',
          title: `${enriched?.name || 'Invocation'} Matrix`,
          mode: 'edit',
          itemIndex,
          initialData: enriched
        }
      }));
    }
  }, [onOpenAssetModal]);

  const handleOpenHindranceDataset = useCallback((hind, itemIndex = null) => {
    const enriched = getEnrichedHindranceData(hind);
    const targetKey = hind?.sourceList === 'hindrances' ? 'hindrances' : 'disadvantages';
    if (onOpenAssetModal) {
      onOpenAssetModal(targetKey, `${enriched?.name || 'Hindrance'} Matrix`, 'edit', itemIndex, enriched);
    } else {
      window.dispatchEvent(new CustomEvent('open-folio-asset', {
        detail: {
          key: targetKey,
          title: `${enriched?.name || 'Hindrance'} Matrix`,
          mode: 'edit',
          itemIndex,
          initialData: enriched
        }
      }));
    }
  }, [onOpenAssetModal]);

  // Active main sub-tab
  const [selectedSubTab, setSelectedSubTab] = useState(
    activeSection === 'traits' ? 'traits' :
    activeSection === 'hindrances' ? 'hindrances' :
    activeSection === 'augmentations' ? 'augmentations' :
    activeSection === 'metaphysics' || activeSection === 'awakened' ? 'metaphysics' :
    activeSection === 'features' ? 'features' :
    'overview'
  );

  // Features View Mode: 'my-features' | 'recommended' | 'catalog'
  const [featuresViewMode, setFeaturesViewMode] = useState('catalog');

  // Complete Catalog Mode controls
  const [featuresSearchQuery, setFeaturesSearchQuery] = useState('');
  const [catalogCategoryTab, setCatalogCategoryTab] = useState(null);
  const [catalogSortOption, setCatalogSortOption] = useState('recommended');

  // My Features Mode controls
  const [myFeaturesCategoryTab, setMyFeaturesCategoryTab] = useState(null);
  const [myFeaturesSearchQuery, setMyFeaturesSearchQuery] = useState('');
  const [myFeaturesSortOption, setMyFeaturesSortOption] = useState('az');

  // Recommended Features Mode controls
  const [recommendedCategoryTab, setRecommendedCategoryTab] = useState(null);
  const [recommendedSearchQuery, setRecommendedSearchQuery] = useState('');
  const [recommendedSortOption, setRecommendedSortOption] = useState('recommended');

  // Traits Filter / Column Selector: 'species' | 'origin' | 'occupation' | 'faction' | 'ALL'
  const [traitsColumnTab, setTraitsColumnTab] = useState('species');
  const [traitsSearchQuery, setTraitsSearchQuery] = useState('');

  // Metaphysics inner tab: 'disciplines' | 'invocations'
  const [metaInnerTab, setMetaInnerTab] = useState('disciplines');
  const [metaSearchQuery, setMetaSearchQuery] = useState('');
  const [metaTypeFilter, setMetaTypeFilter] = useState('all');
  const [metaDisciplineFilter, setMetaDisciplineFilter] = useState('all');

  // Overview Manifest search filter & category filter
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('');
  const [overviewManifestFilter, setOverviewManifestFilter] = useState('all');

  // Augmentation Stage calculation
  const augStageInfo = useMemo(() => {
    return determineAugmentationStage(characterData);
  }, [characterData]);

  // Synchronize internal subtab state when parent activeSection changes
  useEffect(() => {
    if (activeSection) {
      if (activeSection === 'traits') setSelectedSubTab('traits');
      else if (activeSection === 'hindrances') setSelectedSubTab('hindrances');
      else if (activeSection === 'augmentations') setSelectedSubTab('augmentations');
      else if (activeSection === 'metaphysics' || activeSection === 'awakened') setSelectedSubTab('metaphysics');
      else if (activeSection === 'features') setSelectedSubTab('features');
      else setSelectedSubTab('overview');
    }
  }, [activeSection]);

  const handleNavigateToSubsystem = useCallback((subTabKey, navRouteKey) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setSelectedSubTab(subTabKey);
    if (onNavigate && navRouteKey) {
      onNavigate(navRouteKey);
    }
  }, [onNavigate]);

  // Helper to extract items array safely
  const getItemList = (key) => {
    const data = characterData[key];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [data];
      }
    }
    return [];
  };

  // Helper to check item types
  const isAwakenedItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    const id = (typeof item === 'object' ? (item.id || '') : '').toLowerCase();
    return (
      type.includes('awakened') ||
      type.includes('discipline') ||
      name.startsWith('awakened') ||
      name.includes('awakened:') ||
      id.startsWith('awakened') ||
      ['dimension', 'energy', 'entropy', 'illusion', 'matter', 'mental'].some(d => name === `awakened: ${d}` || name === `awakened ${d}`)
    );
  };

  const isAugmentationItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('aug') || type.includes('cyber') || type.includes('bio-mod') || name.startsWith('aug:');
  };

  const isHindranceItem = (item) => {
    if (!item) return false;
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('hindrance') || type.includes('disadvantage') || type.includes('flaw');
  };

  const isTraitItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || item.id || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || item.trait_type || '') : '').toLowerCase();
    return (
      type.includes('trait') ||
      name.startsWith('trait:') ||
      name.startsWith('trait-') ||
      (typeof item === 'object' && (item.trait_tier !== undefined || item.trait_type !== undefined))
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 1. STANDARD FEATURES DATA (Base Cost: 3 CP, -1 CP Pillar Discount)
  // ═════════════════════════════════════════════════════════════════════════

  const standardFeatures = useMemo(() => {
    const rawFeatures = getItemList('features');
    const result = [];
    rawFeatures.forEach((item, idx) => {
      if (!isAwakenedItem(item) && !isAugmentationItem(item) && !isHindranceItem(item) && !isTraitItem(item)) {
        result.push({
          ...(typeof item === 'object' ? item : { name: item }),
          sourceList: 'features',
          sourceIndex: idx
        });
      }
    });
    return result;
  }, [characterData.features]);

  // Pillar Feature Sets for Recommendations and Discounts
  const pillarFeatureSets = useMemo(() => {
    return extractPillarFeatureSets(characterData);
  }, [
    characterData?.['char-archetype'],
    characterData?.['char-species'],
    characterData?.['char-occu'],
    characterData?.['char-origin'],
    characterData?.['char-faction'],
    characterData?.speciesAllocations,
    characterData?.occuAllocations,
    characterData?.originAllocations,
    characterData?.factionAllocations
  ]);

  const isFeatureAcquired = (featName) => {
    if (!featName) return false;
    const normTarget = normalizeLookupName(featName);
    const targetSyns = FEATURE_SYNONYMS?.[normTarget] || [];
    return standardFeatures.some(item => {
      const n = typeof item === 'object' ? (item.name || item.title || item.id || '') : String(item);
      const normN = normalizeLookupName(n);
      return normN === normTarget || targetSyns.includes(normN);
    });
  };

  const getAcquiredFeature = (featName) => {
    if (!featName) return null;
    const normTarget = normalizeLookupName(featName);
    const targetSyns = FEATURE_SYNONYMS?.[normTarget] || [];
    return standardFeatures.find(item => {
      const n = typeof item === 'object' ? (item.name || item.title || item.id || '') : String(item);
      const normN = normalizeLookupName(n);
      return normN === normTarget || targetSyns.includes(normN);
    });
  };

  const getAcquiredFeatureCount = (featName) => {
    if (!featName) return 0;
    const normTarget = normalizeLookupName(featName);
    const targetSyns = FEATURE_SYNONYMS?.[normTarget] || [];
    return standardFeatures.filter(item => {
      const n = typeof item === 'object' ? (item.name || item.title || item.id || '') : String(item);
      const normN = normalizeLookupName(n);
      return normN === normTarget || targetSyns.includes(normN);
    }).length;
  };

  // Group acquired standard features by category
  const groupedStandardFeatures = useMemo(() => {
    const groups = {};
    standardFeatures.forEach((item) => {
      let typeStr = 'General';
      if (typeof item === 'object' && (item.type || item.category)) {
        typeStr = item.type || item.category;
      }
      const type = typeStr.trim() || 'General';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => {
        const nameA = typeof a === 'object' ? (a.name || a.title || '') : String(a);
        const nameB = typeof b === 'object' ? (b.name || b.title || '') : String(b);
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      });
    });

    const sortedTypes = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return sortedTypes.map((type) => ({
      type,
      items: groups[type]
    }));
  }, [standardFeatures]);

  // Total CP of Standard Features (Base 3 CP, discounted or 0 if inherent, scaled by rank for ranked features)
  const totalStandardFeaturesCP = useMemo(() => {
    return standardFeatures.reduce((acc, feat) => {
      const isSpeciesInherent = typeof feat === 'object' && (
        feat.source === 'species' || 
        feat.category === 'Species Inherent' || 
        feat.category === 'Species' ||
        feat.cp === 0
      );
      if (isSpeciesInherent) return acc;
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 3;
      const rank = typeof feat === 'object' && feat.rank !== undefined ? Math.max(1, parseInt(feat.rank, 10)) : 1;
      return acc + ((isNaN(cost) ? 3 : cost) * rank);
    }, 0);
  }, [standardFeatures]);

  // Canonical Features Catalog Categories
  const catalogCategories = useMemo(() => {
    const categoriesSet = new Set();
    DEFAULT_FEATURES.forEach(f => {
      if (!isAwakenedItem(f) && !isAugmentationItem(f) && !isHindranceItem(f)) {
        const cat = f.category || f.type || 'General';
        if (cat) categoriesSet.add(cat);
      }
    });
    const sorted = Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
    return [...sorted, 'ALL'];
  }, []);

  const catalogCategoryData = useMemo(() => {
    const counts = { ALL: 0 };
    const pillarsMap = {};

    DEFAULT_FEATURES.forEach(f => {
      if (!isAwakenedItem(f) && !isAugmentationItem(f) && !isHindranceItem(f)) {
        counts.ALL += 1;
        const cat = f.category || f.type || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    catalogCategories.forEach(cat => {
      if (cat !== 'ALL') {
        pillarsMap[cat] = getPillarFeatureRecommendations(cat, pillarFeatureSets, characterData);
      } else {
        pillarsMap[cat] = [];
      }
    });

    return { counts, pillarsMap };
  }, [catalogCategories, pillarFeatureSets, characterData]);

  // My Features Distinct Categories & Counts
  const myFeaturesCategories = useMemo(() => {
    const categoriesSet = new Set();
    standardFeatures.forEach(f => {
      const cat = f.category || f.type || 'General';
      if (cat) categoriesSet.add(cat);
    });
    const sorted = Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
    return [...sorted, 'ALL'];
  }, [standardFeatures]);

  const myFeaturesCategoryCounts = useMemo(() => {
    const counts = { ALL: standardFeatures.length };
    standardFeatures.forEach(f => {
      const cat = f.category || f.type || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [standardFeatures]);

  // Enriched features catalog entries
  const allEnrichedCatalogFeatures = useMemo(() => {
    return DEFAULT_FEATURES.filter(f => !isAwakenedItem(f) && !isAugmentationItem(f) && !isHindranceItem(f))
      .map(rawFeat => {
        const feat = getEnrichedFeatureData(rawFeat);
        const recs = getPillarFeatureRecommendations(feat, pillarFeatureSets, characterData);
        const discountInfo = getFeatureDiscountedCost(feat, pillarFeatureSets, characterData);
        const acquired = isFeatureAcquired(feat.name || feat.title || feat.id);
        const acquiredCount = getAcquiredFeatureCount(feat.name || feat.title || feat.id);
        return {
          ...feat,
          recommendingPillars: recs,
          discountInfo,
          isAcquired: acquired,
          acquiredCount
        };
      });
  }, [pillarFeatureSets, characterData, standardFeatures]);

  // Curated Pillar Recommended Features (-1 CP Discount)
  const recommendedFeatures = useMemo(() => {
    return allEnrichedCatalogFeatures.filter(f => f.recommendingPillars.length > 0 || f.discountInfo.isDiscounted);
  }, [allEnrichedCatalogFeatures]);

  // Recommended Distinct Categories & Counts
  const recommendedCategories = useMemo(() => {
    const categoriesSet = new Set();
    recommendedFeatures.forEach(f => {
      const cat = f.category || f.type || 'General';
      if (cat) categoriesSet.add(cat);
    });
    const sorted = Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
    return [...sorted, 'ALL'];
  }, [recommendedFeatures]);

  const recommendedCategoryCounts = useMemo(() => {
    const counts = { ALL: recommendedFeatures.length };
    recommendedFeatures.forEach(f => {
      const cat = f.category || f.type || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [recommendedFeatures]);

  // Filtered & Sorted My Features (Acquired)
  const filteredMyFeatures = useMemo(() => {
    const q = myFeaturesSearchQuery.trim().toLowerCase();
    const activeCat = myFeaturesCategoryTab || myFeaturesCategories[0] || 'ALL';
    const targetCat = activeCat.toLowerCase();

    let list = standardFeatures.filter(f => {
      const cat = (f.category || f.type || 'General').toLowerCase();
      if (targetCat !== 'all' && cat !== targetCat) return false;

      if (q) {
        const name = (f.name || f.title || f.id || '').toLowerCase();
        const desc = (f.description || f.mechanic || f.summary || '').toLowerCase();
        const prereq = (f.prerequisites || f.prereq || '').toLowerCase();
        const normName = normalizeLookupName(name);
        const qSyns = FEATURE_SYNONYMS?.[q] || [];
        const matchesSyn = qSyns.some(syn => normName.includes(syn) || syn.includes(normName));
        if (!name.includes(q) && !desc.includes(q) && !cat.includes(q) && !prereq.includes(q) && !matchesSyn) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const nameA = a.name || a.title || '';
      const nameB = b.name || b.title || '';
      const costA = typeof a === 'object' && a.cp !== undefined ? parseInt(a.cp, 10) : 3;
      const costB = typeof b === 'object' && b.cp !== undefined ? parseInt(b.cp, 10) : 3;
      if (myFeaturesSortOption === 'az') return nameA.localeCompare(nameB);
      if (myFeaturesSortOption === 'za') return nameB.localeCompare(nameA);
      if (myFeaturesSortOption === 'cost_desc') return costB - costA;
      if (myFeaturesSortOption === 'cost_asc') return costA - costB;
      if (myFeaturesSortOption === 'category') {
        const catA = a.category || a.type || 'General';
        const catB = b.category || b.type || 'General';
        const cmp = catA.localeCompare(catB);
        if (cmp !== 0) return cmp;
      }
      return nameA.localeCompare(nameB);
    });
  }, [standardFeatures, myFeaturesCategoryTab, myFeaturesCategories, myFeaturesSearchQuery, myFeaturesSortOption]);

  // Filtered & Sorted Recommended Features
  const filteredRecommendedFeatures = useMemo(() => {
    const q = recommendedSearchQuery.trim().toLowerCase();
    const activeCat = recommendedCategoryTab || recommendedCategories[0] || 'ALL';
    const targetCat = activeCat.toLowerCase();

    let list = recommendedFeatures.filter(f => {
      const cat = (f.category || f.type || 'General').toLowerCase();
      if (targetCat !== 'all' && cat !== targetCat) return false;

      if (q) {
        const name = (f.name || f.title || f.id || '').toLowerCase();
        const desc = (f.description || f.mechanic || f.summary || '').toLowerCase();
        const prereq = (f.prerequisites || f.prereq || '').toLowerCase();
        const pillarNames = (f.recommendingPillars || []).map(p => `${p.name} ${p.detail}`).join(' ').toLowerCase();
        const normName = normalizeLookupName(name);
        const qSyns = FEATURE_SYNONYMS?.[q] || [];
        const matchesSyn = qSyns.some(syn => normName.includes(syn) || syn.includes(normName));
        if (!name.includes(q) && !desc.includes(q) && !cat.includes(q) && !prereq.includes(q) && !pillarNames.includes(q) && !matchesSyn) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const nameA = a.name || a.title || '';
      const nameB = b.name || b.title || '';
      const costA = a.discountInfo?.finalCost ?? 3;
      const costB = b.discountInfo?.finalCost ?? 3;
      if (recommendedSortOption === 'az') return nameA.localeCompare(nameB);
      if (recommendedSortOption === 'za') return nameB.localeCompare(nameA);
      if (recommendedSortOption === 'cost_desc') return costB - costA;
      if (recommendedSortOption === 'cost_asc') return costA - costB;
      if (recommendedSortOption === 'discount') {
        const discA = a.discountInfo?.isDiscounted ? 1 : 0;
        const discB = b.discountInfo?.isDiscounted ? 1 : 0;
        if (discA !== discB) return discB - discA;
      }
      // 'recommended'
      const recsA = (a.recommendingPillars || []).length;
      const recsB = (b.recommendingPillars || []).length;
      if (recsA !== recsB) return recsB - recsA;
      return nameA.localeCompare(nameB);
    });
  }, [recommendedFeatures, recommendedCategoryTab, recommendedCategories, recommendedSearchQuery, recommendedSortOption]);

  // Filtered & Sorted Complete Catalog Features
  const filteredCatalogFeatures = useMemo(() => {
    const q = featuresSearchQuery.trim().toLowerCase();
    const activeCat = catalogCategoryTab || catalogCategories[0] || 'ALL';
    const targetCat = activeCat.toLowerCase();

    let list = allEnrichedCatalogFeatures.filter(f => {
      const cat = (f.category || f.type || 'General').toLowerCase();
      if (targetCat !== 'all' && cat !== targetCat) return false;

      if (q) {
        const name = (f.name || f.title || f.id || '').toLowerCase();
        const desc = (f.description || f.mechanic || f.summary || '').toLowerCase();
        const prereq = (f.prerequisites || f.prereq || '').toLowerCase();
        const normName = normalizeLookupName(name);
        const qSyns = FEATURE_SYNONYMS?.[q] || [];
        const matchesSyn = qSyns.some(syn => normName.includes(syn) || syn.includes(normName));
        if (!name.includes(q) && !desc.includes(q) && !cat.includes(q) && !prereq.includes(q) && !matchesSyn) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const nameA = a.name || a.title || '';
      const nameB = b.name || b.title || '';
      const costA = a.discountInfo?.finalCost ?? 3;
      const costB = b.discountInfo?.finalCost ?? 3;
      if (catalogSortOption === 'az') return nameA.localeCompare(nameB);
      if (catalogSortOption === 'za') return nameB.localeCompare(nameA);
      if (catalogSortOption === 'cost_desc') return costB - costA;
      if (catalogSortOption === 'cost_asc') return costA - costB;
      if (catalogSortOption === 'prereq') {
        const checkA = checkPrerequisite(a, characterData, 'features');
        const checkB = checkPrerequisite(b, characterData, 'features');
        const scoreA = checkA.isPossessed ? 2 : (checkA.hasPrerequisite ? 0 : 1);
        const scoreB = checkB.isPossessed ? 2 : (checkB.hasPrerequisite ? 0 : 1);
        if (scoreA !== scoreB) return scoreB - scoreA;
      }
      // 'recommended'
      const recsA = (a.recommendingPillars || []).length;
      const recsB = (b.recommendingPillars || []).length;
      if (recsA !== recsB) return recsB - recsA;
      return nameA.localeCompare(nameB);
    });
  }, [allEnrichedCatalogFeatures, catalogCategoryTab, catalogCategories, featuresSearchQuery, catalogSortOption, characterData]);

  // Remove Feature Item
  const handleRemoveFeature = async (item) => {
    if (!item) return;
    const itemName = typeof item === 'object' ? (item.name || item.title || item.id || 'Feature') : String(item);
    if (!(await confirmTypedDeletion(itemName, 'feature'))) return;

    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    let updated;
    if (typeof item.sourceIndex === 'number' && item.sourceIndex >= 0 && item.sourceIndex < currentList.length) {
      updated = currentList.filter((_, i) => i !== item.sourceIndex);
    } else {
      const normTarget = normalizeLookupName(itemName);
      let removed = false;
      updated = currentList.filter((entry) => {
        if (removed) return true;
        const entryName = typeof entry === 'object' ? (entry.name || entry.title || entry.id || '') : String(entry);
        if (normalizeLookupName(entryName) === normTarget) {
          removed = true;
          return false;
        }
        return true;
      });
    }
    updateField(listKey, updated);
  };

  // Adjust Rank on Ranked Feature
  const handleUpdateFeatureRank = (item, newRank) => {
    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    const maxRank = item.max_rank || 5;
    const clamped = Math.min(maxRank, Math.max(1, parseInt(newRank, 10) || 1));
    const updated = [...currentList];
    if (updated[item.sourceIndex]) {
      const existing = updated[item.sourceIndex];
      updated[item.sourceIndex] = typeof existing === 'object'
        ? { ...existing, rank: clamped }
        : { name: existing, rank: clamped };
      updateField(listKey, updated);
    }
  };

  // Select Active Skill Option on Feature with Modifier Choice Options
  const handleSelectFeatureOption = (item, optionId) => {
    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    const updated = [...currentList];
    if (updated[item.sourceIndex]) {
      const existing = updated[item.sourceIndex];
      updated[item.sourceIndex] = typeof existing === 'object'
        ? { ...existing, selected_option_id: optionId }
        : { name: existing, selected_option_id: optionId };
      updateField(listKey, updated);
    }
  };

  // Toggle / Select Active Skill on Feature with Group Choice Pool
  const handleToggleFeatureGroupSkill = (item, skillName, maxSkills = 2) => {
    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    const updated = [...currentList];
    if (updated[item.sourceIndex]) {
      const existing = updated[item.sourceIndex];
      const currentSelected = Array.isArray(existing.selected_skills)
        ? [...existing.selected_skills]
        : (existing.selected_skill ? [existing.selected_skill] : []);
      
      let nextSelected;
      if (currentSelected.includes(skillName)) {
        nextSelected = currentSelected.filter(s => s !== skillName);
      } else {
        if (currentSelected.length >= maxSkills) {
          // If already at max, replace the last item
          nextSelected = [...currentSelected.slice(0, maxSkills - 1), skillName];
        } else {
          nextSelected = [...currentSelected, skillName];
        }
      }
      updated[item.sourceIndex] = typeof existing === 'object'
        ? { ...existing, selected_skills: nextSelected }
        : { name: existing, selected_skills: nextSelected };
      updateField(listKey, updated);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 2. COLUMN-SPECIFIC TRAITS DATA (Cost: 1 CP Flat, Half-Features, No Discounts)
  // ═════════════════════════════════════════════════════════════════════════

  // Resolved Column Definitions (Primary + Secondary choices)
  const columnsData = useMemo(() => {
    // A. Species Column
    const specName = characterData['char-species'];
    const specObj = specName ? (resolveCatalogItem('species', specName) || DEFAULT_SPECIES.find(s => (s.name || s.id || '').toLowerCase() === String(specName).toLowerCase())) : null;
    const subSpecName = characterData['char-subspecies'] || characterData['char-species-sub'];
    const subSpecObj = subSpecName ? (resolveCatalogItem('species', subSpecName) || DEFAULT_SPECIES.find(s => (s.name || s.id || '').toLowerCase() === String(subSpecName).toLowerCase())) : null;

    // B. Origin Column (Primary + Secondary)
    const origName = characterData['char-origin'];
    const origObj = origName ? (resolveCatalogItem('origins', origName) || DEFAULT_ORIGINS.find(o => (o.name || o.id || '').toLowerCase() === String(origName).toLowerCase())) : null;
    const secOrigName = characterData['char-secondary-origin'] || characterData['char-origin-secondary'];
    const secOrigObj = secOrigName ? (resolveCatalogItem('origins', secOrigName) || DEFAULT_ORIGINS.find(o => (o.name || o.id || '').toLowerCase() === String(secOrigName).toLowerCase())) : null;

    // C. Occupation Column (Primary + Secondary)
    const occuName = characterData['char-occu'];
    const occuObj = occuName ? (resolveCatalogItem('occupations', occuName) || DEFAULT_OCCUPATIONS.find(o => (o.name || o.id || '').toLowerCase() === String(occuName).toLowerCase())) : null;
    const secOccuName = characterData['char-secondary-occu'] || characterData['char-occu-secondary'];
    const secOccuObj = secOccuName ? (resolveCatalogItem('occupations', secOccuName) || DEFAULT_OCCUPATIONS.find(o => (o.name || o.id || '').toLowerCase() === String(secOccuName).toLowerCase())) : null;

    // D. Faction Column (Primary + Secondary)
    const facName = characterData['char-faction'];
    const facObj = facName ? (resolveCatalogItem('factions', facName) || DEFAULT_FACTIONS.find(f => (f.name || f.id || '').toLowerCase() === String(facName).toLowerCase())) : null;
    const secFacName = characterData['char-secondary-faction'] || characterData['char-faction-secondary'];
    const secFacObj = secFacName ? (resolveCatalogItem('factions', secFacName) || DEFAULT_FACTIONS.find(f => (f.name || f.id || '').toLowerCase() === String(secFacName).toLowerCase())) : null;

    // E. Archetype Column (Signature Traits — 1 CP)
    const archName = characterData['char-archetype'];
    const archObj = archName ? (resolveCatalogItem('archetypes', archName) || DEFAULT_ARCHETYPES.find(a => (a.name || a.id || '').toLowerCase() === String(archName).toLowerCase())) : null;

    return {
      species: { name: specName, obj: specObj, subName: subSpecName, subObj: subSpecObj },
      origin: { name: origName, obj: origObj, secName: secOrigName, secObj: secOrigObj },
      occupation: { name: occuName, obj: occuObj, secName: secOccuName, secObj: secOccuObj },
      faction: { name: facName, obj: facObj, secName: secFacName, secObj: secFacObj },
      archetype: { name: archName, obj: archObj }
    };
  }, [
    characterData['char-species'],
    characterData['char-subspecies'],
    characterData['char-species-sub'],
    characterData['char-origin'],
    characterData['char-secondary-origin'],
    characterData['char-origin-secondary'],
    characterData['char-occu'],
    characterData['char-secondary-occu'],
    characterData['char-occu-secondary'],
    characterData['char-faction'],
    characterData['char-secondary-faction'],
    characterData['char-faction-secondary'],
    characterData['char-archetype']
  ]);

  // Acquired Traits on Character
  const characterTraits = useMemo(() => {
    const rawTraits = getItemList('traits').map((t, idx) => ({
      ...(typeof t === 'object' ? t : { name: t }),
      sourceList: 'traits',
      sourceIndex: idx
    }));

    const fromFeatures = getItemList('features').map((item, idx) => {
      if (isTraitItem(item)) {
        return {
          ...(typeof item === 'object' ? item : { name: item }),
          sourceList: 'features',
          sourceIndex: idx
        };
      }
      return null;
    }).filter(Boolean);

    const fromAllocations = [
      ...(characterData.archetypeAllocations?.traits || []).map((t, i) => ({ ...(typeof t === 'object' ? t : { name: t }), source: 'archetype', allocationIndex: i })),
      ...(characterData.speciesAllocations?.traits || []).map((t, i) => ({ ...(typeof t === 'object' ? t : { name: t }), source: 'species', allocationIndex: i })),
      ...(characterData.occuAllocations?.traits || []).map((t, i) => ({ ...(typeof t === 'object' ? t : { name: t }), source: 'occupation', allocationIndex: i })),
      ...(characterData.originAllocations?.traits || []).map((t, i) => ({ ...(typeof t === 'object' ? t : { name: t }), source: 'origin', allocationIndex: i })),
      ...(characterData.factionAllocations?.traits || []).map((t, i) => ({ ...(typeof t === 'object' ? t : { name: t }), source: 'faction', allocationIndex: i }))
    ];

    const seen = new Set();
    const combined = [];
    [...rawTraits, ...fromFeatures, ...fromAllocations].forEach((item) => {
      const cleanName = normalizeLookupName(typeof item === 'object' ? (item.name || item.title || item.id || '') : item);
      if (cleanName && !seen.has(cleanName)) {
        seen.add(cleanName);
        
        // Resolve source column
        const src = (typeof item === 'object' ? (item.source || item.columnSource || '') : '').toLowerCase();
        const tType = (typeof item === 'object' ? (item.trait_type || item.category || '') : '').toLowerCase();
        let columnCategory = 'Species';
        if (src.includes('archetype') || tType.includes('archetype trait') || tType.includes('signature trait') || (characterData.archetypeAllocations?.traits || []).some(t => normalizeLookupName(t) === cleanName)) {
          columnCategory = 'Archetype';
        } else if (src.includes('origin') || (characterData.originAllocations?.traits || []).some(t => normalizeLookupName(t) === cleanName)) {
          columnCategory = 'Origin';
        } else if (src.includes('occu') || (characterData.occuAllocations?.traits || []).some(t => normalizeLookupName(t) === cleanName)) {
          columnCategory = 'Occupation';
        } else if (src.includes('faction') || (characterData.factionAllocations?.traits || []).some(t => normalizeLookupName(t) === cleanName)) {
          columnCategory = 'Faction';
        }

        const isInherent = typeof item === 'object' && (
          item.source === 'species' || 
          item.category === 'Species Inherent' || 
          item.category === 'Species Trait' ||
          item.cp === 0
        );

        const canonicalCost = getCanonicalTraitCost(item);
        const pillarContext = columnCategory === 'Occupation'
          ? (columnsData.occupation?.obj || columnsData.occupation?.secObj)
          : columnCategory === 'Origin'
          ? (columnsData.origin?.obj || columnsData.origin?.secObj)
          : columnCategory === 'Species'
          ? columnsData.species?.obj
          : null;
        const resolvedTrait = findCanonicalTrait(item, pillarContext);
        const canonicalTrait = ALL_CANONICAL_TRAITS.find(ct => ct.id === item.id || normalizeLookupName(ct.name) === cleanName);
        const package_traits = (item.package_traits && item.package_traits.length > 0) ? item.package_traits : (resolvedTrait?.package_traits || canonicalTrait?.package_traits || []);

        combined.push({
          ...(canonicalTrait || {}),
          ...(resolvedTrait || {}),
          ...(typeof item === 'object' ? item : { name: resolvedTrait?.name || item }),
          description: (typeof item === 'object' && (item.description || item.desc)) || resolvedTrait?.description || canonicalTrait?.description || '',
          mechanic: (typeof item === 'object' && (item.mechanic || item.mechanics)) || resolvedTrait?.mechanic || canonicalTrait?.mechanic || '',
          columnCategory,
          cleanName,
          package_traits,
          cp: isInherent ? 0 : (typeof item === 'object' && item.cp !== undefined && item.cp !== null ? Number(item.cp) : canonicalCost)
        });
      }
    });

    return combined;
  }, [
    characterData.traits,
    characterData.features,
    characterData.archetypeAllocations,
    characterData.speciesAllocations,
    characterData.occuAllocations,
    characterData.originAllocations,
    characterData.factionAllocations,
    columnsData
  ]);

  const isTraitAcquired = (traitNameOrId) => {
    if (!traitNameOrId) return false;
    const norm = normalizeLookupName(traitNameOrId);
    return characterTraits.some(t => {
      const tNorm = t.cleanName || normalizeLookupName(t.name || t.title);
      const tIdNorm = normalizeLookupName(t.id);
      return tNorm === norm || tIdNorm === norm;
    });
  };

  // Extract Column Available Traits (strictly from chosen columns + secondary choices)
  const columnAvailableTraits = useMemo(() => {
    const result = {
      species: [],
      origin: [],
      occupation: [],
      faction: [],
      archetype: []
    };

    // 1. Species Column Available Traits (Primary + Subspecies)
    const collectSpeciesTraits = (spec, label, isSub = false) => {
      if (!spec) return;
      const seen = new Set(result.species.map(t => normalizeLookupName(t.name || t.id)));

      // Inherent species traits (traits, species_traits, inherent_traits, inherent_features)
      const inherentList = getInherentSpeciesTraits(spec);
      inherentList.forEach(tItem => {
        const canonical = findCanonicalTrait(tItem, spec);
        if (canonical && !seen.has(normalizeLookupName(canonical.name || canonical.id))) {
          seen.add(normalizeLookupName(canonical.name || canonical.id));
          result.species.push({
            ...canonical,
            sourceColumn: 'Species',
            sourceDetail: isSub ? `${label}: ${spec.name}` : spec.name,
            isInherent: true
          });
        }
      });

      // Bonus feature choices / trait choices / recommended traits
      const choicePool = [
        ...(Array.isArray(spec.bonus_trait_choices) ? spec.bonus_trait_choices : []),
        ...(Array.isArray(spec.bonus_feature_choices) ? spec.bonus_feature_choices : []),
        ...(Array.isArray(spec.recommended_traits) ? spec.recommended_traits : [])
      ];
      choicePool.forEach(tItem => {
        const canonical = findCanonicalTrait(tItem, spec);
        if (canonical && !seen.has(normalizeLookupName(canonical.name || canonical.id))) {
          seen.add(normalizeLookupName(canonical.name || canonical.id));
          result.species.push({
            ...canonical,
            sourceColumn: 'Species',
            sourceDetail: isSub ? `${label}: ${spec.name} (Choice)` : `${spec.name} (Choice)`,
            isInherent: false
          });
        }
      });
    };

    if (columnsData.species.obj) collectSpeciesTraits(columnsData.species.obj, 'Primary Species', false);
    if (columnsData.species.subObj) collectSpeciesTraits(columnsData.species.subObj, 'Subspecies', true);

    // 2. Origin Column Available Traits (Primary + Secondary)
    const collectOriginTraits = (orig, label) => {
      if (!orig || !Array.isArray(orig.traits)) return;
      orig.traits.forEach(tId => {
        const canonical = findCanonicalTrait(tId, orig);
        if (canonical) {
          result.origin.push({
            ...canonical,
            sourceColumn: 'Origin',
            sourceDetail: `${label}: ${orig.name}`,
            isInherent: false
          });
        }
      });
    };
    if (columnsData.origin.obj) collectOriginTraits(columnsData.origin.obj, 'Primary Origin');
    if (columnsData.origin.secObj) collectOriginTraits(columnsData.origin.secObj, 'Secondary Origin');

    // 3. Occupation Column Available Traits (Primary + Secondary)
    const collectOccuTraits = (occu, label) => {
      if (!occu || !Array.isArray(occu.traits)) return;
      occu.traits.forEach(tId => {
        const canonical = findCanonicalTrait(tId, occu);
        if (canonical) {
          result.occupation.push({
            ...canonical,
            sourceColumn: 'Occupation',
            sourceDetail: `${label}: ${occu.name}`,
            isInherent: false
          });
        }
      });
    };
    if (columnsData.occupation.obj) collectOccuTraits(columnsData.occupation.obj, 'Primary Occupation');
    if (columnsData.occupation.secObj) collectOccuTraits(columnsData.occupation.secObj, 'Secondary Occupation');

    // 4. Faction Column Available Traits (Primary + Secondary)
    const collectFactionTraits = (fac, label) => {
      if (!fac || !Array.isArray(fac.traits)) return;
      fac.traits.forEach(tId => {
        const canonical = findCanonicalTrait(tId);
        if (canonical) {
          result.faction.push({
            ...canonical,
            sourceColumn: 'Faction',
            sourceDetail: `${label}: ${fac.name}`,
            isInherent: false
          });
        }
      });
    };
    if (columnsData.faction.obj) collectFactionTraits(columnsData.faction.obj, 'Primary Faction');
    if (columnsData.faction.secObj) collectFactionTraits(columnsData.faction.secObj, 'Secondary Faction');

    // 5. Archetype Column Signature Traits (1 CP each)
    if (columnsData.archetype?.obj) {
      const arch = columnsData.archetype.obj;
      const sigList = Array.isArray(arch.signature_traits) && arch.signature_traits.length > 0
        ? arch.signature_traits
        : (Array.isArray(arch.traits) && arch.traits.length > 0
          ? arch.traits
          : (Array.isArray(arch.signature_features) ? arch.signature_features : []));
      sigList.forEach(tId => {
        const canonical = findCanonicalTrait(tId);
        if (canonical) {
          result.archetype.push({
            ...canonical,
            trait_type: 'Archetype Trait',
            cp: 1,
            bp: 1,
            sourceColumn: 'Archetype',
            sourceDetail: `Primary Archetype: ${arch.name}`,
            isInherent: false
          });
        }
      });
    }

    return result;
  }, [columnsData]);

  // Total CP of Character Traits (1, 2, or 4 CP for purchased based on tier, 0 for inherent)
  const totalTraitsCP = useMemo(() => {
    return characterTraits.reduce((acc, t) => {
      if (t.isInherent || t.cp === 0) return acc;
      const cost = typeof t === 'object' && t.cp !== undefined && t.cp !== null ? parseInt(t.cp, 10) : getCanonicalTraitCost(t);
      return acc + (isNaN(cost) ? 1 : cost);
    }, 0);
  }, [characterTraits]);

  // Remove Trait Item
  const handleRemoveTrait = async (trait) => {
    const traitName = typeof trait === 'object' ? (trait.name || trait.title || 'Trait') : String(trait);
    if (!(await confirmTypedDeletion(traitName, 'trait'))) return;

    const norm = normalizeLookupName(traitName);

    if (Array.isArray(characterData.traits)) {
      const updated = characterData.traits.filter(t => normalizeLookupName(typeof t === 'object' ? (t.name || t.title || '') : t) !== norm);
      updateField('traits', updated);
    }
    if (Array.isArray(characterData.features)) {
      const updatedFeats = characterData.features.filter(f => normalizeLookupName(typeof f === 'object' ? (f.name || f.title || '') : f) !== norm);
      updateField('features', updatedFeats);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 3. METAPHYSICS, AWAKENED & POWERS
  // ═════════════════════════════════════════════════════════════════════════

  const awakenedList = useMemo(() => {
    const fromAwakened = getItemList('awakened').map((w, idx) => ({
      ...(typeof w === 'object' ? { ...w, type: 'Awakened', cp: w.cp || 3 } : { name: typeof w === 'string' && !w.startsWith('Awakened') ? `Awakened: ${w}` : w, type: 'Awakened', cp: 3 }),
      sourceList: 'awakened',
      sourceIndex: idx
    }));

    const fromFeatures = getItemList('features').map((item, idx) => {
      if (isAwakenedItem(item)) {
        return {
          ...(typeof item === 'object' ? { ...item, type: 'Awakened', cp: item.cp || 3 } : { name: item, type: 'Awakened', cp: 3 }),
          sourceList: 'features',
          sourceIndex: idx
        };
      }
      return null;
    }).filter(Boolean);

    const seen = new Set();
    const combined = [];
    [...fromAwakened, ...fromFeatures].forEach(item => {
      const name = (item.name || item.title || '').toLowerCase().replace('awakened:', '').replace('awakened', '').trim();
      if (!seen.has(name)) {
        seen.add(name);
        combined.push(item);
      }
    });

    return combined;
  }, [characterData.awakened, characterData.features]);

  const isDisciplineAwakened = (discName) => {
    const target = discName.toLowerCase();
    return awakenedList.some(item => {
      const n = (item.name || item.title || item.discipline || '').toLowerCase();
      return n.includes(target);
    });
  };

  const handleToggleAwakenedDiscipline = async (disc) => {
    const isCurrentlyAwakened = isDisciplineAwakened(disc.name);
    const targetKey = disc.name.toLowerCase();

    if (isCurrentlyAwakened) {
      if (!(await confirmTypedDeletion(`Awakened: ${disc.name}`, 'awakened discipline feature'))) return;
      
      const rawAwakened = getItemList('awakened');
      const updatedAwakened = rawAwakened.filter(d => {
        const n = typeof d === 'object' ? (d.name || d.discipline || '') : String(d);
        return !n.toLowerCase().includes(targetKey);
      });
      updateField('awakened', updatedAwakened);

      const rawFeatures = getItemList('features');
      const updatedFeatures = rawFeatures.filter(f => {
        const n = typeof f === 'object' ? (f.name || f.title || '') : String(f);
        return !n.toLowerCase().includes(`awakened: ${targetKey}`) && !n.toLowerCase().includes(`awakened ${targetKey}`);
      });
      updateField('features', updatedFeatures);
    } else {
      const newItem = {
        id: `awakened_${disc.id}_${Date.now()}`,
        name: `Awakened: ${disc.name}`,
        discipline: disc.name,
        type: 'Awakened',
        category: 'Awakened Discipline',
        cp: 3,
        description: disc.description
      };

      const rawAwakened = getItemList('awakened');
      updateField('awakened', [...rawAwakened, newItem]);
      handleAddItem('features', newItem);

      const currentAttuneRank = parseInt(characterData['skill-meta-attune-rank'] || 0, 10);
      if (currentAttuneRank === 0) {
        updateField('skill-meta-attune-rank', 1);
        updateField('skill-meta-attune-name', 'Attune');
        updateField('skill-meta-attune-group', 'meta');
      }
    }
  };

  const learnedInvocations = useMemo(() => {
    return getItemList('invocations').map((inv, idx) => ({
      ...(typeof inv === 'object' ? inv : { name: inv }),
      sourceIndex: idx
    }));
  }, [characterData.invocations]);

  const invocationsByDiscipline = useMemo(() => {
    const map = {};
    learnedInvocations.forEach((inv) => {
      const disc = (inv.discipline || '').toLowerCase();
      METAPHYSICAL_DISCIPLINES.forEach((d) => {
        const dNameLower = d.name.toLowerCase();
        if (disc.includes(dNameLower)) {
          if (!map[dNameLower]) map[dNameLower] = [];
          map[dNameLower].push(inv);
        }
      });
    });
    return map;
  }, [learnedInvocations]);

  const totalAwakenedCP = useMemo(() => {
    return awakenedList.reduce((acc, feat) => {
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 3;
      return acc + (isNaN(cost) ? 3 : cost);
    }, 0);
  }, [awakenedList]);

  const totalInvocationsCP = useMemo(() => {
    return learnedInvocations.reduce((sum, inv) => {
      const cp = inv.cp !== undefined ? parseInt(inv.cp, 10) : 1;
      return sum + (isNaN(cp) ? 1 : cp);
    }, 0);
  }, [learnedInvocations]);

  const characterSpecialAbilities = useMemo(() => {
    return getItemList('special_abilities').map((abil, idx) => ({
      ...(typeof abil === 'object' ? abil : { name: abil }),
      sourceIndex: idx,
      powerType: 'special_ability'
    }));
  }, [characterData.special_abilities]);

  const totalSpecialAbilitiesCP = useMemo(() => {
    return characterSpecialAbilities.reduce((sum, abil) => {
      const cp = abil.cp !== undefined ? parseInt(abil.cp, 10) : 5;
      return sum + (isNaN(cp) ? 5 : cp);
    }, 0);
  }, [characterSpecialAbilities]);

  const characterPowers = useMemo(() => {
    const invs = learnedInvocations.map(inv => ({ ...inv, powerType: 'invocation' }));
    const abs = characterSpecialAbilities.map(abil => ({ ...abil, powerType: 'special_ability' }));
    return [...invs, ...abs];
  }, [learnedInvocations, characterSpecialAbilities]);

  const filteredCharacterPowers = useMemo(() => {
    return characterPowers.filter(p => {
      if (metaTypeFilter === 'invocations' && p.powerType !== 'invocation') return false;
      if (metaTypeFilter === 'special_abilities' && p.powerType !== 'special_ability') return false;

      if (metaDisciplineFilter !== 'all') {
        const disc = (p.discipline || '').toLowerCase();
        if (!disc.includes(metaDisciplineFilter.toLowerCase())) return false;
      }

      if (metaSearchQuery.trim()) {
        const q = metaSearchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || p.body || '').toLowerCase().includes(q);
        const matchDisc = (p.discipline || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchDisc) return false;
      }

      return true;
    });
  }, [characterPowers, metaTypeFilter, metaDisciplineFilter, metaSearchQuery]);

  const handleUpdateInvocationRank = (idx, newRank) => {
    const raw = getItemList('invocations');
    const clamped = Math.min(10, Math.max(1, parseInt(newRank, 10) || 1));
    const updated = [...raw];
    if (updated[idx]) {
      updated[idx] = typeof updated[idx] === 'object' ? { ...updated[idx], rank: clamped } : { name: updated[idx], rank: clamped };
      updateField('invocations', updated);
    }
  };

  const totalMetaphysicsCP = totalAwakenedCP + totalInvocationsCP + totalSpecialAbilitiesCP;

  // ═════════════════════════════════════════════════════════════════════════
  // 4. AUGMENTATIONS & HINDRANCES
  // ═════════════════════════════════════════════════════════════════════════

  const augmentationsList = useMemo(() => {
    const fromAugs = getItemList('augmentations').map((a, idx) => ({
      ...(typeof a === 'object' ? { ...a, type: a.type || 'Augmentation', cp: a.cp || 2 } : { name: a, type: 'Augmentation', cp: 2 }),
      sourceList: 'augmentations',
      sourceIndex: idx
    }));

    const fromFeatures = getItemList('features').map((item, idx) => {
      if (isAugmentationItem(item)) {
        return {
          ...(typeof item === 'object' ? { ...item, type: 'Augmentation', cp: item.cp || 2 } : { name: item, type: 'Augmentation', cp: 2 }),
          sourceList: 'features',
          sourceIndex: idx
        };
      }
      return null;
    }).filter(Boolean);

    const seen = new Set();
    const combined = [];
    [...fromAugs, ...fromFeatures].forEach(item => {
      const name = (item.name || item.title || '').toLowerCase();
      if (!seen.has(name)) {
        seen.add(name);
        combined.push(item);
      }
    });

    return combined;
  }, [characterData.augmentations, characterData.features]);

  const totalAugmentationsCP = useMemo(() => {
    return augmentationsList.reduce((acc, aug) => {
      const cost = typeof aug === 'object' && aug.cp !== undefined ? parseInt(aug.cp, 10) : 2;
      return acc + (isNaN(cost) ? 2 : cost);
    }, 0);
  }, [augmentationsList]);

  const hindrancesList = useMemo(() => {
    const fromHindrances = getItemList('hindrances').map((item, idx) => ({
      ...(typeof item === 'object' ? item : { name: item }),
      sourceList: 'hindrances',
      sourceIndex: idx
    }));

    const fromDisadvantages = getItemList('disadvantages').map((item, idx) => ({
      ...(typeof item === 'object' ? item : { name: item }),
      sourceList: 'disadvantages',
      sourceIndex: idx
    }));

    const seen = new Set();
    const combined = [];
    [...fromHindrances, ...fromDisadvantages].forEach((item) => {
      const key = (item.id || item.name || item.title || '').toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        combined.push({
          ...item,
          originalIndex: combined.length
        });
      }
    });

    return combined;
  }, [characterData.hindrances, characterData.disadvantages]);

  const groupedHindrances = useMemo(() => {
    const groups = {};
    hindrancesList.forEach((item) => {
      let typeStr = 'Hindrance';
      if (typeof item === 'object' && (item.type || item.category)) {
        typeStr = item.type || item.category;
      }
      const type = typeStr.trim() || 'Hindrance';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => {
        const nameA = typeof a === 'object' ? (a.name || a.title || '') : String(a);
        const nameB = typeof b === 'object' ? (b.name || b.title || '') : String(b);
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      });
    });

    const sortedTypes = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return sortedTypes.map((type) => ({
      type,
      items: groups[type]
    }));
  }, [hindrancesList]);

  const totalHindrancesRefund = useMemo(() => {
    return hindrancesList.reduce((acc, dis) => {
      const refund = typeof dis === 'object' && dis.cp !== undefined
        ? parseInt(dis.cp, 10)
        : (typeof dis === 'object' && (dis.refundBP || dis.bp) ? parseInt(dis.refundBP || dis.bp, 10) : 3);
      return acc + (isNaN(refund) ? 3 : refund);
    }, 0);
  }, [hindrancesList]);

  const handleRemoveHindrance = async (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Hindrance') : String(item);
    if (!(await confirmTypedDeletion(itemName, 'hindrance'))) return;

    const normName = itemName.toLowerCase().trim();
    const hindrancesArr = getItemList('hindrances');
    const disadvantagesArr = getItemList('disadvantages');

    const updatedHindrances = hindrancesArr.filter(h => {
      const n = (typeof h === 'object' ? (h.name || h.title || h.id || '') : String(h)).toLowerCase().trim();
      return n !== normName;
    });
    const updatedDisadvantages = disadvantagesArr.filter(d => {
      const n = (typeof d === 'object' ? (d.name || d.title || d.id || '') : String(d)).toLowerCase().trim();
      return n !== normName;
    });

    if (hindrancesArr.length !== updatedHindrances.length) {
      updateField('hindrances', updatedHindrances);
    }
    if (disadvantagesArr.length !== updatedDisadvantages.length) {
      updateField('disadvantages', updatedDisadvantages);
    }
  };

  const handleRemoveAugmentation = async (aug) => {
    const augName = typeof aug === 'object' ? (aug.name || aug.title || 'Augmentation') : String(aug);
    if (!(await confirmTypedDeletion(augName, 'augmentation'))) return;
    const listKey = aug.sourceList || 'augmentations';
    const raw = getItemList(listKey);
    const updated = raw.filter((item, idx) => {
      if (aug.sourceIndex !== undefined && idx === aug.sourceIndex) return false;
      const itemName = typeof item === 'object' ? (item.name || item.title || '') : String(item);
      return itemName.toLowerCase() !== augName.toLowerCase();
    });
    updateField(listKey, updated);
  };

  const handleRemoveMetaItem = async (power) => {
    const name = typeof power === 'object' ? (power.name || power.title || 'Power') : String(power);
    if (!(await confirmTypedDeletion(name, power.powerType === 'invocation' ? 'invocation' : 'power'))) return;
    if (power.powerType === 'invocation') {
      const raw = getItemList('invocations');
      const updated = raw.filter((_, idx) => idx !== power.sourceIndex);
      updateField('invocations', updated);
    } else if (power.powerType === 'special_ability') {
      const raw = getItemList('special_abilities');
      const updated = raw.filter((_, idx) => idx !== power.sourceIndex);
      updateField('special_abilities', updated);
    } else {
      const listKey = power.sourceList || 'awakened';
      const raw = getItemList(listKey);
      const updated = raw.filter((_, idx) => idx !== power.sourceIndex);
      updateField(listKey, updated);
    }
  };

  // Grand Capabilities Totals
  const totalCapabilitiesCP = totalStandardFeaturesCP + totalTraitsCP + totalMetaphysicsCP + totalAugmentationsCP;
  const netCapabilitiesCP = totalCapabilitiesCP - totalHindrancesRefund;

  const getTypeBadgeStyle = (typeStr) => {
    const lower = (typeStr || '').toLowerCase();
    if (lower.includes('combat')) return 'bg-rose-950/80 text-rose-300 border-rose-800';
    if (lower.includes('ability')) return 'bg-amber-950/80 text-amber-300 border-amber-800';
    if (lower.includes('karma')) return 'bg-purple-950/80 text-purple-300 border-purple-800';
    if (lower.includes('skill')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
  };

  const getAcquisitionBadgeConfig = (itemOrFeat) => {
    if (!itemOrFeat) return null;
    const acq = itemOrFeat.acquisition_type || (
      (itemOrFeat.is_multiple || itemOrFeat.multi) && (itemOrFeat.is_ranked || itemOrFeat.staged)
        ? 'Multi/Staged'
        : (itemOrFeat.is_ranked || itemOrFeat.staged)
        ? 'Staged'
        : (itemOrFeat.is_multiple || itemOrFeat.multi)
        ? 'Multiple'
        : 'Basic'
    );

    switch (acq) {
      case 'Multiple':
        return {
          type: 'Multiple',
          label: 'Multiple',
          badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-700/80',
          title: 'Multiple: Can be chosen multiple times for different assets/effects'
        };
      case 'Staged':
        return {
          type: 'Staged',
          label: 'Staged',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
          title: 'Staged: Improves effect through ranked progression with additional purchases'
        };
      case 'Multi/Staged':
        return {
          type: 'Multi/Staged',
          label: 'Multi/Staged',
          badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
          title: 'Multi/Staged: Can be purchased for multiple assets AND ranked up per purchase'
        };
      case 'Basic':
      default:
        return {
          type: 'Basic',
          label: 'Basic',
          badgeClass: 'bg-slate-900/90 text-slate-400 border-slate-700/70',
          title: 'Basic: Single purchase feature'
        };
    }
  };

  return (
    <div className="tab-panel active p-4 space-y-6 w-full pb-24">
      
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MASTER TOP TELEMETRY & SUB-NAVIGATION BAR                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl p-2.5 sm:p-3 shadow-lg backdrop-blur-xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            {selectedSubTab !== 'overview' && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setSelectedSubTab('overview');
                  if (onBackToHub) onBackToHub();
                  else if (onNavigate) onNavigate('features');
                }}
                className="px-2 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer bg-slate-950 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-sm shrink-0"
                title="Return to Aspect Hub &amp; Overview"
              >
                <span>◀</span>
                <span>Hub</span>
              </button>
            )}

            <div className="flex items-baseline gap-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {selectedSubTab === 'overview' ? 'Aspect Hub & Overview' : 'Features & Traits Command'}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 hidden xl:inline">
                {selectedSubTab === 'overview'
                  ? '(Persona Capabilities, Column Heritage & Subsystems)'
                  : '(3 CP base · Pillar discounted · Traits 1 CP)'}
              </p>
            </div>
          </div>

          {/* Aggregate Telemetry Chips (Compact) */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] font-mono">
            <span className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 rounded font-bold shadow-sm" title="Standard Character Features">
              Features: {totalStandardFeaturesCP} CP
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded font-bold shadow-sm" title="Column Traits (1 CP each)">
              Traits: {totalTraitsCP} CP
            </span>
            {totalMetaphysicsCP > 0 && (
              <span className="px-2 py-0.5 bg-purple-950/80 border border-purple-700/60 text-purple-300 rounded font-bold shadow-sm">
                Meta: {totalMetaphysicsCP} CP
              </span>
            )}
            {totalAugmentationsCP > 0 && (
              <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-700/60 text-amber-300 rounded font-bold shadow-sm">
                Augs: {totalAugmentationsCP} CP
              </span>
            )}
            {totalHindrancesRefund > 0 && (
              <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded font-bold shadow-sm">
                Refund: -{totalHindrancesRefund} CP
              </span>
            )}
            <span className="px-2.5 py-0.5 bg-cyan-900/90 border border-cyan-400 text-white rounded font-black shadow-[0_0_8px_rgba(34,211,238,0.25)]">
              Net: {netCapabilitiesCP} CP
            </span>
          </div>
        </div>

        {/* Asset Navigation Pulldown & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold hidden sm:inline">
              Category:
            </span>
            <div className="relative">
              <select
                value={selectedSubTab}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubTab(val);
                  if (onNavigate) {
                    if (val === 'overview') onNavigate('features');
                    else if (val === 'features') onNavigate('features-standard');
                    else if (val === 'traits') onNavigate('features-traits');
                    else if (val === 'metaphysics') onNavigate('features-metaphysics');
                    else if (val === 'augmentations') onNavigate('features-augmentations');
                    else if (val === 'hindrances') onNavigate('features-hindrances');
                  }
                }}
                className="bg-slate-950 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 font-mono text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.15)] focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer appearance-none"
              >
                <option value="overview">Aspect Hub &amp; Overview</option>
                <option value="features">Standard Features ({standardFeatures.length})</option>
                <option value="traits">Traits (1 CP) ({characterTraits.length})</option>
                <option value="metaphysics">Metaphysics ({awakenedList.length + characterPowers.length})</option>
                <option value="augmentations">Augmentations ({augmentationsList.length})</option>
                <option value="hindrances">Hindrances ({hindrancesList.length})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {onOpenAssetModal && (
            <button
              type="button"
              onClick={() => onOpenAssetModal('features', 'Custom Feature', 'create')}
              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Create custom feature or trait"
            >
              <Plus className="w-3 h-3" />
              <span>Custom Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 0: CONSOLIDATED ASPECT HUB & OVERVIEW DASHBOARD               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'overview' && (() => {
        const featureSubsystems = [
          {
            id: 'features-standard',
            subTab: 'features',
            title: 'Standard Features',
            tagline: '3 CP Base · Combat, Physical & Skill Feats',
            icon: Sparkles,
            count: standardFeatures.length,
            unit: standardFeatures.length === 1 ? 'Feature' : 'Features',
            cpText: `${totalStandardFeaturesCP} CP`,
            colorTheme: 'cyan',
            borderColor: 'border-cyan-500/40 hover:border-cyan-400',
            glowColor: 'hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]',
            iconBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
            badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
            accentColor: 'text-cyan-400',
            description: "Special persona aptitudes and combat knacks costing 3 CP base, with -1 CP discounts for feats recommended by your character's identity pillars."
          },
          {
            id: 'features-traits',
            subTab: 'traits',
            title: 'Traits',
            tagline: '1 CP Each · Chosen from Identity Columns',
            icon: Award,
            count: characterTraits.length,
            unit: characterTraits.length === 1 ? 'Trait' : 'Traits',
            cpText: `${totalTraitsCP} CP`,
            colorTheme: 'emerald',
            borderColor: 'border-emerald-500/40 hover:border-emerald-400',
            glowColor: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.22)]',
            iconBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
            accentColor: 'text-emerald-400',
            description: 'Half-features (1 CP each) strictly selected from your chosen Species, Origin, Occupation, and Faction columns (including secondary choices). Traits are direct aspects of your column build.'
          },
          {
            id: 'features-metaphysics',
            subTab: 'metaphysics',
            title: 'Metaphysics / Awakened',
            tagline: 'Dimensional, Psionic & Void Disciplines',
            icon: Zap,
            count: awakenedList.length,
            unit: awakenedList.length === 1 ? 'Discipline' : 'Disciplines',
            extraCountText: (learnedInvocations.length + characterSpecialAbilities.length > 0) ? `· ${learnedInvocations.length + characterSpecialAbilities.length} Powers` : '',
            cpText: `${totalMetaphysicsCP} CP`,
            colorTheme: 'purple',
            borderColor: 'border-purple-500/40 hover:border-purple-400',
            glowColor: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.22)]',
            iconBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
            badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
            accentColor: 'text-purple-400',
            description: 'Awakened reality manipulation, psionic phenomena, metaphysical formulas, and psychic resonance across the 6 cosmic disciplines.'
          },
          {
            id: 'features-augmentations',
            subTab: 'augmentations',
            title: 'Augmentations',
            tagline: `Stage: ${augStageInfo?.stage?.name || 'Negligible'} (${augStageInfo?.stage?.cpCredit ?? 0} CP Credit)`,
            icon: Cpu,
            count: augmentationsList.length,
            unit: 'Installed',
            cpText: `${totalAugmentationsCP} CP`,
            colorTheme: 'amber',
            borderColor: 'border-amber-500/40 hover:border-amber-400',
            glowColor: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.22)]',
            iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
            badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
            accentColor: 'text-amber-400',
            description: 'High-tech physical alterations, sub-dermal armor, neural coprocessors, and synthetic implants augmenting biological limits.'
          },
          {
            id: 'features-hindrances',
            subTab: 'hindrances',
            title: 'Hindrances',
            tagline: 'Flaws, Debts & Physical Vulnerabilities',
            icon: AlertTriangle,
            count: hindrancesList.length,
            unit: hindrancesList.length === 1 ? 'Flaw' : 'Flaws',
            cpText: totalHindrancesRefund > 0 ? `-${totalHindrancesRefund} CP Refund` : '0 CP',
            colorTheme: 'rose',
            borderColor: 'border-rose-500/40 hover:border-rose-400',
            glowColor: 'hover:shadow-[0_0_24px_rgba(244,63,94,0.22)]',
            iconBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
            badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
            accentColor: 'text-rose-400',
            description: 'Character flaws, behavioral quirks, physical handicaps, and social debts providing vital CP refunds during persona creation.'
          }
        ];

        const totalAllCount = (
          characterTraits.length + 
          standardFeatures.length + 
          awakenedList.length + 
          characterPowers.length + 
          augmentationsList.length + 
          hindrancesList.length
        );

        const filterQuery = (overviewSearchQuery || '').toLowerCase().trim();

        const filteredTraits = characterTraits.filter(t => {
          if (!filterQuery) return true;
          const name = (t.name || t.title || '').toLowerCase();
          const desc = (t.description || '').toLowerCase();
          return name.includes(filterQuery) || desc.includes(filterQuery);
        });

        const filteredFeatures = standardFeatures.filter(f => {
          if (!filterQuery) return true;
          const name = (f.name || f.title || '').toLowerCase();
          const desc = (f.description || '').toLowerCase();
          const cat = (f.category || f.type || '').toLowerCase();
          return name.includes(filterQuery) || desc.includes(filterQuery) || cat.includes(filterQuery);
        });

        const allMetaItems = [
          ...awakenedList.map(a => ({ ...a, metaSubtype: 'Discipline' })),
          ...characterPowers.map(p => ({ ...p, metaSubtype: p.powerType === 'invocation' ? 'Invocation' : 'Special Ability' }))
        ];

        const filteredMetaItems = allMetaItems.filter(m => {
          if (!filterQuery) return true;
          const name = (m.name || m.title || '').toLowerCase();
          const desc = (m.description || m.body || '').toLowerCase();
          const disc = (m.discipline || '').toLowerCase();
          return name.includes(filterQuery) || desc.includes(filterQuery) || disc.includes(filterQuery);
        });

        const filteredAugs = augmentationsList.filter(a => {
          if (!filterQuery) return true;
          const name = (a.name || a.title || '').toLowerCase();
          const desc = (a.description || a.benefit || '').toLowerCase();
          const loc = (a.location || a.body_location || '').toLowerCase();
          return name.includes(filterQuery) || desc.includes(filterQuery) || loc.includes(filterQuery);
        });

        const filteredHindrances = hindrancesList.filter(h => {
          if (!filterQuery) return true;
          const name = (h.name || h.title || '').toLowerCase();
          const desc = (h.description || '').toLowerCase();
          const type = (h.type || h.category || '').toLowerCase();
          return name.includes(filterQuery) || desc.includes(filterQuery) || type.includes(filterQuery);
        });

        const showTraits = overviewManifestFilter === 'all' || overviewManifestFilter === 'traits';
        const showFeatures = overviewManifestFilter === 'all' || overviewManifestFilter === 'features';
        const showMeta = overviewManifestFilter === 'metaphysics' || (overviewManifestFilter === 'all' && allMetaItems.length > 0);
        const showAugs = overviewManifestFilter === 'augmentations' || (overviewManifestFilter === 'all' && augmentationsList.length > 0);
        const showHindrances = overviewManifestFilter === 'hindrances' || (overviewManifestFilter === 'all' && hindrancesList.length > 0);

        return (
          <div className="space-y-6">
            {/* Identity Columns Foundations Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-sm">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 font-bold uppercase tracking-wider">Active Column Foundations:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300">
                  Species: <strong>{characterData['char-species'] || 'None'}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                  Origin: <strong>{characterData['char-origin'] || 'None'}</strong>
                  {columnsData.origin.secName && ` (+ ${columnsData.origin.secName})`}
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700 text-sky-300">
                  Occupation: <strong>{characterData['char-occu'] || 'None'}</strong>
                  {columnsData.occupation.secName && ` (+ ${columnsData.occupation.secName})`}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700 text-purple-300">
                  Faction: <strong>{characterData['char-faction'] || 'None'}</strong>
                </span>
              </div>
            </div>

            {/* Aspect Hub: 5 Subsystem Capability Cards */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
                    Capability Subsystems (Aspect Hub)
                  </h3>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400">
                  Select any subsystem card below to inspect, allocate, or manage
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full items-stretch">
                {featureSubsystems.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleNavigateToSubsystem(opt.subTab, opt.id)}
                      className={`bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-xl border ${opt.borderColor} ${opt.glowColor} rounded-xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group shadow-sm text-left`}
                    >
                      {/* Card Header & Content */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105 ${opt.iconBg}`}>
                              <Icon size={14} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors uppercase tracking-wide leading-tight">
                                {opt.title}
                              </h3>
                              <p className="text-[10px] font-mono text-slate-400 font-medium truncate mt-0.5">
                                {opt.tagline}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-1">
                            <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border ${opt.badgeBg}`}>
                              {opt.count} {opt.unit}
                            </span>
                            {opt.extraCountText && (
                              <span className="font-mono text-[8.5px] text-slate-400 mt-0.5 whitespace-nowrap">
                                {opt.extraCountText}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[10.5px] text-slate-400/90 leading-snug line-clamp-2">
                          {opt.description}
                        </p>
                      </div>

                      {/* Card Footer Action */}
                      <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-300 text-[10.5px]">
                          {opt.cpText}
                        </span>

                        <div className={`flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] ${opt.accentColor} group-hover:translate-x-0.5 transition-transform`}>
                          <span>Manage</span>
                          <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acquired Capabilities Manifest & Filtering Bar */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                      Acquired Capabilities Manifest
                    </h3>
                    <p className="text-[10.5px] text-slate-400">
                      Live inventory of active persona traits, features, augmentations and powers
                    </p>
                  </div>
                </div>

                {/* Quick Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={overviewSearchQuery}
                    onChange={(e) => setOverviewSearchQuery(e.target.value)}
                    placeholder="Search all persona abilities..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
                  />
                  {overviewSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOverviewSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Subsystem Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setOverviewManifestFilter('all')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    overviewManifestFilter === 'all'
                      ? 'bg-cyan-950 border-cyan-500/80 text-cyan-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Aspects ({totalAllCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewManifestFilter('traits')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    overviewManifestFilter === 'traits'
                      ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Traits ({characterTraits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewManifestFilter('features')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    overviewManifestFilter === 'features'
                      ? 'bg-cyan-950 border-cyan-500/80 text-cyan-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Features ({standardFeatures.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewManifestFilter('metaphysics')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    overviewManifestFilter === 'metaphysics'
                      ? 'bg-purple-950 border-purple-500/80 text-purple-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Metaphysics ({allMetaItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewManifestFilter('augmentations')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    overviewManifestFilter === 'augmentations'
                      ? 'bg-amber-950 border-amber-500/80 text-amber-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Augmentations ({augmentationsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewManifestFilter('hindrances')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    overviewManifestFilter === 'hindrances'
                      ? 'bg-rose-950 border-rose-500/80 text-rose-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hindrances ({hindrancesList.length})
                </button>
              </div>

              {/* Manifest Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* 1. Column Heritage Traits */}
                {showTraits && (
                  <div className={`bg-slate-900/80 border border-emerald-900/50 rounded-xl p-4 space-y-3 ${overviewManifestFilter === 'traits' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Column Heritage Traits ({filteredTraits.length}{filterQuery ? ` of ${characterTraits.length}` : ''})
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {totalTraitsCP} CP Total
                      </span>
                    </div>

                    {filteredTraits.length === 0 ? (
                      <div className="text-center py-7 px-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg space-y-2">
                        <p>
                          {characterTraits.length === 0
                            ? 'No column traits acquired yet. Browse the Traits tab to select traits from your Species, Origin, Occupation, and Faction columns.'
                            : 'No column traits match your search filter.'}
                        </p>
                        {characterTraits.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleNavigateToSubsystem('traits', 'features-traits')}
                            className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Browse Column Traits</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredTraits.map((trait, tIdx) => {
                          const name = trait.name || trait.title || 'Trait';
                          const tier = trait.trait_tier || 'Basic';
                          const costDisplay = trait.cp === 0 ? 'Inherent (0 CP)' : `${trait.cp || 1} CP`;
                          const col = trait.columnCategory || trait.columnSource || 'Heritage';
                          const colColor = col === 'Species' ? 'cyan' : col === 'Origin' ? 'emerald' : col === 'Occupation' ? 'sky' : 'purple';
                          return (
                            <div
                              key={tIdx}
                              data-context-zone="folio"
                              data-context-category="traits"
                              data-context-subcategory="traits"
                              data-context-entity-id={trait.id || trait.name}
                              data-context-entity-type="trait"
                              data-context-entity-title={name}
                              data-context-entity-data={JSON.stringify(getEnrichedTraitData(trait))}
                              className="bg-slate-950/80 border border-slate-800 hover:border-emerald-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors group"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <FolioTooltip
                                  title={name}
                                  badge={`${col} Trait`}
                                  badgeColor={colColor}
                                  description={trait.description || 'Acquired column heritage trait.'}
                                  formula={trait.mechanic ? `[${trait.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                                  modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                                  cost={costDisplay}
                                  tags={[tier, col].filter(Boolean)}
                                  adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(trait) } : null}
                                  showInfoIcon={true}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                    <span className="font-bold text-slate-100 hover:text-emerald-300 transition-colors truncate">{name}</span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                      {col} &bull; {tier}
                                    </span>
                                  </div>
                                </FolioTooltip>
                                {trait.description && (
                                  <p className="text-[11px] text-slate-300 leading-snug">
                                    {trait.description}
                                  </p>
                                )}
                                {trait.mechanic && (
                                  <p className="text-[10px] font-mono text-emerald-400/90 leading-snug">
                                    [{trait.mechanic.replace(/^\[|\]$/g, '')}]
                                  </p>
                                )}
                                <SkillChoiceSelector item={trait} itemType="trait" compact />
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-bold">
                                  {costDisplay}
                                </span>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenTraitDataset(trait);
                                    }}
                                    className="text-slate-400 hover:text-emerald-300 text-xs p-1 rounded hover:bg-slate-900 border border-transparent hover:border-emerald-500/50 transition-colors cursor-pointer"
                                    title={`View / Edit ${name} Dataset (Matrix Studio)`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTrait(trait)}
                                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove trait"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Standard Features */}
                {showFeatures && (
                  <div className={`bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 space-y-3 ${overviewManifestFilter === 'features' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Standard Features ({filteredFeatures.length}{filterQuery ? ` of ${standardFeatures.length}` : ''})
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">
                        {totalStandardFeaturesCP} CP Total
                      </span>
                    </div>

                    {filteredFeatures.length === 0 ? (
                      <div className="text-center py-7 px-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg space-y-2">
                        <p>
                          {standardFeatures.length === 0
                            ? 'No standard features acquired yet. Explore the Features tab to view Pillar recommendations and the complete catalog.'
                            : 'No standard features match your search filter.'}
                        </p>
                        {standardFeatures.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleNavigateToSubsystem('features', 'features-standard')}
                            className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/70 text-cyan-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Browse Features Catalog</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredFeatures.map((feat, fIdx) => {
                          const name = feat.name || feat.title || 'Feature';
                          const cat = feat.category || feat.type || 'General';
                          const cp = feat.cp !== undefined ? feat.cp : 3;
                          const featPillars = getPillarFeatureRecommendations(feat, pillarFeatureSets, characterData);
                          return (
                            <div
                              key={fIdx}
                              data-context-zone="folio"
                              data-context-category="features"
                              data-context-subcategory={cat.toLowerCase()}
                              data-context-entity-id={feat.id || feat.name}
                              data-context-entity-type="feature"
                              data-context-entity-title={name}
                              data-context-entity-data={JSON.stringify(getEnrichedFeatureData(feat))}
                              className="bg-slate-950/80 border border-slate-800 hover:border-cyan-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors group"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <FolioTooltip
                                  title={name}
                                  badge={cat}
                                  badgeColor="cyan"
                                  description={feat.description || 'Standard persona feature.'}
                                  formula={feat.mechanic || undefined}
                                  modifiers={Array.isArray(feat.modifiers) ? feat.modifiers : []}
                                  prerequisites={feat.prerequisites || undefined}
                                  cost={`${cp} CP`}
                                  rules={feat.rules || feat.special_rules}
                                  notes={feat.notes}
                                  tags={[
                                    cat, 
                                    getAcquisitionBadgeConfig(feat)?.label ? `Model: ${getAcquisitionBadgeConfig(feat).label}` : null,
                                    feat.is_ranked ? `Rank ${feat.rank || 1}` : null
                                  ].filter(Boolean)}
                                  adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenFeatureDataset(feat) } : null}
                                  showInfoIcon={true}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                    <span className="font-bold text-slate-100 hover:text-cyan-300 transition-colors truncate">{name}</span>
                                    <PillarMarkerDots recommendations={featPillars} />
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase border ${getTypeBadgeStyle(cat)}`}>
                                      {cat}
                                    </span>
                                    {(() => {
                                      const acqCfg = getAcquisitionBadgeConfig(feat);
                                      return (
                                        <span 
                                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase border shrink-0 ${acqCfg.badgeClass}`}
                                          title={acqCfg.title}
                                        >
                                          {acqCfg.label}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </FolioTooltip>
                                <SkillChoiceSelector item={feat} itemType="feature" compact />
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                                  {cp} CP
                                </span>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenFeatureDataset(feat);
                                    }}
                                    className="text-slate-400 hover:text-cyan-300 text-xs p-1 rounded hover:bg-slate-900 border border-transparent hover:border-cyan-500/50 transition-colors cursor-pointer"
                                    title={`View / Edit ${name} Dataset (Matrix Studio)`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(feat)}
                                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove feature"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Metaphysics / Awakened Manifest */}
                {showMeta && (
                  <div className={`bg-slate-900/80 border border-purple-900/50 rounded-xl p-4 space-y-3 ${overviewManifestFilter === 'metaphysics' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b border-purple-950 pb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                          Metaphysics &amp; Awakened ({filteredMetaItems.length}{filterQuery ? ` of ${allMetaItems.length}` : ''})
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-purple-400 font-bold">
                        {totalMetaphysicsCP} CP Total
                      </span>
                    </div>

                    {filteredMetaItems.length === 0 ? (
                      <div className="text-center py-7 px-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg space-y-2">
                        <p>
                          {allMetaItems.length === 0
                            ? 'No awakened disciplines or metaphysics invocations acquired yet.'
                            : 'No metaphysics items match your search filter.'}
                        </p>
                        {allMetaItems.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleNavigateToSubsystem('metaphysics', 'features-metaphysics')}
                            className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-950/80 hover:bg-purple-900 border border-purple-600/70 text-purple-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 text-purple-400" />
                            <span>Manage Metaphysics</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredMetaItems.map((meta, mIdx) => {
                          const name = meta.name || meta.title || 'Power';
                          const cp = meta.cp !== undefined ? meta.cp : (meta.metaSubtype === 'Discipline' ? 3 : 1);
                          const disc = meta.discipline || meta.category || meta.metaSubtype || 'Metaphysics';
                          const isInv = meta.powerType === 'invocation';
                          const rank = meta.rank ? `Lvl ${meta.rank}` : null;
                          return (
                            <div
                              key={mIdx}
                              className="bg-slate-950/80 border border-slate-800 hover:border-purple-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors group"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <FolioTooltip
                                  title={name}
                                  badge={meta.metaSubtype || 'Metaphysics'}
                                  badgeColor="purple"
                                  description={meta.description || meta.body || 'Awakened metaphysical discipline or power.'}
                                  cost={`${cp} CP`}
                                  tags={[disc, rank].filter(Boolean)}
                                  showInfoIcon={true}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                    <span className="font-bold text-slate-100 hover:text-purple-300 transition-colors truncate">{name}</span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                                      {disc} {rank ? `• ${rank}` : ''}
                                    </span>
                                  </div>
                                </FolioTooltip>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-bold">
                                  {isInv && rank ? rank : `${cp} CP`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMetaItem(meta)}
                                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove power"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Augmentations Manifest */}
                {showAugs && (
                  <div className={`bg-slate-900/80 border border-amber-900/50 rounded-xl p-4 space-y-3 ${overviewManifestFilter === 'augmentations' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b border-amber-950 pb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Installed Augmentations ({filteredAugs.length}{filterQuery ? ` of ${augmentationsList.length}` : ''})
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        {totalAugmentationsCP} CP Total
                      </span>
                    </div>

                    {filteredAugs.length === 0 ? (
                      <div className="text-center py-7 px-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg space-y-2">
                        <p>
                          {augmentationsList.length === 0
                            ? 'No cybernetic, bionic or physical augmentations installed yet.'
                            : 'No augmentations match your search filter.'}
                        </p>
                        {augmentationsList.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleNavigateToSubsystem('augmentations', 'features-augmentations')}
                            className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Cpu className="w-3.5 h-3.5 text-amber-400" />
                            <span>Manage Augmentations</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAugs.map((aug, aIdx) => {
                          const name = aug.name || aug.title || 'Augmentation';
                          const cp = aug.cp !== undefined ? aug.cp : 2;
                          const loc = aug.location || aug.body_location || 'Internal';
                          return (
                            <div
                              key={aIdx}
                              className="bg-slate-950/80 border border-slate-800 hover:border-amber-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors group"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <FolioTooltip
                                  title={name}
                                  badge="Augmentation"
                                  badgeColor="amber"
                                  description={aug.description || aug.benefit || 'Cybernetic or biological alteration.'}
                                  cost={`${cp} CP`}
                                  tags={[loc].filter(Boolean)}
                                  showInfoIcon={true}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                    <span className="font-bold text-slate-100 hover:text-amber-300 transition-colors truncate">{name}</span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                                      {loc}
                                    </span>
                                  </div>
                                </FolioTooltip>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                                  {cp} CP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAugmentation(aug)}
                                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove augmentation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Hindrances & Flaws Manifest */}
                {showHindrances && (
                  <div className={`bg-slate-900/80 border border-rose-900/50 rounded-xl p-4 space-y-3 ${overviewManifestFilter === 'hindrances' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b border-rose-950 pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                          Hindrances &amp; Flaws ({filteredHindrances.length}{filterQuery ? ` of ${hindrancesList.length}` : ''})
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {totalHindrancesRefund > 0 ? `-${totalHindrancesRefund} CP Refund` : '0 CP'}
                      </span>
                    </div>

                    {filteredHindrances.length === 0 ? (
                      <div className="text-center py-7 px-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg space-y-2">
                        <p>
                          {hindrancesList.length === 0
                            ? 'No hindrances or physiological flaws acquired on this persona.'
                            : 'No hindrances match your search filter.'}
                        </p>
                        {hindrancesList.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleNavigateToSubsystem('hindrances', 'features-hindrances')}
                            className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-rose-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Manage Hindrances</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredHindrances.map((hind, hIdx) => {
                          const name = hind.name || hind.title || 'Hindrance';
                          const cp = hind.cp !== undefined ? hind.cp : 3;
                          const cat = hind.type || hind.category || 'Flaw';
                          return (
                            <div
                              key={hIdx}
                              className="bg-slate-950/80 border border-slate-800 hover:border-rose-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors group"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <FolioTooltip
                                  title={name}
                                  badge={cat}
                                  badgeColor="rose"
                                  description={hind.description || 'Character flaw, handicap or obligation.'}
                                  cost={`-${cp} CP`}
                                  tags={[cat].filter(Boolean)}
                                  showInfoIcon={true}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                    <span className="font-bold text-slate-100 hover:text-rose-300 transition-colors truncate">{name}</span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                                      {cat}
                                    </span>
                                  </div>
                                </FolioTooltip>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                                  -{cp} CP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHindrance(hind)}
                                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove hindrance"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: STANDARD FEATURES (3 CP BASE · PILLAR DISCOUNTS AVAILABLE) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'features' && (
        <div className="space-y-5">
          {/* MODE A: MY FEATURES (ACQUIRED) */}
          {featuresViewMode === 'my-features' && (
            <div className="space-y-4">
              {standardFeatures.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    No standard features acquired yet on this persona.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('recommended')}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Pillar Recommended (-1 CP Discount)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('catalog')}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all cursor-pointer"
                    >
                      Browse Complete Catalog
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filter & Sort Controls for My Features */}
                  <div className="space-y-2.5">
                    {/* Category Filter Pills - all options visible, wrapped, no sliders */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full">
                      {myFeaturesCategories.map((cat) => {
                        const activeCat = myFeaturesCategoryTab || myFeaturesCategories[0] || 'ALL';
                        const isActive = activeCat === cat;
                        const count = myFeaturesCategoryCounts[cat] || 0;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setMyFeaturesCategoryTab(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                              isActive
                                ? 'bg-cyan-950 border border-cyan-400 text-cyan-200'
                                : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{cat}</span>
                            <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                              isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-900 text-slate-500'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Row down: Sort, View Switcher & Search Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
                      {/* Sort Selector */}
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 shrink-0">
                        <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                        <select
                          value={myFeaturesSortOption}
                          onChange={(e) => setMyFeaturesSortOption(e.target.value)}
                          className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer pr-1 font-mono font-medium"
                        >
                          <option value="az" className="bg-slate-950 text-slate-200">Name (A → Z)</option>
                          <option value="za" className="bg-slate-950 text-slate-200">Name (Z → A)</option>
                          <option value="cost_desc" className="bg-slate-950 text-slate-200">CP (High → Low)</option>
                          <option value="cost_asc" className="bg-slate-950 text-slate-200">CP (Low → High)</option>
                          <option value="category" className="bg-slate-950 text-slate-200">Category</option>
                        </select>
                      </div>

                      {/* Segmented Mode Switcher */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono shrink-0">
                        <button
                          type="button"
                          onClick={() => setFeaturesViewMode('my-features')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            featuresViewMode === 'my-features'
                              ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          My Features ({standardFeatures.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeaturesViewMode('recommended')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            featuresViewMode === 'recommended'
                              ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>Recommended ({recommendedFeatures.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeaturesViewMode('catalog')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            featuresViewMode === 'catalog'
                              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Complete Catalog ({DEFAULT_FEATURES.length})
                        </button>
                      </div>

                      {/* Search Input */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={myFeaturesSearchQuery}
                          onChange={(e) => setMyFeaturesSearchQuery(e.target.value)}
                          placeholder="Search my features..."
                          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none"
                        />
                        {myFeaturesSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setMyFeaturesSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {filteredMyFeatures.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-xs text-slate-400">
                      No acquired features match your current filter and search criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredMyFeatures.map((rawItem) => {
                        const item = enrichItemWithModifiers(rawItem);
                        const name = typeof item === 'object' ? (item.name || item.title) : item;
                        const featPillars = getPillarFeatureRecommendations(item, pillarFeatureSets, characterData);
                        const cpCost = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
                        const desc = typeof item === 'object' ? (item.description || item.mechanic || item.summary || '') : '';
                        const featMechanic = typeof item === 'object' ? (item.mechanic || item.mechanics || '') : '';
                        const featModifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];
                        const prereqResult = checkPrerequisite(item, characterData, 'features');
                        const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;
                        const featCategory = typeof item === 'object' ? (item.category || item.type || 'General') : 'General';

                        return (
                          <div
                            key={`${item.sourceList}_${item.sourceIndex}`}
                            data-context-zone="folio"
                            data-context-category="features"
                            data-context-subcategory={featCategory.toLowerCase()}
                            data-context-entity-id={item.id || `feat_${item.sourceIndex}`}
                            data-context-entity-type="feature"
                            data-context-entity-title={name}
                            data-context-entity-data={JSON.stringify(getEnrichedFeatureData(item))}
                            className={`border rounded-lg p-2.5 shadow-sm flex flex-col justify-between gap-1.5 transition-all group relative ${
                              isPrereqUnmet
                                ? 'bg-slate-950/70 border-dashed border-rose-900/60 opacity-75'
                                : 'bg-slate-950/80 border-slate-800 hover:border-cyan-700/60'
                            }`}
                          >
                            {/* Line 1: Complete Name + Pillar Dots + Tooltip Info */}
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <FolioTooltip
                                title={name}
                                badge={featCategory}
                                badgeColor="cyan"
                                description={desc || 'Persona feature.'}
                                formula={featMechanic || undefined}
                                modifiers={featModifiers}
                                prerequisites={item.prerequisites || undefined}
                                prerequisiteMet={!isPrereqUnmet}
                                prerequisiteUnmetReasons={prereqResult.unmetReasons}
                                cost={`${cpCost * (item.rank || 1)} CP`}
                                rules={item.rules || item.special_rules}
                                notes={item.notes}
                                tags={[
                                  featCategory, 
                                  getAcquisitionBadgeConfig(item)?.label ? `Model: ${getAcquisitionBadgeConfig(item).label}` : null,
                                  item.is_ranked ? `Rank ${item.rank || 1}/${item.max_rank || 5}` : null,
                                  item.modifier_options?.enabled ? `Skill Choice: ${item.modifier_options.mode === 'pair' ? 'Pair' : 'Single'}` : null
                                ].filter(Boolean)}
                                adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenFeatureDataset(item, item.sourceIndex) } : null}
                                showInfoIcon={true}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                                    {name}
                                  </h4>
                                  <PillarMarkerDots recommendations={featPillars} />
                                </div>
                              </FolioTooltip>

                              {item.is_ranked && (
                                <div className="flex items-center gap-1 bg-slate-900 border border-cyan-800/60 rounded px-1.5 py-0.5 shrink-0" title="Ranked Feature">
                                  <span className="text-[9px] font-mono text-slate-400 font-bold">RK</span>
                                  <span className="text-[10px] font-mono font-bold text-cyan-300">{item.rank || 1}</span>
                                  <div className="flex items-center ml-0.5 border-l border-slate-700 pl-1">
                                    <button
                                      type="button"
                                      disabled={(item.rank || 1) <= 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateFeatureRank(item, (item.rank || 1) - 1);
                                      }}
                                      className="px-0.5 text-[10px] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                      title="Decrease rank"
                                    >
                                      -
                                    </button>
                                    <span className="text-slate-600 text-[10px] mx-0.5">/</span>
                                    <button
                                      type="button"
                                      disabled={(item.rank || 1) >= (item.max_rank || 5)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateFeatureRank(item, (item.rank || 1) + 1);
                                      }}
                                      className="px-0.5 text-[10px] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                      title="Increase rank"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Operator Skill Option Selector Row (When modifier_options enabled or group choice modifier exists) */}
                            <SkillChoiceSelector item={item} itemType="feature" compact />

                            {/* Line 2: Notes / Category & Controls */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border shrink-0 ${getTypeBadgeStyle(featCategory)}`}>
                                  {featCategory}
                                </span>
                                {(() => {
                                  const acqCfg = getAcquisitionBadgeConfig(item);
                                  return (
                                    <span 
                                      className={`px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border shrink-0 ${acqCfg.badgeClass}`}
                                      title={acqCfg.title}
                                    >
                                      {acqCfg.label}
                                    </span>
                                  );
                                })()}
                                {item.notes && (
                                  <span className="text-[10.5px] font-sans text-slate-400 italic truncate" title={item.notes}>
                                    {item.notes}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                                  {cpCost * (item.rank || 1)} CP
                                </span>

                                {(isAdmin || onOpenAssetModal) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenFeatureDataset(item, item.sourceIndex);
                                    }}
                                    className="text-slate-400 hover:text-cyan-300 text-xs p-1 rounded hover:bg-slate-900 border border-transparent hover:border-cyan-500/50 transition-colors cursor-pointer"
                                    title={`View / Edit ${name} Dataset (Matrix Studio)`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(item)}
                                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove feature"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MODE B: PILLAR RECOMMENDED FEATURES (-1 CP DISCOUNT) */}
          {featuresViewMode === 'recommended' && (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-amber-200">
                    Showing <strong>{recommendedFeatures.length} features</strong> recommended by your character's chosen Species, Occupation, Origin, Faction, or Archetype. Each discounted by <strong>-1 CP</strong> (3 CP &rarr; 2 CP).
                  </p>
                </div>
                <PillarRecommendationLegend />
              </div>

              {/* Filter & Sort Controls for Recommended Features */}
              <div className="space-y-2.5">
                {/* Category Filter Pills - all options visible, wrapped, no sliders */}
                <div className="flex flex-wrap items-center gap-1.5 w-full">
                  {recommendedCategories.map((cat) => {
                    const activeCat = recommendedCategoryTab || recommendedCategories[0] || 'ALL';
                    const isActive = activeCat === cat;
                    const count = recommendedCategoryCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setRecommendedCategoryTab(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-amber-950 border border-amber-400 text-amber-200'
                            : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                          isActive ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-900 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Row down: Sort, View Switcher & Search Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                    <select
                      value={recommendedSortOption}
                      onChange={(e) => setRecommendedSortOption(e.target.value)}
                      className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer pr-1 font-mono font-medium"
                    >
                      <option value="recommended" className="bg-slate-950 text-slate-200">Recommended Match</option>
                      <option value="discount" className="bg-slate-950 text-slate-200">Discounted First</option>
                      <option value="az" className="bg-slate-950 text-slate-200">Name (A → Z)</option>
                      <option value="za" className="bg-slate-950 text-slate-200">Name (Z → A)</option>
                      <option value="cost_desc" className="bg-slate-950 text-slate-200">CP (High → Low)</option>
                      <option value="cost_asc" className="bg-slate-950 text-slate-200">CP (Low → High)</option>
                    </select>
                  </div>

                  {/* Segmented Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono shrink-0">
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('my-features')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        featuresViewMode === 'my-features'
                          ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      My Features ({standardFeatures.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('recommended')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        featuresViewMode === 'recommended'
                          ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Star className="w-3 h-3 text-amber-400" />
                      <span>Recommended ({recommendedFeatures.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('catalog')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        featuresViewMode === 'catalog'
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Complete Catalog ({DEFAULT_FEATURES.length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={recommendedSearchQuery}
                      onChange={(e) => setRecommendedSearchQuery(e.target.value)}
                      placeholder="Search recommended..."
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none"
                    />
                    {recommendedSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setRecommendedSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredRecommendedFeatures.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-xs text-slate-400">
                  No recommended features match your current filter and search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRecommendedFeatures.map((feat) => {
                  const acquired = feat.isAcquired;
                  const discountInfo = feat.discountInfo;
                  const recs = feat.recommendingPillars;
                  const featCategory = feat.category || feat.type || 'General';
                  const prereqResult = checkPrerequisite(feat, characterData, 'features');
                  const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                  return (
                    <div
                      key={feat.id}
                      data-context-zone="folio"
                      data-context-category="features"
                      data-context-subcategory={featCategory.toLowerCase()}
                      data-context-entity-id={feat.id}
                      data-context-entity-type="feature"
                      data-context-entity-title={feat.name}
                      data-context-entity-data={JSON.stringify(getEnrichedFeatureData(feat))}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                        acquired
                          ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                          : isPrereqUnmet
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                          : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.08)]'
                      }`}
                    >
                      {/* Line 1: Complete Name + Pillar Dots + Tooltip Info */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <FolioTooltip
                          title={feat.name}
                          badge={featCategory}
                          badgeColor="amber"
                          description={feat.description || 'Pillar recommended feature.'}
                          formula={feat.mechanic || undefined}
                          modifiers={Array.isArray(feat.modifiers) ? feat.modifiers : []}
                          prerequisites={prereqResult.prerequisiteText}
                          prerequisiteMet={!isPrereqUnmet}
                          prerequisiteUnmetReasons={prereqResult.unmetReasons}
                          cost={`${discountInfo.finalCost} CP (Base: ${discountInfo.baseCost || 3} CP, -${discountInfo.totalDiscount || 1} CP Discount)`}
                          rules={feat.rules || feat.special_rules}
                          notes={feat.notes}
                          tags={[
                            featCategory, 
                            getAcquisitionBadgeConfig(feat)?.label ? `Model: ${getAcquisitionBadgeConfig(feat).label}` : null,
                            (feat.modifier_options?.enabled || (Array.isArray(feat.modifiers) && feat.modifiers.some(m => m.mode === 'group_choice')))
                              ? (feat.modifier_options?.mode === 'group_pool' || feat.modifiers?.some(m => m.mode === 'group_choice')
                                  ? `Skill Pool: ${feat.modifier_options?.group_label || feat.modifiers?.find(m => m.mode === 'group_choice')?.target || 'Group'} (Pick up to ${feat.modifier_options?.max_skills || feat.modifiers?.find(m => m.mode === 'group_choice')?.max_choices || 2} at +${feat.modifier_options?.value || feat.modifiers?.find(m => m.mode === 'group_choice')?.value || 2})`
                                  : `Skill Choice: ${feat.modifier_options?.mode === 'pair' ? 'Pairs' : 'Single'} (${(feat.modifier_options?.options || []).length} Options)`)
                              : null,
                            ...recs.map(p => `${p.name}: ${p.detail}`)
                          ].filter(Boolean)}
                          adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenFeatureDataset(feat) } : null}
                          showInfoIcon={true}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h5 className="font-bold text-xs text-slate-100 group-hover:text-amber-300 transition-colors">
                              {feat.name}
                            </h5>
                            <PillarMarkerDots recommendations={recs} />
                          </div>
                        </FolioTooltip>
                      </div>

                      {acquired && <SkillChoiceSelector item={feat} itemType="feature" compact />}

                      {/* Line 2: Category / Notes & Controls */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border shrink-0 ${getTypeBadgeStyle(featCategory)}`}>
                            {featCategory}
                          </span>
                          {(() => {
                            const acqCfg = getAcquisitionBadgeConfig(feat);
                            return (
                              <span 
                                className={`px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border shrink-0 ${acqCfg.badgeClass}`}
                                title={acqCfg.title}
                              >
                                {acqCfg.label}
                              </span>
                            );
                          })()}
                          {(feat.modifier_options?.enabled || (Array.isArray(feat.modifiers) && feat.modifiers.some(m => m.mode === 'group_choice'))) && (
                            <span 
                              className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border border-amber-600/70 bg-amber-950/60 text-amber-300 shrink-0"
                              title={
                                feat.modifier_options?.mode === 'group_pool' || feat.modifiers?.some(m => m.mode === 'group_choice')
                                  ? `Skill Check Modifier: Operator chooses up to ${feat.modifier_options?.max_skills || feat.modifiers?.find(m => m.mode === 'group_choice')?.max_choices || 2} skills (+${feat.modifier_options?.value || feat.modifiers?.find(m => m.mode === 'group_choice')?.value || 2} each)`
                                  : `Skill Check Modifier: Operator chooses between ${(feat.modifier_options?.options || []).length} ${feat.modifier_options?.mode === 'pair' ? 'skill pairs' : 'skills'}`
                              }
                            >
                              Choice: {feat.modifier_options?.mode === 'group_pool' || feat.modifiers?.some(m => m.mode === 'group_choice') ? 'Skill Group' : (feat.modifier_options?.mode === 'pair' ? 'Pair' : 'Skill')}
                            </span>
                          )}
                          {feat.notes ? (
                            <span className="text-[10.5px] font-sans text-slate-400 italic truncate" title={feat.notes}>
                              {feat.notes}
                            </span>
                          ) : recs.length > 0 ? (
                            <span className="text-[10px] font-mono text-amber-400/80 truncate">
                              {recs.map(r => r.name).join(' • ')}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 font-mono">
                            <span className="text-[9px] line-through text-slate-500">
                              {discountInfo.baseCost || 3} CP
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300">
                              {discountInfo.finalCost} CP
                            </span>
                          </div>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFeatureDataset(feat);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-transparent hover:border-amber-500/50 transition-colors cursor-pointer"
                              title={`View / Edit ${feat.name} Dataset (Matrix Studio)`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {!acquired ? (
                            isPrereqUnmet ? (
                              <button
                                type="button"
                                disabled
                                className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                              >
                                <Lock className="w-3 h-3 text-rose-400" />
                                <span>Locked</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddItem('features', {
                                  id: feat.id || `feat_${Date.now()}`,
                                  name: feat.name,
                                  category: featCategory,
                                  type: (feat.type || featCategory || 'general').toLowerCase(),
                                  cp: discountInfo.finalCost,
                                  baseCp: discountInfo.baseCost,
                                  isDiscounted: true,
                                  is_ranked: !!feat.is_ranked,
                                  rank: 1,
                                  max_rank: feat.max_rank || (feat.is_ranked ? 5 : undefined),
                                  is_multiple: !!feat.is_multiple,
                                  multi: !!feat.multi,
                                  staged: !!feat.staged,
                                  acquisition_type: feat.acquisition_type || (feat.is_multiple ? 'Multiple' : feat.is_ranked ? 'Staged' : 'Basic'),
                                  modifier_options: feat.modifier_options || { enabled: false, mode: 'single', value: 2, options: [] },
                                  selected_option_id: feat.selected_option_id || '',
                                  selected_skills: Array.isArray(feat.selected_skills) ? feat.selected_skills : [],
                                  prerequisites: feat.prerequisites || '',
                                  modifiers: Array.isArray(feat.modifiers) ? feat.modifiers : [],
                                  costs: {
                                    bp: discountInfo.finalCost,
                                    credits: 0,
                                    nodes: 0,
                                    sockets: 0,
                                    strain: 0,
                                    focus: 0,
                                    ap: 0
                                  },
                                  description: feat.description || '',
                                  mechanic: feat.mechanic || feat.mechanics || '',
                                  rules: feat.rules || feat.special_rules || '',
                                  special_rules: feat.special_rules || feat.rules || '',
                                  notes: feat.notes || '',
                                  notesList: Array.isArray(feat.notesList) ? feat.notesList : []
                                })}
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Add</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                                <Check className="w-3 h-3" />
                                <span>In Folio{feat.acquiredCount > 1 ? ` (${feat.acquiredCount})` : ''}</span>
                              </span>
                              {(feat.is_multiple || feat.acquisition_type === 'Multiple' || feat.acquisition_type === 'Multi/Staged') && (
                                <button
                                  type="button"
                                  onClick={() => handleAddItem('features', {
                                    id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                                    name: feat.name,
                                    category: featCategory,
                                    type: (feat.type || featCategory || 'general').toLowerCase(),
                                    cp: discountInfo.finalCost,
                                    baseCp: discountInfo.baseCost,
                                    isDiscounted: true,
                                    is_ranked: !!feat.is_ranked,
                                    rank: 1,
                                    max_rank: feat.max_rank || (feat.is_ranked ? 5 : undefined),
                                    is_multiple: true,
                                    multi: true,
                                    staged: !!feat.staged,
                                    acquisition_type: feat.acquisition_type || 'Multiple',
                                    modifier_options: feat.modifier_options || { enabled: false, mode: 'single', value: 2, options: [] },
                                    selected_option_id: '',
                                    selected_skills: [],
                                    prerequisites: feat.prerequisites || '',
                                    modifiers: Array.isArray(feat.modifiers) ? feat.modifiers : [],
                                    costs: {
                                      bp: discountInfo.finalCost,
                                      credits: 0,
                                      nodes: 0,
                                      sockets: 0,
                                      strain: 0,
                                      focus: 0,
                                      ap: 0
                                    },
                                    description: feat.description || '',
                                    mechanic: feat.mechanic || feat.mechanics || '',
                                    rules: feat.rules || feat.special_rules || '',
                                    special_rules: feat.special_rules || feat.rules || '',
                                    notes: feat.notes || '',
                                    notesList: Array.isArray(feat.notesList) ? feat.notesList : []
                                  })}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-950 hover:bg-blue-900 border border-blue-600 text-blue-200 transition-all flex items-center gap-0.5 cursor-pointer"
                                  title="Add another copy of this multiple-acquisition feature for a different asset or purpose"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Another</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const acq = getAcquiredFeature(feat.name || feat.title || feat.id);
                                  if (acq) handleRemoveFeature(acq);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                title="Remove feature"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

          {/* MODE C: COMPLETE FEATURES CATALOG BROWSER */}
          {featuresViewMode === 'catalog' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="space-y-2.5">
                {/* Category Filter Pills - all options visible, wrapped, no sliders */}
                <div className="flex flex-wrap items-center gap-1.5 w-full">
                  {catalogCategories.map((cat) => {
                    const activeCat = catalogCategoryTab || catalogCategories[0] || 'ALL';
                    const isActive = activeCat === cat;
                    const count = catalogCategoryData.counts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCatalogCategoryTab(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-cyan-950 border border-cyan-400 text-cyan-200'
                            : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                          isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-900 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Row down: Sort, View Switcher & Search Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                    <select
                      value={catalogSortOption}
                      onChange={(e) => setCatalogSortOption(e.target.value)}
                      className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer pr-1 font-mono font-medium"
                    >
                      <option value="recommended" className="bg-slate-950 text-slate-200">Recommended Sort</option>
                      <option value="prereq" className="bg-slate-950 text-slate-200">Prerequisites Met First</option>
                      <option value="az" className="bg-slate-950 text-slate-200">Name (A → Z)</option>
                      <option value="za" className="bg-slate-950 text-slate-200">Name (Z → A)</option>
                      <option value="cost_desc" className="bg-slate-950 text-slate-200">CP (High → Low)</option>
                      <option value="cost_asc" className="bg-slate-950 text-slate-200">CP (Low → High)</option>
                    </select>
                  </div>

                  {/* Segmented Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono shrink-0">
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('my-features')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        featuresViewMode === 'my-features'
                          ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      My Features ({standardFeatures.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('recommended')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        featuresViewMode === 'recommended'
                          ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Star className="w-3 h-3 text-amber-400" />
                      <span>Recommended ({recommendedFeatures.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturesViewMode('catalog')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        featuresViewMode === 'catalog'
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Complete Catalog ({DEFAULT_FEATURES.length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={featuresSearchQuery}
                      onChange={(e) => setFeaturesSearchQuery(e.target.value)}
                      placeholder="Search all features..."
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none"
                    />
                    {featuresSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setFeaturesSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCatalogFeatures.map((feat) => {
                  const acquired = feat.isAcquired;
                  const discountInfo = feat.discountInfo;
                  const recs = feat.recommendingPillars;
                  const featCategory = feat.category || feat.type || 'General';
                  const prereqResult = checkPrerequisite(feat, characterData, 'features');
                  const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;
                  const isSpeciesFeature = featCategory === 'Species' || (feat.type || '').toLowerCase() === 'species' || feat.source === 'species';
                  const isPurchasable = isSpeciesFeature
                    ? Boolean(feat.isPurchasable || feat.purchasable || feat.purchasableByCharacter || feat.is_purchasable)
                    : true;

                  return (
                    <div
                      key={feat.id}
                      data-context-zone="folio"
                      data-context-category="features"
                      data-context-subcategory={featCategory.toLowerCase()}
                      data-context-entity-id={feat.id}
                      data-context-entity-type="feature"
                      data-context-entity-title={feat.name}
                      data-context-entity-data={JSON.stringify(getEnrichedFeatureData(feat))}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                        acquired
                          ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                          : isPrereqUnmet
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                          : discountInfo.isDiscounted
                          ? 'bg-amber-950/15 border-amber-500/40 hover:border-amber-400/60'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Line 1: Complete Name + Pillar Dots + Tooltip Info */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <FolioTooltip
                          title={feat.name}
                          badge={featCategory}
                          badgeColor={discountInfo.isDiscounted ? 'amber' : 'cyan'}
                          description={feat.description || 'Persona feature.'}
                          formula={feat.mechanic || undefined}
                          modifiers={Array.isArray(feat.modifiers) ? feat.modifiers : []}
                          prerequisites={prereqResult.prerequisiteText}
                          prerequisiteMet={!isPrereqUnmet}
                          prerequisiteUnmetReasons={prereqResult.unmetReasons}
                          cost={discountInfo.isDiscounted ? `${discountInfo.finalCost} CP (Discounted from 3 CP)` : '3 CP'}
                          rules={feat.rules || feat.special_rules}
                          notes={feat.notes}
                          tags={[
                            featCategory, 
                            getAcquisitionBadgeConfig(feat)?.label ? `Model: ${getAcquisitionBadgeConfig(feat).label}` : null,
                            (feat.modifier_options?.enabled || (Array.isArray(feat.modifiers) && feat.modifiers.some(m => m.mode === 'group_choice')))
                              ? (feat.modifier_options?.mode === 'group_pool' || feat.modifiers?.some(m => m.mode === 'group_choice')
                                  ? `Skill Pool: ${feat.modifier_options?.group_label || feat.modifiers?.find(m => m.mode === 'group_choice')?.target || 'Group'} (Pick up to ${feat.modifier_options?.max_skills || feat.modifiers?.find(m => m.mode === 'group_choice')?.max_choices || 2} at +${feat.modifier_options?.value || feat.modifiers?.find(m => m.mode === 'group_choice')?.value || 2})`
                                  : `Skill Choice: ${feat.modifier_options?.mode === 'pair' ? 'Pairs' : 'Single'} (${(feat.modifier_options?.options || []).length} Options)`)
                              : null,
                            ...recs.map(r => r.name)
                          ].filter(Boolean)}
                          adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenFeatureDataset(feat) } : null}
                          showInfoIcon={true}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h5 className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                              {feat.name}
                            </h5>
                            <PillarMarkerDots recommendations={recs} />
                          </div>
                        </FolioTooltip>
                      </div>

                      {acquired && <SkillChoiceSelector item={feat} itemType="feature" compact />}

                      {/* Line 2: Category / Notes & Controls */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border shrink-0 ${getTypeBadgeStyle(featCategory)}`}>
                            {featCategory}
                          </span>
                          {(() => {
                            const acqCfg = getAcquisitionBadgeConfig(feat);
                            return (
                              <span 
                                className={`px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border shrink-0 ${acqCfg.badgeClass}`}
                                title={acqCfg.title}
                              >
                                {acqCfg.label}
                              </span>
                            );
                          })()}
                          {(feat.modifier_options?.enabled || (Array.isArray(feat.modifiers) && feat.modifiers.some(m => m.mode === 'group_choice'))) && (
                            <span 
                              className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border border-cyan-700/60 bg-cyan-950/50 text-cyan-300 shrink-0"
                              title={
                                feat.modifier_options?.mode === 'group_pool' || feat.modifiers?.some(m => m.mode === 'group_choice')
                                  ? `Skill Check Modifier: Operator chooses up to ${feat.modifier_options?.max_skills || feat.modifiers?.find(m => m.mode === 'group_choice')?.max_choices || 2} skills (+${feat.modifier_options?.value || feat.modifiers?.find(m => m.mode === 'group_choice')?.value || 2} each)`
                                  : `Skill Check Modifier: Operator chooses between ${(feat.modifier_options?.options || []).length} ${feat.modifier_options?.mode === 'pair' ? 'skill pairs' : 'skills'}`
                              }
                            >
                              Choice: {feat.modifier_options?.mode === 'group_pool' || feat.modifiers?.some(m => m.mode === 'group_choice') ? 'Skill Group' : (feat.modifier_options?.mode === 'pair' ? 'Pair' : 'Skill')}
                            </span>
                          )}
                          {feat.notes && (
                            <span className="text-[10.5px] font-sans text-slate-400 italic truncate" title={feat.notes}>
                              {feat.notes}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 font-mono">
                            {discountInfo.isDiscounted && (
                              <span className="text-[9px] line-through text-slate-500">3 CP</span>
                            )}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              discountInfo.isDiscounted
                                ? 'bg-amber-950 border border-amber-500 text-amber-300'
                                : 'bg-slate-900 border border-slate-800 text-cyan-300'
                            }`}>
                              {discountInfo.finalCost} CP
                            </span>
                          </div>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFeatureDataset(feat);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-cyan-500/50 transition-colors cursor-pointer"
                              title={`View / Edit ${feat.name} Dataset (Matrix Studio)`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {!acquired ? (
                            !isPurchasable ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800" title="Species feature baseline is not directly purchasable by character.">
                                Baseline
                              </span>
                            ) : isPrereqUnmet ? (
                              <button
                                type="button"
                                disabled
                                className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                              >
                                <Lock className="w-3 h-3 text-rose-400" />
                                <span>Locked</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddItem('features', {
                                  id: feat.id || `feat_${Date.now()}`,
                                  name: feat.name,
                                  category: featCategory,
                                  type: (feat.type || featCategory || 'general').toLowerCase(),
                                  cp: discountInfo.finalCost,
                                  baseCp: discountInfo.baseCost,
                                  isDiscounted: discountInfo.isDiscounted,
                                  is_ranked: !!feat.is_ranked,
                                  rank: 1,
                                  max_rank: feat.max_rank || (feat.is_ranked ? 5 : undefined),
                                  is_multiple: !!feat.is_multiple,
                                  multi: !!feat.multi,
                                  staged: !!feat.staged,
                                  acquisition_type: feat.acquisition_type || (feat.is_multiple ? 'Multiple' : feat.is_ranked ? 'Staged' : 'Basic'),
                                  modifier_options: feat.modifier_options || { enabled: false, mode: 'single', value: 2, options: [] },
                                  selected_option_id: feat.selected_option_id || '',
                                  selected_skills: Array.isArray(feat.selected_skills) ? feat.selected_skills : [],
                                  prerequisites: feat.prerequisites || '',
                                  modifiers: Array.isArray(feat.modifiers) ? feat.modifiers : [],
                                  costs: {
                                    bp: discountInfo.finalCost,
                                    credits: 0,
                                    nodes: 0,
                                    sockets: 0,
                                    strain: 0,
                                    focus: 0,
                                    ap: 0
                                  },
                                  description: feat.description || '',
                                  mechanic: feat.mechanic || feat.mechanics || '',
                                  rules: feat.rules || feat.special_rules || '',
                                  special_rules: feat.special_rules || feat.rules || '',
                                  notes: feat.notes || '',
                                  notesList: Array.isArray(feat.notesList) ? feat.notesList : []
                                })}
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Add</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                                <Check className="w-3 h-3" />
                                <span>In Folio{feat.acquiredCount > 1 ? ` (${feat.acquiredCount})` : ''}</span>
                              </span>
                              {(feat.is_multiple || feat.acquisition_type === 'Multiple' || feat.acquisition_type === 'Multi/Staged') && (
                                <button
                                  type="button"
                                  onClick={() => handleAddItem('features', {
                                    id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                                    name: feat.name,
                                    category: featCategory,
                                    type: (feat.type || featCategory || 'general').toLowerCase(),
                                    cp: discountInfo.finalCost,
                                    baseCp: discountInfo.baseCost,
                                    isDiscounted: discountInfo.isDiscounted,
                                    is_ranked: !!feat.is_ranked,
                                    rank: 1,
                                    max_rank: feat.max_rank || (feat.is_ranked ? 5 : undefined),
                                    is_multiple: true,
                                    multi: true,
                                    staged: !!feat.staged,
                                    acquisition_type: feat.acquisition_type || 'Multiple',
                                    modifier_options: feat.modifier_options || { enabled: false, mode: 'single', value: 2, options: [] },
                                    selected_option_id: '',
                                    selected_skills: [],
                                    prerequisites: feat.prerequisites || '',
                                    modifiers: Array.isArray(feat.modifiers) ? feat.modifiers : [],
                                    costs: {
                                      bp: discountInfo.finalCost,
                                      credits: 0,
                                      nodes: 0,
                                      sockets: 0,
                                      strain: 0,
                                      focus: 0,
                                      ap: 0
                                    },
                                    description: feat.description || '',
                                    mechanic: feat.mechanic || feat.mechanics || '',
                                    rules: feat.rules || feat.special_rules || '',
                                    special_rules: feat.special_rules || feat.rules || '',
                                    notes: feat.notes || '',
                                    notesList: Array.isArray(feat.notesList) ? feat.notesList : []
                                  })}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-950 hover:bg-blue-900 border border-blue-600 text-blue-200 transition-all flex items-center gap-0.5 cursor-pointer"
                                  title="Add another copy of this multiple-acquisition feature for a different asset or purpose"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Another</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const acq = getAcquiredFeature(feat.name || feat.title || feat.id);
                                  if (acq) handleRemoveFeature(acq);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                title="Remove feature"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: COLUMN-SPECIFIC TRAITS (1 CP FLAT · CHOSEN FROM COLUMNS)   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'traits' && (
        <div className="space-y-5">
          {/* Acquired Column Heritage Traits Bar */}
          {characterTraits.length > 0 && (
            <div className="bg-slate-900/80 border border-emerald-900/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acquired Heritage Traits ({characterTraits.length})</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {totalTraitsCP} CP Total
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {characterTraits.map((t, tIdx) => {
                  const tName = t.name || t.title || 'Trait';
                  const tierCost = getCanonicalTraitCost(t);
                  const tCost = (t.isInherent || t.cp === 0) ? formatGrantedCost(0, tierCost, 'CP') : `${t.cp || tierCost} CP`;
                  const tCol = t.columnCategory || t.columnSource || 'Heritage';
                  const tColor = tCol === 'Species' ? 'cyan' : tCol === 'Origin' ? 'emerald' : tCol === 'Occupation' ? 'sky' : tCol === 'Archetype' ? 'amber' : 'purple';
                  return (
                    <div
                      key={`acq_t_${tIdx}`}
                      data-context-zone="folio"
                      data-context-category="traits"
                      data-context-subcategory="traits"
                      data-context-entity-id={t.id || t.name}
                      data-context-entity-type="trait"
                      data-context-entity-title={tName}
                      data-context-entity-data={JSON.stringify(getEnrichedTraitData(t))}
                      className="p-2 rounded-lg border border-emerald-900/40 bg-slate-950/80 flex flex-col justify-between gap-1.5 text-xs hover:border-emerald-700/60 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <FolioTooltip
                            title={tName}
                            badge={`${tCol} Trait`}
                            badgeColor={tColor}
                            description={t.description || 'Acquired column heritage trait.'}
                            formula={t.mechanic ? `[${t.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                            modifiers={Array.isArray(t.modifiers) ? t.modifiers : []}
                            cost={tCost}
                            tags={[t.trait_tier || 'Basic', tCol].filter(Boolean)}
                            adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(t, t.sourceIndex ?? tIdx) } : null}
                            showInfoIcon={true}
                          >
                            <h5 className="font-bold text-xs text-slate-100 truncate hover:text-emerald-300 transition-colors">
                              {tName}
                            </h5>
                          </FolioTooltip>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {tCost}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTraitDataset(t, t.sourceIndex ?? tIdx);
                              }}
                              className="text-slate-400 hover:text-emerald-300 text-xs p-1 rounded hover:bg-slate-900 border border-transparent hover:border-emerald-500/50 transition-colors cursor-pointer"
                              title={`View / Edit ${tName} Dataset (Matrix Studio)`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveTrait(t)}
                            className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                            title="Remove trait"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {t.description && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {t.description}
                        </p>
                      )}
                      {t.mechanic && (
                        <p className="text-[10px] font-mono text-emerald-400/90 leading-snug">
                          [{t.mechanic.replace(/^\[|\]$/g, '')}]
                        </p>
                      )}

                      <SkillChoiceSelector item={t} itemType="trait" compact />

                      {t.package_traits && t.package_traits.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-900">
                          {t.package_traits.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-emerald-900/50 text-[8.5px] font-mono text-emerald-300/90"
                              title={sub.mechanic || sub.name}
                            >
                              {sub.name} <span className="text-emerald-500/70">[{sub.cp || sub.bp} CP]</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Column Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'species', label: `Species: ${columnsData.species.name || 'Not Chosen'}` },
              { id: 'archetype', label: `Archetype: ${columnsData.archetype?.name || 'Not Chosen'}` },
              { id: 'origin', label: `Origin: ${columnsData.origin.name || 'Not Chosen'}` },
              { id: 'occupation', label: `Occupation: ${columnsData.occupation.name || 'Not Chosen'}` },
              { id: 'faction', label: `Faction: ${columnsData.faction.name || 'Not Chosen'}` },
              { id: 'ALL', label: 'All Columns' }
            ].map(col => (
              <button
                key={col.id}
                type="button"
                onClick={() => setTraitsColumnTab(col.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  traitsColumnTab === col.id
                    ? 'bg-emerald-950 border border-emerald-400 text-emerald-200 shadow-sm'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>

          {/* 4 Column Panels */}
          <div className="space-y-6">
            
            {/* 1. SPECIES COLUMN */}
            {(traitsColumnTab === 'ALL' || traitsColumnTab === 'species') && (
              <div className="bg-slate-900/70 border border-cyan-900/60 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Species Column: {columnsData.species.name || 'No Species Selected'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {columnAvailableTraits.species.length} Available Choices
                  </span>
                </div>

                {!columnsData.species.name ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg flex items-center justify-between gap-2">
                    <span>No Species selected in Identity. Choose a Species to unlock its specific traits.</span>
                    {onNavigate && (
                      <button type="button" onClick={() => onNavigate('identity')} className="px-2 py-1 rounded bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold hover:text-white cursor-pointer">
                        Go to Identity
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnAvailableTraits.species.map((trait, idx) => {
                      const acquired = isTraitAcquired(trait.name || trait.id);
                      const rawTierCost = getCanonicalTraitCost(trait);
                      const traitCp = trait.isInherent ? 0 : rawTierCost;
                      const costDisplay = trait.isInherent ? formatGrantedCost(0, rawTierCost, 'CP') : `${traitCp} CP`;
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_${idx}`}
                          data-context-zone="folio"
                          data-context-category="traits"
                          data-context-subcategory="traits"
                          data-context-entity-id={trait.id || trait.name}
                          data-context-entity-type="trait"
                          data-context-entity-title={trait.name}
                          data-context-entity-data={JSON.stringify(getEnrichedTraitData(trait))}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                            acquired
                              ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm'
                              : isPrereqUnmet
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                              : 'bg-slate-950/80 border-slate-800 hover:border-cyan-700/60'
                          }`}
                        >
                          {/* Line 1: Complete Name + Tooltip Info */}
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <FolioTooltip
                              title={trait.name}
                              badge={trait.trait_type || 'Species Trait'}
                              badgeColor="cyan"
                              description={trait.description || 'Species heritage trait.'}
                              formula={trait.mechanic ? `[${trait.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={prereqResult.prerequisiteText}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost={costDisplay}
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Species Trait'].filter(Boolean)}
                              adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(trait) } : null}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-cyan-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

                          {trait.description && (
                            <p className="text-[11px] text-slate-300 leading-snug">
                              {trait.description}
                            </p>
                          )}
                          {trait.mechanic && (
                            <p className="text-[10px] font-mono text-cyan-300/90 leading-snug">
                              [{trait.mechanic.replace(/^\[|\]$/g, '')}]
                            </p>
                          )}

                          {acquired && <SkillChoiceSelector item={trait} itemType="trait" compact />}

                          {/* Packaged Sublist Pills */}
                          {trait.package_traits && trait.package_traits.length > 0 && (
                            <div className="flex flex-wrap gap-1 py-0.5">
                              {trait.package_traits.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-cyan-900/50 text-[8.5px] font-mono text-cyan-300 flex items-center gap-1"
                                  title={sub.mechanic || sub.name}
                                >
                                  <span>{sub.name}</span>
                                  <span className="text-[8px] text-cyan-400/70">[{sub.cp || sub.bp} CP]</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Line 2: Tier / Notes & Controls */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                              <span className="text-[9px] font-mono text-slate-400 uppercase shrink-0">
                                {trait.trait_tier || 'Basic'}
                              </span>
                              {trait.sourceDetail && (
                                <span className="text-[10px] font-sans text-slate-500 italic truncate" title={trait.sourceDetail}>
                                  {trait.sourceDetail}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shrink-0">
                                {costDisplay}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTraitDataset(trait);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-cyan-500/50 transition-colors cursor-pointer"
                                  title={`View / Edit ${trait.name} Dataset (Matrix Studio)`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!acquired ? (
                                isPrereqUnmet ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                    title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                                  >
                                    <Lock className="w-3 h-3 text-rose-400" />
                                    <span>Locked</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem('traits', {
                                      id: trait.id || `trait_${Date.now()}`,
                                      name: trait.name,
                                      category: 'traits',
                                      trait_type: trait.trait_type || 'Species Trait',
                                      trait_tier: trait.trait_tier || 'Basic',
                                      source: 'species',
                                      columnSource: 'Species',
                                      sourceDetail: trait.sourceDetail || 'Species Trait',
                                      cp: trait.isInherent ? 0 : traitCp,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add {trait.isInherent ? `(${costDisplay})` : `(${traitCp} CP)`}</span>
                                  </button>
                                )
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                                    <Check className="w-3 h-3" />
                                    <span>In Folio</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTrait(trait)}
                                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                    title="Remove trait"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. ORIGIN COLUMN (Primary + Secondary) */}
            {(traitsColumnTab === 'ALL' || traitsColumnTab === 'origin') && (
              <div className="bg-slate-900/70 border border-emerald-900/60 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Origin Column: {columnsData.origin.name || 'No Origin Selected'}
                      {columnsData.origin.secName && (
                        <span className="text-slate-400 font-normal lowercase ml-1">
                          (+ secondary: {columnsData.origin.secName})
                        </span>
                      )}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {columnAvailableTraits.origin.length} Available Choices
                  </span>
                </div>

                {!columnsData.origin.name ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg flex items-center justify-between gap-2">
                    <span>No Origin selected in Identity. Choose an Origin to unlock its specific traits.</span>
                    {onNavigate && (
                      <button type="button" onClick={() => onNavigate('identity')} className="px-2 py-1 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold hover:text-white cursor-pointer">
                        Go to Identity
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnAvailableTraits.origin.map((trait, idx) => {
                      const acquired = isTraitAcquired(trait.name || trait.id);
                      const traitCp = getCanonicalTraitCost(trait);
                      const costDisplay = `${traitCp} CP`;
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_${idx}`}
                          data-context-zone="folio"
                          data-context-category="traits"
                          data-context-subcategory="traits"
                          data-context-entity-id={trait.id || trait.name}
                          data-context-entity-type="trait"
                          data-context-entity-title={trait.name}
                          data-context-entity-data={JSON.stringify(getEnrichedTraitData(trait))}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                            acquired
                              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                              : isPrereqUnmet
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                              : 'bg-slate-950/80 border-slate-800 hover:border-emerald-700/60'
                          }`}
                        >
                          {/* Line 1: Complete Name + Tooltip Info */}
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <FolioTooltip
                              title={trait.name}
                              badge="Origin Trait"
                              badgeColor="emerald"
                              description={trait.description || 'Origin heritage trait.'}
                              formula={trait.mechanic ? `[${trait.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={prereqResult.prerequisiteText}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost={costDisplay}
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Origin Trait'].filter(Boolean)}
                              adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(trait) } : null}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-emerald-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

                          {trait.description && (
                            <p className="text-[11px] text-slate-300 leading-snug">
                              {trait.description}
                            </p>
                          )}
                          {trait.mechanic && (
                            <p className="text-[10px] font-mono text-emerald-400/90 leading-snug">
                              [{trait.mechanic.replace(/^\[|\]$/g, '')}]
                            </p>
                          )}

                          {acquired && <SkillChoiceSelector item={trait} itemType="trait" compact />}

                          {/* Line 2: Tier / Notes & Controls */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                              <span className="text-[9px] font-mono text-slate-400 uppercase shrink-0">
                                {trait.trait_tier || 'Basic'}
                              </span>
                              {trait.sourceDetail && (
                                <span className="text-[10px] font-sans text-slate-500 italic truncate" title={trait.sourceDetail}>
                                  {trait.sourceDetail}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold shrink-0">
                                {costDisplay}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTraitDataset(trait);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-900 border border-transparent hover:border-emerald-500/50 transition-colors cursor-pointer"
                                  title={`View / Edit ${trait.name} Dataset (Matrix Studio)`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!acquired ? (
                                isPrereqUnmet ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                    title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                                  >
                                    <Lock className="w-3 h-3 text-rose-400" />
                                    <span>Locked</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem('traits', {
                                      id: trait.id || `trait_${Date.now()}`,
                                      name: trait.name,
                                      category: 'traits',
                                      trait_type: 'Origin Trait',
                                      trait_tier: trait.trait_tier || 'Basic',
                                      source: 'origin',
                                      columnSource: 'Origin',
                                      sourceDetail: trait.sourceDetail || 'Origin Trait',
                                      cp: traitCp,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add ({traitCp} CP)</span>
                                  </button>
                                )
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                                    <Check className="w-3 h-3" />
                                    <span>In Folio</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTrait(trait)}
                                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                    title="Remove trait"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. OCCUPATION COLUMN (Primary + Secondary) */}
            {(traitsColumnTab === 'ALL' || traitsColumnTab === 'occupation') && (
              <div className="bg-slate-900/70 border border-sky-900/60 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-sky-950 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      Occupation Column: {columnsData.occupation.name || 'No Occupation Selected'}
                      {columnsData.occupation.secName && (
                        <span className="text-slate-400 font-normal lowercase ml-1">
                          (+ secondary: {columnsData.occupation.secName})
                        </span>
                      )}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {columnAvailableTraits.occupation.length} Available Choices
                  </span>
                </div>

                {!columnsData.occupation.name ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg flex items-center justify-between gap-2">
                    <span>No Occupation selected in Identity. Choose an Occupation to unlock its specific traits.</span>
                    {onNavigate && (
                      <button type="button" onClick={() => onNavigate('identity')} className="px-2 py-1 rounded bg-sky-950 border border-sky-600 text-sky-300 font-bold hover:text-white cursor-pointer">
                        Go to Identity
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnAvailableTraits.occupation.map((trait, idx) => {
                      const acquired = isTraitAcquired(trait.name || trait.id);
                      const traitCp = getCanonicalTraitCost(trait);
                      const costDisplay = `${traitCp} CP`;
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_${idx}`}
                          data-context-zone="folio"
                          data-context-category="traits"
                          data-context-subcategory="traits"
                          data-context-entity-id={trait.id || trait.name}
                          data-context-entity-type="trait"
                          data-context-entity-title={trait.name}
                          data-context-entity-data={JSON.stringify(getEnrichedTraitData(trait))}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                            acquired
                              ? 'bg-sky-950/20 border-sky-500/50 shadow-sm'
                              : isPrereqUnmet
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                              : 'bg-slate-950/80 border-slate-800 hover:border-sky-700/60'
                          }`}
                        >
                          {/* Line 1: Complete Name + Tooltip Info */}
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <FolioTooltip
                              title={trait.name}
                              badge="Occupation Trait"
                              badgeColor="sky"
                              description={trait.description || 'Occupation heritage trait.'}
                              formula={trait.mechanic ? `[${trait.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={prereqResult.prerequisiteText}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost={costDisplay}
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Occupation Trait'].filter(Boolean)}
                              adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(trait) } : null}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-sky-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

                          {trait.description && (
                            <p className="text-[11px] text-slate-300 leading-snug">
                              {trait.description}
                            </p>
                          )}
                          {trait.mechanic && (
                            <p className="text-[10px] font-mono text-sky-300/90 leading-snug">
                              [{trait.mechanic.replace(/^\[|\]$/g, '')}]
                            </p>
                          )}

                          {acquired && <SkillChoiceSelector item={trait} itemType="trait" compact />}

                          {/* Line 2: Tier / Notes & Controls */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                              <span className="text-[9px] font-mono text-slate-400 uppercase shrink-0">
                                {trait.trait_tier || 'Basic'}
                              </span>
                              {trait.sourceDetail && (
                                <span className="text-[10px] font-sans text-slate-500 italic truncate" title={trait.sourceDetail}>
                                  {trait.sourceDetail}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-sky-950 text-sky-300 border border-sky-800 font-bold shrink-0">
                                {costDisplay}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTraitDataset(trait);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-900 border border-transparent hover:border-sky-500/50 transition-colors cursor-pointer"
                                  title={`View / Edit ${trait.name} Dataset (Matrix Studio)`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!acquired ? (
                                isPrereqUnmet ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                    title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                                  >
                                    <Lock className="w-3 h-3 text-rose-400" />
                                    <span>Locked</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem('traits', {
                                      id: trait.id || `trait_${Date.now()}`,
                                      name: trait.name,
                                      category: 'traits',
                                      trait_type: 'Occupational Trait',
                                      trait_tier: trait.trait_tier || 'Basic',
                                      source: 'occupation',
                                      columnSource: 'Occupation',
                                      sourceDetail: trait.sourceDetail || 'Occupation Trait',
                                      cp: traitCp,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add ({traitCp} CP)</span>
                                  </button>
                                )
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono text-sky-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/60">
                                    <Check className="w-3 h-3" />
                                    <span>In Folio</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTrait(trait)}
                                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                    title="Remove trait"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. FACTION COLUMN (Primary + Secondary) */}
            {(traitsColumnTab === 'ALL' || traitsColumnTab === 'faction') && (
              <div className="bg-slate-900/70 border border-purple-900/60 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-purple-950 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Faction Column: {columnsData.faction.name || 'No Faction Selected'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {columnAvailableTraits.faction.length} Available Choices
                  </span>
                </div>

                {!columnsData.faction.name ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg flex items-center justify-between gap-2">
                    <span>No Faction selected in Identity. Choose a Faction to unlock its specific traits.</span>
                    {onNavigate && (
                      <button type="button" onClick={() => onNavigate('identity')} className="px-2 py-1 rounded bg-purple-950 border border-purple-600 text-purple-300 font-bold hover:text-white cursor-pointer">
                        Go to Identity
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnAvailableTraits.faction.length === 0 ? (
                      <p className="text-xs text-slate-500 col-span-full py-4 text-center italic">
                        No specific traits registered for this faction.
                      </p>
                    ) : (
                      columnAvailableTraits.faction.map((trait, idx) => {
                        const acquired = isTraitAcquired(trait.name || trait.id);
                        const traitCp = getCanonicalTraitCost(trait);
                        const costDisplay = `${traitCp} CP`;
                        const prereqResult = checkPrerequisite(trait, characterData, 'features');
                        const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                        return (
                          <div
                            key={`${trait.id || trait.name}_${idx}`}
                            data-context-zone="folio"
                            data-context-category="traits"
                            data-context-subcategory="traits"
                            data-context-entity-id={trait.id || trait.name}
                            data-context-entity-type="trait"
                            data-context-entity-title={trait.name}
                            data-context-entity-data={JSON.stringify(getEnrichedTraitData(trait))}
                            className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                              acquired
                                ? 'bg-purple-950/20 border-purple-500/50 shadow-sm'
                                : isPrereqUnmet
                                ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                                : 'bg-slate-950/80 border-slate-800 hover:border-purple-700/60'
                            }`}
                          >
                            {/* Line 1: Complete Name + Tooltip Info */}
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <FolioTooltip
                                title={trait.name}
                                badge="Faction Trait"
                                badgeColor="purple"
                                description={trait.description || 'Faction heritage trait.'}
                                formula={trait.mechanic ? `[${trait.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                                modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                                prerequisites={prereqResult.prerequisiteText}
                                prerequisiteMet={!isPrereqUnmet}
                                prerequisiteUnmetReasons={prereqResult.unmetReasons}
                                cost={costDisplay}
                                tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Faction Trait'].filter(Boolean)}
                                adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(trait) } : null}
                                showInfoIcon={true}
                              >
                                <h5 className="font-bold text-slate-100 text-xs group-hover:text-purple-300 transition-colors">
                                  {trait.name}
                                </h5>
                              </FolioTooltip>
                            </div>

                            {trait.description && (
                              <p className="text-[11px] text-slate-300 leading-snug">
                                {trait.description}
                              </p>
                            )}
                            {trait.mechanic && (
                              <p className="text-[10px] font-mono text-purple-300/90 leading-snug">
                                [{trait.mechanic.replace(/^\[|\]$/g, '')}]
                              </p>
                            )}

                            {acquired && <SkillChoiceSelector item={trait} itemType="trait" compact />}

                            {/* Line 2: Tier / Notes & Controls */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                                <span className="text-[9px] font-mono text-slate-400 uppercase shrink-0">
                                  {trait.trait_tier || 'Basic'}
                                </span>
                                {trait.sourceDetail && (
                                  <span className="text-[10px] font-sans text-slate-500 italic truncate" title={trait.sourceDetail}>
                                    {trait.sourceDetail}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-purple-950 text-purple-300 border border-purple-800 font-bold shrink-0">
                                  {costDisplay}
                                </span>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenTraitDataset(trait);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-slate-900 border border-transparent hover:border-purple-500/50 transition-colors cursor-pointer"
                                    title={`View / Edit ${trait.name} Dataset (Matrix Studio)`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!acquired ? (
                                  isPrereqUnmet ? (
                                    <button
                                      type="button"
                                      disabled
                                      className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                      title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                                    >
                                      <Lock className="w-3 h-3 text-rose-400" />
                                      <span>Locked</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAddItem('traits', {
                                        id: trait.id || `trait_${Date.now()}`,
                                        name: trait.name,
                                        category: 'traits',
                                        trait_type: 'Faction Trait',
                                        trait_tier: trait.trait_tier || 'Basic',
                                        source: 'faction',
                                        columnSource: 'Faction',
                                        sourceDetail: trait.sourceDetail || 'Faction Trait',
                                        cp: traitCp,
                                        description: trait.description,
                                        mechanic: trait.mechanic,
                                        modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                      })}
                                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-950 hover:bg-purple-900 border border-purple-600 text-purple-200 transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>+ Add ({traitCp} CP)</span>
                                    </button>
                                  )
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60">
                                      <Check className="w-3 h-3" />
                                      <span>In Folio</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTrait(trait)}
                                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                      title="Remove trait"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. ARCHETYPE COLUMN (1 CP) */}
            {(traitsColumnTab === 'ALL' || traitsColumnTab === 'archetype') && (
              <div className="bg-slate-900/70 border border-amber-900/60 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-950 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Archetype Column: {columnsData.archetype?.name || 'No Archetype Selected'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {columnAvailableTraits.archetype?.length || 0} Available Choices
                  </span>
                </div>

                {!columnsData.archetype?.name ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg flex items-center justify-between gap-2">
                    <span>No Archetype selected in Identity. Choose an Archetype to unlock its specific traits.</span>
                    {onNavigate && (
                      <button type="button" onClick={() => onNavigate('identity')} className="px-2 py-1 rounded bg-amber-950 border border-amber-600 text-amber-300 font-bold hover:text-white cursor-pointer">
                        Go to Identity
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnAvailableTraits.archetype.map((trait, idx) => {
                      const acquired = isTraitAcquired(trait.name || trait.id);
                      const traitCp = 1;
                      const costDisplay = `1 CP`;
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_arch_${idx}`}
                          data-context-zone="folio"
                          data-context-category="traits"
                          data-context-subcategory="traits"
                          data-context-entity-id={trait.id || trait.name}
                          data-context-entity-type="trait"
                          data-context-entity-title={trait.name}
                          data-context-entity-data={JSON.stringify(getEnrichedTraitData(trait))}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all group ${
                            acquired
                              ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                              : isPrereqUnmet
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale contrast-75 cursor-not-allowed'
                              : 'bg-slate-950/80 border-slate-800 hover:border-amber-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <FolioTooltip
                              title={trait.name}
                              badge="Archetype Trait"
                              badgeColor="amber"
                              description={trait.description || 'Archetype trait.'}
                              formula={trait.mechanic ? `[${trait.mechanic.replace(/^\[|\]$/g, '')}]` : undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={prereqResult.prerequisiteText}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost={costDisplay}
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Archetype Trait'].filter(Boolean)}
                              adminAction={isAdmin ? { label: 'View / Edit Dataset', onClick: () => handleOpenTraitDataset(trait) } : null}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-amber-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

                          {trait.description && (
                            <p className="text-[11px] text-slate-300 leading-snug">
                              {trait.description}
                            </p>
                          )}
                          {trait.mechanic && (
                            <p className="text-[10px] font-mono text-amber-300/90 leading-snug">
                              [{trait.mechanic.replace(/^\[|\]$/g, '')}]
                            </p>
                          )}

                          {acquired && <SkillChoiceSelector item={trait} itemType="trait" compact />}

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                              <span className="text-[9px] font-mono text-slate-400 uppercase shrink-0">
                                {trait.trait_tier || 'Basic'}
                              </span>
                              {trait.sourceDetail && (
                                <span className="text-[10px] font-sans text-slate-500 italic truncate" title={trait.sourceDetail}>
                                  {trait.sourceDetail}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold shrink-0">
                                {costDisplay}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTraitDataset(trait);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-transparent hover:border-amber-500/50 transition-colors cursor-pointer"
                                  title={`View / Edit ${trait.name} Dataset (Matrix Studio)`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!acquired ? (
                                isPrereqUnmet ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1 cursor-not-allowed"
                                    title={`Prerequisite unmet: ${prereqResult.unmetReasons?.join(', ')}`}
                                  >
                                    <Lock className="w-3 h-3 text-rose-400" />
                                    <span>Locked</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem('traits', {
                                      id: trait.id || `trait_${Date.now()}`,
                                      name: trait.name,
                                      category: 'traits',
                                      trait_type: 'Archetype Trait',
                                      trait_tier: trait.trait_tier || 'Basic',
                                      source: 'archetype',
                                      columnSource: 'Archetype',
                                      sourceDetail: trait.sourceDetail || 'Archetype Trait',
                                      cp: traitCp,
                                      bp: traitCp,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add (1 CP)</span>
                                  </button>
                                )
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                                    <Check className="w-3 h-3" />
                                    <span>In Folio</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTrait(trait)}
                                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                    title="Remove trait"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 3: METAPHYSICS & AWAKENED DISCIPLINES                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'metaphysics' && (
        <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-purple-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Metaphysics &amp; Awakened Disciplines</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Awakening a discipline costs 3 CP, unlocking the discipline and its paired skills. Attune is unlocked with your first awakening.
              </p>
            </div>
          </div>

          {/* Inner Tabs: Disciplines vs Invocations */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-1.5 rounded-xl border border-purple-950/80">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMetaInnerTab('disciplines')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  metaInnerTab === 'disciplines'
                    ? 'bg-purple-950 text-purple-200 border border-purple-500/70 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>🔮</span>
                <span>Awakened Disciplines ({awakenedList.length}/6)</span>
              </button>

              <button
                type="button"
                onClick={() => setMetaInnerTab('invocations')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  metaInnerTab === 'invocations'
                    ? 'bg-purple-950 text-purple-200 border border-purple-500/70 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>📜</span>
                <span>Invocations &amp; Special Abilities ({characterPowers.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Disciplines */}
          {metaInnerTab === 'disciplines' && (
            <div className="space-y-2.5">
              {METAPHYSICAL_DISCIPLINES.map((disc) => {
                const isAwakened = isDisciplineAwakened(disc.name);
                const pairedSkillNames = disc.skills.map(s => s.name).join(', ');
                const cardInvocations = invocationsByDiscipline[disc.name.toLowerCase()] || [];

                return (
                  <div
                    key={disc.id}
                    className={`rounded-xl p-3 sm:p-4 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 ${
                      isAwakened
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-sm ring-1 ring-purple-500/30'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-[260px] lg:max-w-xs xl:max-w-sm">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border shrink-0 ${
                        isAwakened ? 'bg-purple-950/90 border-purple-500/50 text-purple-200 shadow-inner' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {disc.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wide">
                            {disc.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                            isAwakened ? 'bg-purple-900 border border-purple-400 text-purple-100' : 'bg-slate-900 border border-slate-800 text-slate-500'
                          }`}>
                            {isAwakened ? '✨ Awakened' : '🔒 Dormant'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                          {disc.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <div className="flex-1 min-w-[130px] p-1.5 rounded-lg bg-slate-950/70 text-[10.5px] font-mono">
                        <span className="text-slate-400 block text-[9.5px] uppercase font-bold text-cyan-400/90 mb-0.5">
                          Paired Skills:
                        </span>
                        <span className={isAwakened ? 'text-purple-200 font-bold' : 'text-slate-400'}>
                          {pairedSkillNames}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-[10.5px] font-mono text-slate-400">
                          Invocations: <strong className="text-purple-300">{cardInvocations.length}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0">
                      <span className="text-[11px] font-mono text-slate-400">
                        Cost: <strong className="text-amber-300">3 CP</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAwakenedDiscipline(disc)}
                        className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          isAwakened
                            ? 'bg-purple-900/80 hover:bg-red-950 border border-purple-500 hover:border-red-600 text-purple-100 hover:text-red-200'
                            : 'bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300'
                        }`}
                      >
                        {isAwakened ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Awakened (3 CP)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-purple-400" />
                            <span>Awaken (3 CP)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Invocations & Powers */}
          {metaInnerTab === 'invocations' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMetaTypeFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      metaTypeFilter === 'all' ? 'bg-purple-950 text-purple-200 border border-purple-500/60' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Powers ({characterPowers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaTypeFilter('invocations')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      metaTypeFilter === 'invocations' ? 'bg-purple-950 text-purple-200 border border-purple-500/60' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Invocations ({learnedInvocations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaTypeFilter('special_abilities')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      metaTypeFilter === 'special_abilities' ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Special Abilities ({characterSpecialAbilities.length})
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-40 sm:w-48">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={metaSearchQuery}
                      onChange={(e) => setMetaSearchQuery(e.target.value)}
                      placeholder="Search powers..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none"
                    />
                  </div>

                  {onOpenSelectorModal && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal('invocations', 'Omnicortex Invocations Catalog', 'invocations')}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-950/90 hover:bg-purple-900 border border-purple-600/80 text-purple-200 flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        title="Browse and learn Invocations from the Omnicortex database"
                      >
                        <Plus className="w-3.5 h-3.5 text-purple-300" />
                        <span>Select Invocations</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal('special_abilities', 'Special Abilities Catalog', 'special_abilities')}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-600/80 text-cyan-200 flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        title="Browse and add Special Abilities from the database"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Select Abilities</span>
                      </button>
                    </>
                  )}

                  {onOpenMetaphysicsModal && (
                    <button
                      type="button"
                      onClick={() => onOpenMetaphysicsModal()}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/90 hover:bg-amber-900 border border-amber-600/80 text-amber-200 flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      title="Build custom Invocations or Special Abilities with the Metaphysics Manage Modal"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Manage / Build Power</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredCharacterPowers.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                  No invocations or special abilities match the active filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredCharacterPowers.map((power, pIdx) => {
                    const isInv = power.powerType === 'invocation';
                    const invRank = Math.min(10, Math.max(1, parseInt(power.rank || 1, 10)));
                    const discName = power.discipline || 'Metaphysics';
                    const powerName = power.name || (isInv ? 'Invocation' : 'Special Ability');

                    return (
                      <div
                        key={power.id || `${power.powerType}_${pIdx}`}
                        data-context-zone="folio"
                        data-context-category={isInv ? "invocations" : "features"}
                        data-context-subcategory={isInv ? "invocations" : (power.discipline || "metaphysics")}
                        data-context-entity-id={power.id || power.name}
                        data-context-entity-type={isInv ? "invocation" : "feature"}
                        data-context-entity-title={powerName}
                        data-context-entity-data={JSON.stringify(isInv ? getEnrichedInvocationData(power) : power)}
                        className="group relative flex flex-col justify-between gap-1.5 p-2.5 rounded-xl bg-slate-950/80 border border-purple-900/40 hover:border-purple-600/70 hover:bg-slate-900/90 transition-all shadow-sm"
                      >
                        {/* Line 1: Complete Name + Tooltip Info */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <FolioTooltip
                            title={powerName}
                            badge={isInv ? `Invocation • Lvl ${invRank}` : 'Metaphysics Ability'}
                            badgeColor={isInv ? 'purple' : 'cyan'}
                            description={power.description || power.body || 'No description provided.'}
                            cost={isInv ? '1 CP (Skill Spec)' : `${power.cp || 5} CP`}
                            modifiers={discName ? [{ label: 'Discipline', value: discName }] : []}
                            rules={power.rules || power.rule}
                            notes={power.notes || power.effect}
                            showInfoIcon={true}
                            adminAction={isAdmin ? {
                              label: isInv ? 'View / Edit Invocation Dataset' : 'View / Edit Dataset',
                              onClick: () => {
                                if (isInv) {
                                  handleOpenInvocationDataset(power, power.sourceIndex);
                                } else {
                                  handleOpenFeatureDataset(power, power.sourceIndex);
                                }
                              }
                            } : null}
                          >
                            <h4 className="font-bold text-xs text-slate-100 group-hover:text-purple-300 transition-colors">
                              {powerName}
                            </h4>
                          </FolioTooltip>
                        </div>

                        {/* Line 2: Discipline / Notes & Controls */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                            <span className={`shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                              isInv ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            }`}>
                              {isInv ? `Lvl ${invRank}` : 'Ability'}
                            </span>
                            <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {discName}
                            </span>
                            {power.notes && (
                              <span className="text-[10.5px] font-sans text-slate-400 italic truncate" title={power.notes}>
                                {power.notes}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isInv ? (
                              <div className="flex items-center gap-1 font-mono text-xs bg-slate-900/80 border border-slate-800 rounded px-1.5 py-0.5">
                                <span className="text-[9px] text-slate-400 mr-0.5">Lvl</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateInvocationRank(power.sourceIndex, invRank - 1)}
                                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-bold text-amber-300 px-1 text-xs">{invRank}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateInvocationRank(power.sourceIndex, invRank + 1)}
                                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                                {power.cp || 5} CP
                              </span>
                            )}

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (isInv) handleOpenInvocationDataset(power, power.sourceIndex);
                                  else handleOpenFeatureDataset(power, power.sourceIndex);
                                }}
                                className="p-1 text-slate-400 hover:text-cyan-300 rounded transition-colors cursor-pointer"
                                title={isInv ? "View / Edit Invocation Dataset" : "View / Edit Dataset"}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (isInv) handleDeleteItem('invocations', power.sourceIndex);
                                else handleDeleteItem('special_abilities', power.sourceIndex);
                              }}
                              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Remove power"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 4: AUGMENTATIONS MANAGER                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'augmentations' && (
        <AugmentationsManager
          onOpenSelectorModal={onOpenSelectorModal}
          onOpenAssetModal={onOpenAssetModal}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 5: HINDRANCES & DISADVANTAGES                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'hindrances' && (
        <div className="bg-slate-900/80 border border-rose-900/50 rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-rose-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Hindrances &amp; Disadvantages</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Character handicaps, social debts, and physiological flaws that yield Creation Point (CP) refunds.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 bg-rose-950/80 border border-rose-800 text-rose-300 font-bold rounded">
                {hindrancesList.length} Hindrances
              </span>
              <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold rounded">
                -{totalHindrancesRefund} CP Refund
              </span>
            </div>
          </div>

          {hindrancesList.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No hindrances selected. Taking hindrances grants bonus Creation Points (CP) to invest into attributes, skills, and features.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hindrancesList.map((item) => {
                const enrichedHindrance = getEnrichedHindranceData(item);
                const name = enrichedHindrance.name || (typeof item === 'object' ? (item.name || item.title) : item);
                const refundCp = enrichedHindrance.cp !== undefined ? enrichedHindrance.cp : (typeof item === 'object' && item.cp !== undefined ? item.cp : 3);
                const desc = enrichedHindrance.description || (typeof item === 'object' ? (item.description || item.summary || '') : '');
                const hindMechanic = enrichedHindrance.mechanics || enrichedHindrance.mechanic || (typeof item === 'object' ? (item.mechanic || item.mechanics || '') : '');
                const notes = enrichedHindrance.notes || (typeof item === 'object' ? (item.notes || item.note) : '');

                return (
                  <div
                    key={item.originalIndex}
                    data-context-zone="folio"
                    data-context-category="disadvantages"
                    data-context-subcategory="hindrances"
                    data-context-entity-id={enrichedHindrance.id || name}
                    data-context-entity-type="hindrance"
                    data-context-entity-title={name}
                    data-context-entity-data={JSON.stringify(enrichedHindrance)}
                    className="group relative flex flex-col justify-between gap-1.5 p-2.5 bg-slate-950/80 border border-slate-800 hover:border-rose-800/70 hover:bg-slate-900/90 rounded-xl transition-all shadow-sm"
                  >
                    {/* Line 1: Complete Name + Tooltip Info */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <FolioTooltip
                          title={name}
                          badge={`Hindrance • -${refundCp} CP`}
                          badgeColor="rose"
                          description={desc || 'No description provided.'}
                          cost={`-${refundCp} CP Refund`}
                          modifiers={hindMechanic ? [{ label: 'Mechanic', value: hindMechanic }] : []}
                          rules={enrichedHindrance.rules || (typeof item === 'object' ? (item.rules || item.rule) : undefined)}
                          notes={notes}
                          showInfoIcon={true}
                          adminAction={(isAdmin || Boolean(onOpenAssetModal)) ? {
                            label: 'View / Edit Dataset',
                            onClick: () => handleOpenHindranceDataset(item, item.sourceIndex ?? item.originalIndex)
                          } : null}
                        >
                          <span className="text-xs font-semibold text-slate-100 hover:text-rose-300 transition-colors">
                            {name}
                          </span>
                        </FolioTooltip>
                      </div>
                    </div>

                    {/* Line 2: Notes / Mechanic & Controls */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                        {hindMechanic ? (
                          <span className="text-[10px] font-mono text-rose-300/80 truncate" title={hindMechanic}>
                            {hindMechanic}
                          </span>
                        ) : notes ? (
                          <span className="text-[10.5px] font-sans text-slate-400 italic truncate" title={notes}>
                            {notes}
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-mono text-slate-500 uppercase">
                            Hindrance
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-slate-900 border border-slate-800 rounded">
                          -{refundCp} CP
                        </span>

                        {(isAdmin || Boolean(onOpenAssetModal)) && (
                          <button
                            type="button"
                            onClick={() => handleOpenHindranceDataset(item, item.sourceIndex ?? item.originalIndex)}
                            className="text-slate-400 hover:text-cyan-300 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                            title="View / Edit Hindrance Dataset"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveHindrance(item)}
                          className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Remove hindrance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {onOpenSelectorModal && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => onOpenSelectorModal('disadvantages', 'Hindrances Catalog', 'disadvantages')}
                className="py-2 px-6 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>+ Add Hindrance (Browse Catalog)</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default React.memo(FeaturesTab);
