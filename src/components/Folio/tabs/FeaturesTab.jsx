import React, { useState, useMemo, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
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
  ArrowUpDown
} from 'lucide-react';
import FolioTooltip from '../shared/FolioTooltip';
import { checkPrerequisite } from '../../../utils/prerequisiteEvaluator';
import { enrichItemWithModifiers } from '../../../engines/tangentModifierEngine';
import AugmentationsManager from '../augmentations/AugmentationsManager';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';
import { DEFAULT_OCCUPATIONS } from '../../../data/occupationsData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_ORIGINS } from '../../../data/originsData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { DEFAULT_FEATURES } from '../../../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { METAPHYSICAL_DISCIPLINES } from '../../../data/skillsData';
import { resolveCatalogItem } from '../../../engines/tangentIdentityEngine';
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

/**
 * Resolves a canonical trait object from ID or name
 */
const findCanonicalTrait = (traitIdOrName) => {
  if (!traitIdOrName) return null;
  if (typeof traitIdOrName === 'object' && traitIdOrName !== null && (traitIdOrName.name || traitIdOrName.title)) {
    return traitIdOrName;
  }
  const clean = String(traitIdOrName).trim().toLowerCase();
  const normalized = clean.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
  
  const found = ALL_CANONICAL_TRAITS.find(t => {
    const tId = (t.id || '').toLowerCase();
    const tName = (t.name || t.title || '').toLowerCase();
    const tNorm = tName.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
    return tId === clean || tName === clean || tNorm === normalized;
  });

  if (found) return found;

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
  const { openDiceRoller } = useDice();
  
  // Active main sub-tab
  const [selectedSubTab, setSelectedSubTab] = useState(
    activeSection === 'traits' ? 'traits' :
    activeSection === 'hindrances' ? 'hindrances' :
    activeSection === 'augmentations' ? 'augmentations' :
    activeSection === 'metaphysics' || activeSection === 'awakened' ? 'metaphysics' :
    'features'
  );

  // Features View Mode: 'my-features' | 'recommended' | 'catalog'
  const [featuresViewMode, setFeaturesViewMode] = useState('my-features');

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

  // Overview Manifest search filter
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('');

  // Synchronize internal subtab state when parent activeSection changes
  useEffect(() => {
    if (activeSection) {
      if (activeSection === 'traits') setSelectedSubTab('traits');
      else if (activeSection === 'hindrances') setSelectedSubTab('hindrances');
      else if (activeSection === 'augmentations') setSelectedSubTab('augmentations');
      else if (activeSection === 'metaphysics' || activeSection === 'awakened') setSelectedSubTab('metaphysics');
      else if (activeSection === 'overview') setSelectedSubTab('overview');
      else setSelectedSubTab('features');
    }
  }, [activeSection]);

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
      .map(feat => {
        const recs = getPillarFeatureRecommendations(feat, pillarFeatureSets, characterData);
        const discountInfo = getFeatureDiscountedCost(feat, pillarFeatureSets, characterData);
        const acquired = isFeatureAcquired(feat.name || feat.title || feat.id);
        return {
          ...feat,
          recommendingPillars: recs,
          discountInfo,
          isAcquired: acquired
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
  const handleRemoveFeature = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Feature') : String(item);
    if (!confirmTypedDeletion(itemName, 'feature')) return;

    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    const updated = currentList.filter((_, i) => i !== item.sourceIndex);
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

  // ═════════════════════════════════════════════════════════════════════════
  // 2. COLUMN-SPECIFIC TRAITS DATA (Cost: 1 CP Flat, Half-Features, No Discounts)
  // ═════════════════════════════════════════════════════════════════════════

  // Resolved Column Definitions (Primary + Secondary choices)
  const columnsData = useMemo(() => {
    // A. Species Column
    const specName = characterData['char-species'];
    const specObj = specName ? (resolveCatalogItem('species', specName) || DEFAULT_SPECIES.find(s => (s.name || s.id || '').toLowerCase() === String(specName).toLowerCase())) : null;
    const subSpecName = characterData['char-subspecies'] || characterData['char-species-sub'];

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

    return {
      species: { name: specName, obj: specObj, subName: subSpecName },
      origin: { name: origName, obj: origObj, secName: secOrigName, secObj: secOrigObj },
      occupation: { name: occuName, obj: occuObj, secName: secOccuName, secObj: secOccuObj },
      faction: { name: facName, obj: facObj, secName: secFacName, secObj: secFacObj }
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
    characterData['char-faction-secondary']
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
        let columnCategory = 'Species';
        if (src.includes('origin') || (characterData.originAllocations?.traits || []).some(t => normalizeLookupName(t) === cleanName)) {
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

        combined.push({
          ...(typeof item === 'object' ? item : { name: item }),
          columnCategory,
          cleanName,
          cp: isInherent ? 0 : (typeof item === 'object' && item.cp !== undefined ? item.cp : 1)
        });
      }
    });

    return combined;
  }, [
    characterData.traits,
    characterData.features,
    characterData.speciesAllocations,
    characterData.occuAllocations,
    characterData.originAllocations,
    characterData.factionAllocations
  ]);

  const isTraitAcquired = (traitNameOrId) => {
    if (!traitNameOrId) return false;
    const norm = normalizeLookupName(traitNameOrId);
    return characterTraits.some(t => t.cleanName === norm);
  };

  // Extract Column Available Traits (strictly from chosen columns + secondary choices)
  const columnAvailableTraits = useMemo(() => {
    const result = {
      species: [],
      origin: [],
      occupation: [],
      faction: []
    };

    // 1. Species Column Available Traits
    if (columnsData.species.obj) {
      const spec = columnsData.species.obj;
      const seen = new Set();

      // Inherent species features/traits
      (spec.inherent_features || []).forEach(f => {
        const canonical = findCanonicalTrait(f);
        if (canonical && !seen.has(normalizeLookupName(canonical.name))) {
          seen.add(normalizeLookupName(canonical.name));
          result.species.push({
            ...canonical,
            sourceColumn: 'Species',
            sourceDetail: spec.name,
            isInherent: true
          });
        }
      });

      // Bonus feature choices / traits
      (spec.bonus_feature_choices || []).forEach(f => {
        const canonical = findCanonicalTrait(f);
        if (canonical && !seen.has(normalizeLookupName(canonical.name))) {
          seen.add(normalizeLookupName(canonical.name));
          result.species.push({
            ...canonical,
            sourceColumn: 'Species',
            sourceDetail: `${spec.name} (Choice)`,
            isInherent: false
          });
        }
      });
    }

    // 2. Origin Column Available Traits (Primary + Secondary)
    const collectOriginTraits = (orig, label) => {
      if (!orig || !Array.isArray(orig.traits)) return;
      orig.traits.forEach(tId => {
        const canonical = findCanonicalTrait(tId);
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
        const canonical = findCanonicalTrait(tId);
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

    return result;
  }, [columnsData]);

  // Total CP of Character Traits (1 CP each for purchased, 0 for inherent)
  const totalTraitsCP = useMemo(() => {
    return characterTraits.reduce((acc, t) => {
      const cost = typeof t === 'object' && t.cp !== undefined ? parseInt(t.cp, 10) : 1;
      return acc + (isNaN(cost) ? 1 : cost);
    }, 0);
  }, [characterTraits]);

  // Remove Trait Item
  const handleRemoveTrait = (trait) => {
    const traitName = typeof trait === 'object' ? (trait.name || trait.title || 'Trait') : String(trait);
    if (!confirmTypedDeletion(traitName, 'trait')) return;

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

  const handleToggleAwakenedDiscipline = (disc) => {
    const isCurrentlyAwakened = isDisciplineAwakened(disc.name);
    const targetKey = disc.name.toLowerCase();

    if (isCurrentlyAwakened) {
      if (!confirmTypedDeletion(`Awakened: ${disc.name}`, 'awakened discipline feature')) return;
      
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
    const fromHindrances = (Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0)
      ? characterData.hindrances
      : getItemList('disadvantages');

    return fromHindrances.map((item, idx) => ({
      ...(typeof item === 'object' ? item : { name: item }),
      originalIndex: idx
    }));
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
      const refund = typeof dis === 'object' && dis.cp !== undefined ? parseInt(dis.cp, 10) : 3;
      return acc + (isNaN(refund) ? 3 : refund);
    }, 0);
  }, [hindrancesList]);

  const handleRemoveHindrance = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Hindrance') : String(item);
    if (!confirmTypedDeletion(itemName, 'hindrance')) return;

    const targetKey = Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0 ? 'hindrances' : 'disadvantages';
    const currentList = getItemList(targetKey);
    const updated = currentList.filter((_, i) => i !== item.originalIndex);
    updateField(targetKey, updated);
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

  return (
    <div className="tab-panel active p-4 space-y-6 w-full pb-24">
      
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MASTER TOP TELEMETRY & SUB-NAVIGATION BAR                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/90 border border-cyan-900/60 rounded-2xl p-4 shadow-xl backdrop-blur-xl space-y-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            {onBackToHub && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  onBackToHub();
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-950 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-sm"
                title="Return to Features Selection Hub"
              >
                <span>◀</span>
                <span>Hub</span>
              </button>
            )}

            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Features &amp; Traits Command</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Standard Features (3 CP base · Pillar discounted) &bull; Traits (1 CP flat · Column-bound)
              </p>
            </div>
          </div>

          {/* Aggregate Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 rounded-lg font-bold shadow-sm" title="Standard Character Features">
              Features: {totalStandardFeaturesCP} CP
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded-lg font-bold shadow-sm" title="Column Traits (1 CP each)">
              Traits: {totalTraitsCP} CP
            </span>
            {totalMetaphysicsCP > 0 && (
              <span className="px-2 py-1 bg-purple-950/80 border border-purple-700/60 text-purple-300 rounded-lg font-bold shadow-sm">
                Meta: {totalMetaphysicsCP} CP
              </span>
            )}
            {totalAugmentationsCP > 0 && (
              <span className="px-2 py-1 bg-amber-950/80 border border-amber-700/60 text-amber-300 rounded-lg font-bold shadow-sm">
                Augs: {totalAugmentationsCP} CP
              </span>
            )}
            {totalHindrancesRefund > 0 && (
              <span className="px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded-lg font-bold shadow-sm">
                Refund: -{totalHindrancesRefund} CP
              </span>
            )}
            <span className="px-3 py-1 bg-cyan-900/90 border border-cyan-400 text-white rounded-lg font-black shadow-[0_0_10px_rgba(34,211,238,0.25)]">
              Net: {netCapabilitiesCP} CP
            </span>
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSubTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSubTab === 'overview'
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Overview Manifest</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubTab('features')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSubTab === 'features'
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Standard Features</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-cyan-300 font-mono">
                {standardFeatures.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubTab('traits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSubTab === 'traits'
                  ? 'bg-emerald-950 border border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Traits (1 CP)</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-emerald-300 font-mono">
                {characterTraits.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubTab('metaphysics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSubTab === 'metaphysics'
                  ? 'bg-purple-950 border border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Metaphysics</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-purple-300 font-mono">
                {awakenedList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubTab('augmentations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSubTab === 'augmentations'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Augmentations</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-amber-300 font-mono">
                {augmentationsList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubTab('hindrances')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedSubTab === 'hindrances'
                  ? 'bg-rose-950 border border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Hindrances</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-rose-300 font-mono">
                {hindrancesList.length}
              </span>
            </button>
          </div>

          {onOpenAssetModal && (
            <button
              type="button"
              onClick={() => onOpenAssetModal('features', 'Custom Feature', 'create')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Create custom feature or trait"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 0: OVERVIEW MANIFEST (INTELLIGENT UNIFIED DASHBOARD)          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Identity Columns Status Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-bold uppercase">Active Column Foundations:</span>
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

          {/* Quick Search */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={overviewSearchQuery}
              onChange={(e) => setOverviewSearchQuery(e.target.value)}
              placeholder="Search all operative abilities..."
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

          {/* Manifest Grid: Column Traits + Standard Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Column Traits Manifest */}
            <div className="bg-slate-900/80 border border-emerald-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Column Heritage Traits ({characterTraits.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {totalTraitsCP} CP Total
                </span>
              </div>

              {characterTraits.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No column traits acquired yet. Browse the Traits tab to select traits from your Species, Origin, Occupation, and Faction columns.
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {characterTraits
                    .filter(t => !overviewSearchQuery || (t.name || '').toLowerCase().includes(overviewSearchQuery.toLowerCase()))
                    .map((trait, tIdx) => {
                      const name = trait.name || trait.title || 'Trait';
                      const tier = trait.trait_tier || 'Basic';
                      const costDisplay = trait.cp === 0 ? 'Inherent (0 CP)' : `${trait.cp || 1} CP`;
                      const col = trait.columnCategory || trait.columnSource || 'Heritage';
                      const colColor = col === 'Species' ? 'cyan' : col === 'Origin' ? 'emerald' : col === 'Occupation' ? 'sky' : 'purple';
                      return (
                        <div key={tIdx} className="bg-slate-950/80 border border-slate-800 hover:border-emerald-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <FolioTooltip
                              title={name}
                              badge={`${col} Trait`}
                              badgeColor={colColor}
                              description={trait.description || 'Acquired column heritage trait.'}
                              formula={trait.mechanic || undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              cost={costDisplay}
                              tags={[tier, col].filter(Boolean)}
                              showInfoIcon={true}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="font-bold text-slate-100 hover:text-emerald-300 transition-colors truncate">{name}</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  {col} &bull; {tier}
                                </span>
                              </div>
                            </FolioTooltip>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-bold">
                            {costDisplay}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Right: Standard Features Manifest */}
            <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Standard Features ({standardFeatures.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  {totalStandardFeaturesCP} CP Total
                </span>
              </div>

              {standardFeatures.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No standard features acquired yet. Explore the Features tab to view Pillar recommendations and the complete catalog.
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {standardFeatures
                    .filter(f => !overviewSearchQuery || (f.name || f.title || '').toLowerCase().includes(overviewSearchQuery.toLowerCase()))
                    .map((feat, fIdx) => {
                      const name = feat.name || feat.title || 'Feature';
                      const cat = feat.category || feat.type || 'General';
                      const cp = feat.cp !== undefined ? feat.cp : 3;
                      const featPillars = getPillarFeatureRecommendations(feat, pillarFeatureSets, characterData);
                      return (
                        <div key={fIdx} className="bg-slate-950/80 border border-slate-800 hover:border-cyan-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors">
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <FolioTooltip
                              title={name}
                              badge={cat}
                              badgeColor="cyan"
                              description={feat.description || 'Standard operative feature.'}
                              formula={feat.mechanic || undefined}
                              modifiers={Array.isArray(feat.modifiers) ? feat.modifiers : []}
                              prerequisites={feat.prerequisites || undefined}
                              cost={`${cp} CP`}
                              rules={feat.rules || feat.special_rules}
                              notes={feat.notes}
                              tags={[cat, feat.is_ranked ? `Rank ${feat.rank || 1}` : null].filter(Boolean)}
                              showInfoIcon={true}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="font-bold text-slate-100 hover:text-cyan-300 transition-colors truncate">{name}</span>
                                <PillarMarkerDots recommendations={featPillars} />
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase border ${getTypeBadgeStyle(cat)}`}>
                                  {cat}
                                </span>
                              </div>
                            </FolioTooltip>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                            {cp} CP
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: STANDARD FEATURES (3 CP BASE · PILLAR DISCOUNTS AVAILABLE) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedSubTab === 'features' && (
        <div className="space-y-5">
          {/* Sub-Header & 3-Mode Switcher */}
          <div className="bg-slate-900/80 border border-cyan-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Standard Character Features</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Feats costing 3 CP base. Feats recommended by your Identity Pillars receive a <strong>-1 CP discount</strong> (minimum 1 CP).
              </p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
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
          </div>

          {/* MODE A: MY FEATURES (ACQUIRED) */}
          {featuresViewMode === 'my-features' && (
            <div className="space-y-4">
              {standardFeatures.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    No standard features acquired yet on this operative.
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 w-full sm:w-auto">
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

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
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

                      {/* Search Input */}
                      <div className="relative flex-1 sm:w-56">
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
                                description={desc || 'Operative feature.'}
                                formula={featMechanic || undefined}
                                modifiers={featModifiers}
                                prerequisites={item.prerequisites || undefined}
                                prerequisiteMet={!isPrereqUnmet}
                                prerequisiteUnmetReasons={prereqResult.unmetReasons}
                                cost={`${cpCost * (item.rank || 1)} CP`}
                                rules={item.rules || item.special_rules}
                                notes={item.notes}
                                tags={[featCategory, item.is_ranked ? `Rank ${item.rank || 1}/${item.max_rank || 5}` : null].filter(Boolean)}
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

                            {/* Line 2: Notes / Category & Controls */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border shrink-0 ${getTypeBadgeStyle(featCategory)}`}>
                                  {featCategory}
                                </span>
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

                                {onOpenAssetModal && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenAssetModal('features', 'Feature', 'edit', item.sourceIndex, item)}
                                    className="text-slate-400 hover:text-cyan-300 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                    title="Edit feature"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 w-full sm:w-auto">
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

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
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

                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-56">
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
                          prerequisites={feat.prerequisites || undefined}
                          prerequisiteMet={!isPrereqUnmet}
                          prerequisiteUnmetReasons={prereqResult.unmetReasons}
                          cost={`${discountInfo.finalCost} CP (Base: ${discountInfo.baseCost || 3} CP, -${discountInfo.totalDiscount || 1} CP Discount)`}
                          rules={feat.rules || feat.special_rules}
                          notes={feat.notes}
                          tags={[featCategory, ...recs.map(p => `${p.name}: ${p.detail}`)]}
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

                      {/* Line 2: Category / Notes & Controls */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border shrink-0 ${getTypeBadgeStyle(featCategory)}`}>
                            {featCategory}
                          </span>
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
                            <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                              <Check className="w-3 h-3" />
                              <span>In Folio</span>
                            </span>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 w-full sm:w-auto">
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

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
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

                  <div className="relative flex-1 sm:w-56">
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
                          description={feat.description || 'Operative feature.'}
                          formula={feat.mechanic || undefined}
                          modifiers={Array.isArray(feat.modifiers) ? feat.modifiers : []}
                          prerequisites={feat.prerequisites || undefined}
                          prerequisiteMet={!isPrereqUnmet}
                          prerequisiteUnmetReasons={prereqResult.unmetReasons}
                          cost={discountInfo.isDiscounted ? `${discountInfo.finalCost} CP (Discounted from 3 CP)` : '3 CP'}
                          rules={feat.rules || feat.special_rules}
                          notes={feat.notes}
                          tags={[featCategory, ...recs.map(r => r.name)]}
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

                      {/* Line 2: Category / Notes & Controls */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border shrink-0 ${getTypeBadgeStyle(featCategory)}`}>
                            {featCategory}
                          </span>
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
                            <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                              <Check className="w-3 h-3" />
                              <span>In Folio</span>
                            </span>
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
          {/* Sub-Header */}
          <div className="bg-slate-900/80 border border-emerald-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Column Heritage Traits</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  (1 CP Flat &bull; Half-Features &bull; Column-Bound)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Traits are direct aspects of your character's build. They cost <strong>1 CP each</strong> (never discounted) and are chosen strictly from your active <strong>Species, Origin, Occupation, and Faction</strong> columns (including secondary choices).
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                Acquired: {characterTraits.length} ({totalTraitsCP} CP)
              </span>
            </div>
          </div>

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
                  const tCost = t.cp === 0 ? 'Inherent (0 CP)' : `${t.cp || 1} CP`;
                  const tCol = t.columnCategory || t.columnSource || 'Heritage';
                  const tColor = tCol === 'Species' ? 'cyan' : tCol === 'Origin' ? 'emerald' : tCol === 'Occupation' ? 'sky' : 'purple';
                  return (
                    <div
                      key={`acq_t_${tIdx}`}
                      className="p-2 rounded-lg border border-emerald-900/40 bg-slate-950/80 flex items-center justify-between gap-2 text-xs hover:border-emerald-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <FolioTooltip
                          title={tName}
                          badge={`${tCol} Trait`}
                          badgeColor={tColor}
                          description={t.description || 'Acquired column heritage trait.'}
                          formula={t.mechanic || undefined}
                          modifiers={Array.isArray(t.modifiers) ? t.modifiers : []}
                          cost={tCost}
                          tags={[t.trait_tier || 'Basic', tCol].filter(Boolean)}
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Column Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'species', label: `Species: ${columnsData.species.name || 'Not Chosen'}` },
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
                      const isPurchasable = Boolean(
                        trait.isPurchasable === true ||
                        trait.isPurchasable === 'Yes' ||
                        trait.purchasable === true ||
                        trait.purchasable === 'Yes' ||
                        trait.purchasableByCharacter === true ||
                        trait.purchasableByCharacter === 'Yes' ||
                        trait.is_purchasable === true ||
                        trait.is_purchasable === 'Yes'
                      );
                      const rawCp = parseInt(trait.cpCost || trait.cp || trait.bp || 1, 10);
                      const traitCp = [1, 2, 4].includes(rawCp) ? rawCp : 1;
                      const costDisplay = isPurchasable ? `${traitCp} CP` : (trait.isInherent ? 'Inherent (0 CP)' : 'Species Baseline');
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_${idx}`}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all ${
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
                              badge="Species Trait"
                              badgeColor="cyan"
                              description={trait.description || 'Species heritage trait.'}
                              formula={trait.mechanic || undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={trait.prerequisites || undefined}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost={costDisplay}
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Species Trait'].filter(Boolean)}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-cyan-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

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
                              {!acquired ? (
                                !isPurchasable ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800" title="Species traits are biological baselines and cannot be purchased unless flagged in species data.">
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
                                    onClick={() => handleAddItem('traits', {
                                      id: trait.id || `trait_${Date.now()}`,
                                      name: trait.name,
                                      category: 'traits',
                                      trait_type: 'Species Trait',
                                      trait_tier: trait.trait_tier || 'Basic',
                                      source: 'species',
                                      columnSource: 'Species',
                                      sourceDetail: trait.sourceDetail || 'Species Trait',
                                      cp: traitCp,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add ({traitCp} CP)</span>
                                  </button>
                                )
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                                  <Check className="w-3 h-3" />
                                  <span>In Folio</span>
                                </span>
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
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_${idx}`}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all ${
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
                              formula={trait.mechanic || undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={trait.prerequisites || undefined}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost="1 CP"
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Origin Trait'].filter(Boolean)}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-emerald-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

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
                                1 CP
                              </span>
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
                                      cp: 1,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add</span>
                                  </button>
                                )
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                                  <Check className="w-3 h-3" />
                                  <span>In Folio</span>
                                </span>
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
                      const prereqResult = checkPrerequisite(trait, characterData, 'features');
                      const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                      return (
                        <div
                          key={`${trait.id || trait.name}_${idx}`}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all ${
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
                              formula={trait.mechanic || undefined}
                              modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                              prerequisites={trait.prerequisites || undefined}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              cost="1 CP"
                              tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Occupation Trait'].filter(Boolean)}
                              showInfoIcon={true}
                            >
                              <h5 className="font-bold text-slate-100 text-xs group-hover:text-sky-300 transition-colors">
                                {trait.name}
                              </h5>
                            </FolioTooltip>
                          </div>

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
                                1 CP
                              </span>
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
                                      cp: 1,
                                      description: trait.description,
                                      mechanic: trait.mechanic,
                                      modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                    })}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-200 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add</span>
                                  </button>
                                )
                              ) : (
                                <span className="text-[10px] font-mono text-sky-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/60">
                                  <Check className="w-3 h-3" />
                                  <span>In Folio</span>
                                </span>
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
                        const prereqResult = checkPrerequisite(trait, characterData, 'features');
                        const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                        return (
                          <div
                            key={`${trait.id || trait.name}_${idx}`}
                            className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-all ${
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
                                formula={trait.mechanic || undefined}
                                modifiers={Array.isArray(trait.modifiers) ? trait.modifiers : []}
                                prerequisites={trait.prerequisites || undefined}
                                prerequisiteMet={!isPrereqUnmet}
                                prerequisiteUnmetReasons={prereqResult.unmetReasons}
                                cost="1 CP"
                                tags={[trait.trait_tier || 'Basic', trait.sourceDetail || 'Faction Trait'].filter(Boolean)}
                                showInfoIcon={true}
                              >
                                <h5 className="font-bold text-slate-100 text-xs group-hover:text-purple-300 transition-colors">
                                  {trait.name}
                                </h5>
                              </FolioTooltip>
                            </div>

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
                                  1 CP
                                </span>
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
                                        cp: 1,
                                        description: trait.description,
                                        mechanic: trait.mechanic,
                                        modifiers: Array.isArray(trait.modifiers) ? trait.modifiers : []
                                      })}
                                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-950 hover:bg-purple-900 border border-purple-600 text-purple-200 transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>+ Add</span>
                                    </button>
                                  )
                                ) : (
                                  <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60">
                                    <Check className="w-3 h-3" />
                                    <span>In Folio</span>
                                  </span>
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-bold rounded">
                {awakenedList.length} Awakened ({totalAwakenedCP} CP)
              </span>
              <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-bold rounded">
                {learnedInvocations.length} Invocations ({totalInvocationsCP} CP)
              </span>
              <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold rounded">
                {totalMetaphysicsCP} CP Total
              </span>
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

            <button
              type="button"
              onClick={() => {
                if (onOpenMetaphysicsModal) onOpenMetaphysicsModal();
              }}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-purple-500/50 text-purple-200 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={12} className="text-purple-400" />
              <span>Launch Full Codex</span>
            </button>
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
                const name = typeof item === 'object' ? (item.name || item.title) : item;
                const refundCp = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
                const desc = typeof item === 'object' ? (item.description || item.summary || '') : '';
                const hindMechanic = typeof item === 'object' ? (item.mechanic || item.mechanics || '') : '';
                const notes = typeof item === 'object' ? (item.notes || item.note) : '';

                return (
                  <div
                    key={item.originalIndex}
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
                          rules={typeof item === 'object' ? (item.rules || item.rule) : undefined}
                          notes={notes}
                          showInfoIcon={true}
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

                        {onOpenAssetModal && (
                          <button
                            type="button"
                            onClick={() => onOpenAssetModal('disadvantages', 'Hindrance', 'edit', item.originalIndex, item)}
                            className="text-slate-400 hover:text-cyan-300 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                            title="Edit hindrance"
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
