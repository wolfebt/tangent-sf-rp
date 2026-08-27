import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Sparkles, 
  Check, 
  Shield, 
  Crosshair, 
  Cpu, 
  Layers, 
  Dna, 
  Zap, 
  Award,
  ChevronRight,
  Briefcase,
  Globe,
  Building2
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useDBM } from '../../context/DBMContext';
import { DEFAULT_ARCHETYPES } from '../../data/archetypesData';
import { DEFAULT_SPECIES, SPECIES_LINEAGES } from '../../data/speciesData';
import { DEFAULT_FEATURES } from '../../data/featuresData';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';
import { DEFAULT_OCCUPATIONS } from '../../data/occupationsData';
import { DEFAULT_ORIGINS } from '../../data/originsData';
import { DEFAULT_FACTIONS } from '../../data/factionsData';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../../data/speciesDisadvantagesData';
import { ALL_CANONICAL_TRAITS } from '../../data/speciesTraitsData';
import { DEFAULT_WEAPONRY } from '../../data/weaponryData';
import { DEFAULT_ARMORING } from '../../data/armoringData';
import { DEFAULT_AUGMENTATIONS } from '../../data/augmentationsData';
import { DEFAULT_INVOCATIONS } from '../../data/invocationsData';
import { DEFAULT_SPECIES_SIZES } from '../../data/speciesSizeData';
import { DEFAULT_SPECIES_MOVEMENT } from '../../data/speciesMovementData';

// Canonical Core Disciplines for default/fallback catalog load
export const DEFAULT_DISCIPLINES = [
  { id: 'disc_dimension', name: 'Dimension', desc: 'Spatial distortion, teleportation, gravity fields, and portal manipulation.', category: 'Core Discipline', isCore: true, cp: 3, school: 'Metaphysics' },
  { id: 'disc_energy', name: 'Energy', desc: 'Thermal, electrical, kinetic, plasma, and radiant energy control.', category: 'Core Discipline', isCore: true, cp: 3, school: 'Metaphysics' },
  { id: 'disc_entropy', name: 'Entropy', desc: 'Probability manipulation, decay, probability fields, and chaos resonance.', category: 'Core Discipline', isCore: true, cp: 3, school: 'Metaphysics' },
  { id: 'disc_illusion', name: 'Illusion', desc: 'Sensory phantasms, holographic weaves, and mental trickery.', category: 'Core Discipline', isCore: true, cp: 3, school: 'Metaphysics' },
  { id: 'disc_matter', name: 'Matter', desc: 'Molecular alteration, density shifting, synthesis, and transmutation.', category: 'Core Discipline', isCore: true, cp: 3, school: 'Metaphysics' },
  { id: 'disc_mental', name: 'Mental', desc: 'Telepathy, psionic force, neural influence, and cognitive attunement.', category: 'Core Discipline', isCore: true, cp: 3, school: 'Metaphysics' }
];

export const FEATURE_CATEGORY_ITEMS = [
  { id: 'cat_any_feature', name: 'Any Feature', type: 'Category Group', description: 'Player may choose any feature from the full feature database.' },
  { id: 'cat_general_features', name: 'General Features', type: 'Category Group', description: 'Player may choose any feature classified under General features.' },
  { id: 'cat_combat_features', name: 'Combat Features', type: 'Category Group', description: 'Player may choose any feature classified under Combat features.' },
  { id: 'cat_ability_features', name: 'Ability Features', type: 'Category Group', description: 'Player may choose any feature classified under Ability features.' },
  { id: 'cat_meta_features', name: 'Meta Features', type: 'Category Group', description: 'Player may choose any feature classified under Meta features.' },
  { id: 'cat_karma_features', name: 'Karma Features', type: 'Category Group', description: 'Player may choose any feature classified under Karma features.' },
  { id: 'cat_skill_features', name: 'Skill Features', type: 'Category Group', description: 'Player may choose any feature classified under Skill features.' },
  { id: 'cat_exotic_features', name: 'Exotic Features', type: 'Category Group', description: 'Player may choose any feature classified under Exotic features.' },
  { id: 'cat_special_abilities', name: 'Special Abilities', type: 'Category Group', description: 'Player may choose any feature classified under Special Abilities.' }
];

export const SKILL_GROUP_ITEMS = [
  { id: 'grp_any_skill', name: 'Any Skill', type: 'Skill Group', description: 'Player may choose any skill from the full skill database.' },
  { id: 'grp_physical_skills', name: 'Physical Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Physical skill group.' },
  { id: 'grp_mental_skills', name: 'Mental Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Mental skill group.' },
  { id: 'grp_social_skills', name: 'Social Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Social skill group.' },
  { id: 'grp_combat_skills', name: 'Combat Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Combat skill group.' },
  { id: 'grp_meta_skills', name: 'Meta Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Meta skill group.' }
];

// Fallback seed definitions for offline or initial catalog load
const FALLBACK_CATALOG_DATA = {
  archetypes: DEFAULT_ARCHETYPES,
  species: DEFAULT_SPECIES,
  species_size: DEFAULT_SPECIES_SIZES,
  species_movement: DEFAULT_SPECIES_MOVEMENT,
  movement: DEFAULT_SPECIES_MOVEMENT,
  features: DEFAULT_FEATURES,
  traits: ALL_CANONICAL_TRAITS,
  trait: ALL_CANONICAL_TRAITS,
  skills: ALL_CANONICAL_SKILLS,
  disciplines: DEFAULT_DISCIPLINES,
  awakened: DEFAULT_DISCIPLINES,
  disadvantages: DEFAULT_SPECIES_DISADVANTAGES,
  augmentations: DEFAULT_AUGMENTATIONS,
  weaponry: DEFAULT_WEAPONRY,
  weapons: DEFAULT_WEAPONRY,
  armoring: DEFAULT_ARMORING,
  armor: DEFAULT_ARMORING,
  gear: DEFAULT_WEAPONRY,
  equipment: DEFAULT_WEAPONRY,
  occupations: DEFAULT_OCCUPATIONS,
  origins: DEFAULT_ORIGINS,
  factions: DEFAULT_FACTIONS,
  invocations: DEFAULT_INVOCATIONS,
  special_abilities: [],
  mecha: []
};

// Canonical category rank mappings for intelligent sorting
const SPHERE_ORDER = ['sentinels', 'operatives', 'visionaries', 'savants'];
const LINEAGE_ORDER = [
  'aeld',
  'asi',
  'aulurans',
  'humans',
  'engineered humans',
  'gen-e',
  'kitin',
  'synthetics',
  "sha'nor",
  'progenitors',
  'independent xenotypes',
  'independent'
];
const FEATURE_CAT_ORDER = ['combat', 'meta', 'ability', 'karma', 'skill', 'general', 'exotic'];
const WEAPON_TYPE_ORDER = ['melee', 'sidearm', 'small arms', 'rifle', 'longarm', 'heavy', 'energy', 'exotic', 'unarmed'];
const ARMOR_CLASS_ORDER = ['light', 'medium', 'heavy', 'powered', 'shield', 'exotic'];
const SKILL_GROUP_ORDER = ['physical', 'mental', 'social', 'combat', 'meta'];

const EMPTY_ARRAY = [];

const getRank = (val, orderList) => {
  if (!val) return 999;
  const str = String(val).toLowerCase().trim();
  // 1. Try exact match first
  const exactIdx = orderList.findIndex(o => str === o.toLowerCase());
  if (exactIdx >= 0) return exactIdx;
  // 2. Try substring match sorted by term length descending so longer phrases match first
  const sorted = [...orderList.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [idx, term] of sorted) {
    if (str.includes(term.toLowerCase())) return idx;
  }
  return 999;
};

/**
 * Intelligent helper to extract canonical category / lineage gem for any item
 */
export const getItemCategory = (item, canonicalColKey) => {
  if (!item) return 'Standard';

  if (canonicalColKey === 'species') {
    const parent = item.parent_species;
    if (parent) {
      const clean = Array.isArray(parent) ? parent[0] : String(parent).split('(')[0].trim();
      if (clean && clean.toLowerCase() !== 'species') {
        if (clean.toLowerCase() === 'independent') return 'Independent Xenotypes';
        if (clean.toLowerCase().replace(/[^a-z0-9]/g, '') === 'shanor') return "Sha'Nor";
        return clean;
      }
    }
    const lineage = item.lineage;
    if (lineage) {
      const clean = Array.isArray(lineage) ? lineage[0] : String(lineage).split('(')[0].trim();
      if (clean && clean.toLowerCase() !== 'species') {
        if (clean.toLowerCase() === 'independent') return 'Independent Xenotypes';
        if (clean.toLowerCase().replace(/[^a-z0-9]/g, '') === 'shanor') return "Sha'Nor";
        return clean;
      }
    }
    const name = String(item.name || item.title || '').toLowerCase();
    for (const l of (SPECIES_LINEAGES || [])) {
      if (name.includes(l.id) || name.includes(l.name.toLowerCase().split(' ')[0])) {
        const linName = l.name.split('(')[0].trim();
        if (linName.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith('shanor')) return "Sha'Nor";
        return linName;
      }
    }
    return 'Independent Xenotypes';
  }

  if (canonicalColKey === 'archetypes') {
    const sphere = item.sphere;
    if (sphere) return sphere.split('(')[0].trim();
    if (item.category && item.category.toLowerCase() !== 'archetypes' && item.category.toLowerCase() !== 'archetype') {
      return item.category.split('(')[0].trim();
    }
    return 'General';
  }

  if (canonicalColKey === 'skills') {
    const group = item.group || item.subtype || (item.category !== 'skills' ? item.category : null);
    if (group) return group.charAt(0).toUpperCase() + group.slice(1);
    return 'General';
  }

  if (canonicalColKey === 'weaponry') {
    return item.weapon_type || item.subtype || (item.category !== 'weaponry' ? item.category : null) || item.type || 'Weapon';
  }

  if (canonicalColKey === 'armoring') {
    return item.armor_class || item.subtype || (item.category !== 'armoring' ? item.category : null) || item.type || 'Armor';
  }

  if (canonicalColKey === 'disciplines') {
    if (item.isCore || (item.school && item.school.toLowerCase().includes('core'))) return 'Core Discipline';
    return item.school || item.discipline || (item.category !== 'disciplines' ? item.category : null) || 'Discipline';
  }

  if (canonicalColKey === 'features' || canonicalColKey === 'disadvantages') {
    const cat = item.category || item.type || item.group;
    if (cat && cat !== 'features' && cat !== 'disadvantages') return cat;
    return canonicalColKey === 'disadvantages' ? 'Disadvantage' : 'Feature';
  }

  if (canonicalColKey === 'occupations') {
    return item.field || item.category_type || item.type || 'Career';
  }

  if (canonicalColKey === 'origins') {
    return item.habitat || item.origin_type || item.type || 'Homeworld';
  }

  if (canonicalColKey === 'factions') {
    return item.faction_classification || item.faction_type || item.archetype || 'Faction';
  }

  if (item.category && item.category !== canonicalColKey) return item.category;
  if (item.type) return Array.isArray(item.type) ? item.type[0] : item.type;
  if (item.subtype) return item.subtype;
  return 'Standard';
};

/**
 * UniversalCatalogModal
 * Standardized, intelligent, dual-mode catalog modal for browsing and selecting
 * database entries with integrated build action.
 */
export const UniversalCatalogModal = ({
  isOpen,
  onClose,
  title = 'Catalog',
  collectionKey = 'equipment',
  items: propItems = null,
  selectedId = null,
  selectedName = null,
  selectedValues = EMPTY_ARRAY,
  isMulti = false,
  onSelectItem,
  onSelectMulti,
  onOpenManageModal,
  allowBuild = true,
  allowEdit = true,
  filterCategory = null,
  filterCategoryExclude = null,
  themeColor = null, // 'cyan' | 'amber' | 'emerald' | 'purple' | 'blue'
  includeCategoryGroups = false
}) => {
  // Global DBM context for pre-synced database records
  const dbm = useDBM();
  const [cloudItems, setCloudItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('recommended'); // 'recommended' | 'az' | 'za' | 'cost_desc' | 'cost_asc' | 'tl_desc'

  // Multi-selection state
  const [currentSelected, setCurrentSelected] = useState(() => {
    if (Array.isArray(selectedValues) && selectedValues.length > 0) return selectedValues;
    if (selectedId || selectedName) return [selectedId || selectedName];
    return [];
  });

  const selectedKey = useMemo(() => {
    if (Array.isArray(selectedValues)) return selectedValues.join(';;;');
    return String(selectedValues || selectedId || selectedName || '');
  }, [selectedValues, selectedId, selectedName]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentSelected([]);
      return;
    }
    if (Array.isArray(selectedValues) && selectedValues.length > 0) {
      setCurrentSelected(selectedValues);
    } else if (selectedId || selectedName) {
      setCurrentSelected([selectedId || selectedName]);
    } else {
      setCurrentSelected([]);
    }
  }, [isOpen, selectedKey]);

  // View mode persistence in localStorage ('cards' | 'table')
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('tangent_catalog_view_mode') || 'cards';
    } catch {
      return 'cards';
    }
  });

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('tangent_catalog_view_mode', mode);
    } catch (e) {
      console.warn('Could not persist catalog view mode', e);
    }
  };

  // Map collectionKey alias to primary canonical name
  const canonicalColKey = useMemo(() => {
    if (['weapons', 'attacks', 'weaponry'].includes(collectionKey)) return 'weaponry';
    if (['armor', 'armoring'].includes(collectionKey)) return 'armoring';
    if (['equipment', 'gear', 'items'].includes(collectionKey)) return 'gear';
    if (['char-archetype', 'archetypes'].includes(collectionKey)) return 'archetypes';
    if (['char-species', 'species'].includes(collectionKey)) return 'species';
    if (['char-occu', 'occupations'].includes(collectionKey)) return 'occupations';
    if (['char-origin', 'origins'].includes(collectionKey)) return 'origins';
    if (['char-faction', 'factions'].includes(collectionKey)) return 'factions';
    if (['disciplines', 'awakened'].includes(collectionKey)) return 'disciplines';
    return collectionKey || 'gear';
  }, [collectionKey]);

  // Real-time Firestore sync & item caching
  useEffect(() => {
    if (!isOpen) return;

    if (propItems && Array.isArray(propItems) && propItems.length > 0) {
      setCloudItems(propItems);
      return;
    }

    // Check if DBM Context already has pre-cached items for this collection
    const contextItems = dbm?.dbData?.[canonicalColKey];
    if (contextItems && Array.isArray(contextItems) && contextItems.length > 0) {
      setCloudItems(contextItems);
      return;
    }

    // Otherwise initiate real-time Firestore subscription
    let isMounted = true;
    setLoading(true);

    let unsub = () => {};
    try {
      const colRef = collection(db, canonicalColKey);
      unsub = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          if (isMounted) setCloudItems(list);
        } else {
          // Fallback to local default data if cloud collection is empty
          const fallback = FALLBACK_CATALOG_DATA[canonicalColKey] || [];
          if (isMounted) setCloudItems(fallback);
        }
        if (isMounted) setLoading(false);
      }, (err) => {
        console.warn(`Firestore subscription notice for "${canonicalColKey}":`, err.message);
        const fallback = FALLBACK_CATALOG_DATA[canonicalColKey] || [];
        if (isMounted) {
          setCloudItems(fallback);
          setLoading(false);
        }
      });
    } catch (err) {
      console.warn(`Catalog connection note for "${canonicalColKey}":`, err);
      const fallback = FALLBACK_CATALOG_DATA[canonicalColKey] || [];
      if (isMounted) {
        setCloudItems(fallback);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      unsub();
    };
  }, [isOpen, canonicalColKey, propItems, dbm?.dbData?.[canonicalColKey]]);

  // Aggregate and normalize items
  const allRawItems = useMemo(() => {
    let baseList = [];
    if (propItems && Array.isArray(propItems) && propItems.length > 0) {
      baseList = propItems;
    } else if (cloudItems && cloudItems.length > 0) {
      baseList = cloudItems;
    } else {
      const contextItems = dbm?.dbData?.[canonicalColKey];
      if (contextItems && contextItems.length > 0) {
        baseList = contextItems;
      } else {
        baseList = FALLBACK_CATALOG_DATA[canonicalColKey] || [];
      }
    }

    if (includeCategoryGroups) {
      if (canonicalColKey === 'features') {
        const names = new Set(baseList.map(i => (i.name || i.title || '').toLowerCase()));
        const extra = FEATURE_CATEGORY_ITEMS.filter(f => !names.has(f.name.toLowerCase()));
        return [...extra, ...baseList];
      }
      if (canonicalColKey === 'skills') {
        const names = new Set(baseList.map(i => (i.name || i.title || '').toLowerCase()));
        const extra = SKILL_GROUP_ITEMS.filter(s => !names.has(s.name.toLowerCase()));
        return [...extra, ...baseList];
      }
    }
    return baseList;
  }, [propItems, cloudItems, dbm?.dbData?.[canonicalColKey], canonicalColKey, includeCategoryGroups]);

  // Compute distinct category pills (gems) from available items
  const categoryPills = useMemo(() => {
    const categoriesSet = new Set();

    allRawItems.forEach(item => {
      const cat = getItemCategory(item, canonicalColKey);
      if (cat && cat !== 'Standard') {
        categoriesSet.add(cat);
      }
    });

    const list = Array.from(categoriesSet).filter(Boolean).sort((a, b) => {
      if (canonicalColKey === 'species') {
        const rA = getRank(a, LINEAGE_ORDER);
        const rB = getRank(b, LINEAGE_ORDER);
        if (rA !== rB) return rA - rB;
      } else if (canonicalColKey === 'archetypes') {
        const rA = getRank(a, SPHERE_ORDER);
        const rB = getRank(b, SPHERE_ORDER);
        if (rA !== rB) return rA - rB;
      }
      return a.localeCompare(b);
    });

    return ['ALL', ...list];
  }, [allRawItems, canonicalColKey]);

  // Compute item counts per category pill/gem
  const categoryCounts = useMemo(() => {
    const counts = { ALL: allRawItems.length };
    allRawItems.forEach(item => {
      const cat = getItemCategory(item, canonicalColKey);
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [allRawItems, canonicalColKey]);

  // Filtered & Sorted items computation
  const processedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Filtering
    let list = allRawItems.filter(item => {
      const name = String(item.name || item.title || item.id || '');
      const desc = String(item.description || item.summary || item.flavor || '');
      const itemCat = getItemCategory(item, canonicalColKey);
      const rawCat = String(item.category || item.sphere || item.parent_species || item.group || item.type || '');
      const tags = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');

      // Search match
      if (query) {
        const matchesQuery = name.toLowerCase().includes(query) ||
          desc.toLowerCase().includes(query) ||
          itemCat.toLowerCase().includes(query) ||
          rawCat.toLowerCase().includes(query) ||
          tags.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // External explicit category filter
      if (filterCategory) {
        const filterTarget = String(filterCategory).toLowerCase();
        if (itemCat.toLowerCase() !== filterTarget && rawCat.toLowerCase() !== filterTarget) {
          return false;
        }
      }
      if (filterCategoryExclude) {
        const filterExclude = String(filterCategoryExclude).toLowerCase();
        if (itemCat.toLowerCase() === filterExclude || rawCat.toLowerCase() === filterExclude) {
          return false;
        }
      }

      // Active interactive category pill (selected gem)
      if (activeCategoryFilter !== 'ALL') {
        const filterStr = activeCategoryFilter.toLowerCase();
        const itemCatStr = itemCat.toLowerCase();
        const parentStr = String(item.parent_species || item.sphere || item.lineage || '').toLowerCase();

        const cleanFilter = filterStr.replace(/[^a-z0-9]/g, '');
        const cleanItemCat = itemCatStr.replace(/[^a-z0-9]/g, '');
        const cleanParent = parentStr.replace(/[^a-z0-9]/g, '');

        const matchesPill = itemCatStr === filterStr ||
          itemCatStr.includes(filterStr) ||
          filterStr.includes(itemCatStr) ||
          parentStr.includes(filterStr) ||
          (cleanFilter && (cleanItemCat === cleanFilter || cleanParent.includes(cleanFilter)));

        if (!matchesPill) {
          return false;
        }
      }

      return true;
    });

    // 2. Intelligent Domain-Specific Default Sorting
    list = [...list].sort((a, b) => {
      const nameA = String(a.name || a.title || a.id || '');
      const nameB = String(b.name || b.title || b.id || '');

      if (sortOption === 'az') {
        return nameA.localeCompare(nameB);
      }
      if (sortOption === 'za') {
        return nameB.localeCompare(nameA);
      }
      if (sortOption === 'cost_desc') {
        const costA = parseFloat(a.cost || a.cp || a.bp_chassis || 0);
        const costB = parseFloat(b.cost || b.cp || b.bp_chassis || 0);
        return costB - costA;
      }
      if (sortOption === 'cost_asc') {
        const costA = parseFloat(a.cost || a.cp || a.bp_chassis || 0);
        const costB = parseFloat(b.cost || b.cp || b.bp_chassis || 0);
        return costA - costB;
      }
      if (sortOption === 'tl_desc') {
        const tlA = parseFloat(a.tech_level || a.tier || 0);
        const tlB = parseFloat(b.tech_level || b.tier || 0);
        return tlB - tlA;
      }

      // 'recommended' sorting based on domain archetype
      if (canonicalColKey === 'archetypes') {
        const catA = getItemCategory(a, canonicalColKey);
        const catB = getItemCategory(b, canonicalColKey);
        const rankA = getRank(catA, SPHERE_ORDER);
        const rankB = getRank(catB, SPHERE_ORDER);
        if (rankA !== rankB) return rankA - rankB;
        return nameA.localeCompare(nameB);
      }

      if (canonicalColKey === 'species') {
        const catA = getItemCategory(a, canonicalColKey);
        const catB = getItemCategory(b, canonicalColKey);
        const rankA = getRank(catA, LINEAGE_ORDER);
        const rankB = getRank(catB, LINEAGE_ORDER);
        if (rankA !== rankB) return rankA - rankB;
        return nameA.localeCompare(nameB);
      }

      if (canonicalColKey === 'disciplines') {
        const isCoreA = Boolean(a.isCore || (a.category && a.category.toLowerCase().includes('core')));
        const isCoreB = Boolean(b.isCore || (b.category && b.category.toLowerCase().includes('core')));
        if (isCoreA && !isCoreB) return -1;
        if (!isCoreA && isCoreB) return 1;
        return nameA.localeCompare(nameB);
      }

      if (canonicalColKey === 'features' || canonicalColKey === 'disadvantages') {
        const rankA = getRank(a.category || a.type, FEATURE_CAT_ORDER);
        const rankB = getRank(b.category || b.type, FEATURE_CAT_ORDER);
        if (rankA !== rankB) return rankA - rankB;
        const cpA = parseFloat(a.cp || 0);
        const cpB = parseFloat(b.cp || 0);
        if (cpA !== cpB) return cpA - cpB;
        return nameA.localeCompare(nameB);
      }

      if (canonicalColKey === 'weaponry') {
        const rankA = getRank(a.weapon_type || a.type || a.category, WEAPON_TYPE_ORDER);
        const rankB = getRank(b.weapon_type || b.type || b.category, WEAPON_TYPE_ORDER);
        if (rankA !== rankB) return rankA - rankB;
        const tlA = parseFloat(a.tech_level || 0);
        const tlB = parseFloat(b.tech_level || 0);
        if (tlA !== tlB) return tlA - tlB;
        return nameA.localeCompare(nameB);
      }

      if (canonicalColKey === 'armoring') {
        const rankA = getRank(a.armor_class || a.type || a.category, ARMOR_CLASS_ORDER);
        const rankB = getRank(b.armor_class || b.type || b.category, ARMOR_CLASS_ORDER);
        if (rankA !== rankB) return rankA - rankB;
        return nameA.localeCompare(nameB);
      }

      if (canonicalColKey === 'skills') {
        const rankA = getRank(a.group || a.category, SKILL_GROUP_ORDER);
        const rankB = getRank(b.group || b.category, SKILL_GROUP_ORDER);
        if (rankA !== rankB) return rankA - rankB;
        return nameA.localeCompare(nameB);
      }

      return nameA.localeCompare(nameB);
    });

    return list;
  }, [allRawItems, searchQuery, activeCategoryFilter, sortOption, filterCategory, filterCategoryExclude, canonicalColKey]);

  // Determine if an item is selected
  const isItemSelected = useCallback((item) => {
    const val = item.name || item.title || item.id;
    if (isMulti) {
      return currentSelected.includes(val) || currentSelected.includes(item.id);
    }
    return (selectedId && (item.id === selectedId)) ||
      (selectedName && (item.name === selectedName || item.title === selectedName)) ||
      currentSelected.includes(val) || currentSelected.includes(item.id);
  }, [isMulti, currentSelected, selectedId, selectedName]);

  // Handle single or multi item toggling
  const handleItemClick = useCallback((item) => {
    const val = item.name || item.title || item.id;
    if (isMulti) {
      setCurrentSelected(prev => {
        const hasIt = prev.includes(val) || prev.includes(item.id);
        if (hasIt) {
          return prev.filter(v => v !== val && v !== item.id);
        } else {
          return [...prev, val];
        }
      });
    } else {
      if (onSelectItem) {
        onSelectItem(item);
      }
      onClose();
    }
  }, [isMulti, onSelectItem, onClose]);

  // Handle confirming multi-selection
  const handleConfirmMulti = useCallback(() => {
    if (onSelectMulti) {
      onSelectMulti(currentSelected);
    } else if (onSelectItem) {
      onSelectItem(currentSelected);
    }
    onClose();
  }, [onSelectMulti, onSelectItem, currentSelected, onClose]);

  // Handle opening dedicated entry build manage modal
  const handleBuildNew = useCallback(() => {
    onClose();
    if (onOpenManageModal) {
      onOpenManageModal(canonicalColKey, {
        name: searchQuery.trim() || '',
        category: activeCategoryFilter !== 'ALL' ? activeCategoryFilter.toLowerCase() : canonicalColKey
      }, 'create');
    }
  }, [onClose, onOpenManageModal, canonicalColKey, searchQuery, activeCategoryFilter]);

  // Handle opening dedicated entry edit manage modal
  const handleEditItem = useCallback((item) => {
    onClose();
    if (onOpenManageModal) {
      onOpenManageModal(canonicalColKey, item, 'edit');
    }
  }, [onClose, onOpenManageModal, canonicalColKey]);

  if (!isOpen) return null;

  // Theme styling helpers
  const effectiveTheme = themeColor || (
    ['disciplines', 'awakened', 'factions'].includes(canonicalColKey) ? 'purple' :
    ['weaponry', 'attacks', 'weapons', 'archetypes'].includes(canonicalColKey) ? 'amber' :
    ['armoring', 'armor', 'origins'].includes(canonicalColKey) ? 'emerald' :
    ['occupations'].includes(canonicalColKey) ? 'blue' :
    ['species'].includes(canonicalColKey) ? 'cyan' : 'cyan'
  );

  const themeBorder = effectiveTheme === 'amber' ? 'border-amber-500/50' :
    effectiveTheme === 'emerald' ? 'border-emerald-500/50' :
    effectiveTheme === 'purple' ? 'border-purple-500/50' :
    effectiveTheme === 'blue' ? 'border-blue-500/50' : 'border-cyan-500/50';

  const themeText = effectiveTheme === 'amber' ? 'text-amber-400' :
    effectiveTheme === 'emerald' ? 'text-emerald-400' :
    effectiveTheme === 'purple' ? 'text-purple-400' :
    effectiveTheme === 'blue' ? 'text-blue-400' : 'text-cyan-400';

  const themeGlow = effectiveTheme === 'amber' ? 'shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
    effectiveTheme === 'emerald' ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
    effectiveTheme === 'purple' ? 'shadow-[0_0_30px_rgba(168,85,247,0.2)]' :
    effectiveTheme === 'blue' ? 'shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'shadow-[0_0_30px_rgba(34,211,238,0.2)]';

  // Render specifications / key metrics chip
  const renderItemStats = (item) => {
    if (canonicalColKey === 'weaponry') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.damage && <span className="px-1.5 py-0.5 rounded bg-red-950/70 border border-red-800/60 text-red-300 font-bold">DMG: {item.damage}</span>}
          {item.range && <span className="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-blue-300">RNG: {item.range}</span>}
          {item.ap !== undefined && <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300">AP: {item.ap}</span>}
          {item.ammo && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">AMMO: {item.ammo}</span>}
        </div>
      );
    }
    if (canonicalColKey === 'armoring') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.defense !== undefined && <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-bold">DEF: +{item.defense}</span>}
          {item.dr !== undefined && <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-bold">DR: {item.dr}</span>}
          {item.coverage && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">COV: {item.coverage}</span>}
        </div>
      );
    }
    if (canonicalColKey === 'archetypes') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.primary_attribute && <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">Pri: {item.primary_attribute}</span>}
          {item.secondary_attribute && <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300">Sec: {item.secondary_attribute}</span>}
          {item.bp_chassis && <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300">{item.bp_chassis} BP</span>}
        </div>
      );
    }
    if (canonicalColKey === 'species') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.parent_species && <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">{item.parent_species}</span>}
          {item.tech_level !== undefined && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">TL {item.tech_level}</span>}
          {item.cp !== undefined && <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300">{item.cp} CP</span>}
        </div>
      );
    }
    if (canonicalColKey === 'occupations') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.skill_points !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300 font-bold">
              {item.skill_points} SP Pool
            </span>
          )}
          {item.field && (
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              {item.field}
            </span>
          )}
          {Array.isArray(item.professional_skills) && item.professional_skills.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
              Skills: {item.professional_skills.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      );
    }
    if (canonicalColKey === 'origins') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.skill_points !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold">
              {item.skill_points} SP Society
            </span>
          )}
          {item.habitat && (
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              {item.habitat}
            </span>
          )}
          {Array.isArray(item.society_skills) && item.society_skills.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
              Skills: {item.society_skills.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      );
    }
    if (canonicalColKey === 'factions') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.tech_level !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-purple-300 font-bold">
              TL {String(item.tech_level).split(' ')[0]}
            </span>
          )}
          {item.meta_level !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300">
              ML {String(item.meta_level).split(' ')[0]}
            </span>
          )}
          {item.capital_world && (
            <span className="px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-200">
              Cap: {item.capital_world}
            </span>
          )}
        </div>
      );
    }
    if (canonicalColKey === 'skills') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.baseAttr && <span className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300 uppercase">{item.baseAttr.replace('attr-', '')}</span>}
          {item.group && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 capitalize">{item.group}</span>}
        </div>
      );
    }
    if (canonicalColKey === 'disciplines') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 font-bold">3 CP</span>
          {item.school && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">{item.school}</span>}
          {item.focus && <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">Focus: {item.focus}</span>}
        </div>
      );
    }
    if (canonicalColKey === 'features' || canonicalColKey === 'disadvantages') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.cp !== undefined && <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300">{item.cp} CP</span>}
          {item.type && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 uppercase">{item.type}</span>}
        </div>
      );
    }
    if (canonicalColKey === 'mecha') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          {item.class && <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-bold">Class: {item.class}</span>}
          {item.armor !== undefined && <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">Armor: {item.armor}</span>}
          {item.tech_level !== undefined && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">TL {item.tech_level}</span>}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
        {item.category && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">{item.category}</span>}
        {item.cost && <span className="text-amber-300">{item.cost} ¢</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-4 sm:pt-8 overflow-y-auto">
      <div className={`bg-[#0d131f] border ${themeBorder} rounded-2xl w-full max-w-5xl ${themeGlow} text-slate-100 flex flex-col max-h-[90vh] overflow-hidden my-auto shadow-2xl transition-all`}>
        
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-slate-950 border ${themeBorder} flex items-center justify-center ${themeText} shadow-md`}>
              {canonicalColKey === 'weaponry' ? <Crosshair className="w-4 h-4" /> :
               canonicalColKey === 'armoring' ? <Shield className="w-4 h-4" /> :
               canonicalColKey === 'species' ? <Dna className="w-4 h-4" /> :
               canonicalColKey === 'skills' ? <Award className="w-4 h-4" /> :
               canonicalColKey === 'archetypes' ? <Shield className="w-4 h-4" /> :
               canonicalColKey === 'occupations' ? <Briefcase className="w-4 h-4" /> :
               canonicalColKey === 'origins' ? <Globe className="w-4 h-4" /> :
               canonicalColKey === 'factions' ? <Building2 className="w-4 h-4" /> :
               canonicalColKey === 'augmentations' ? <Cpu className="w-4 h-4" /> :
               canonicalColKey === 'disciplines' ? <Sparkles className="w-4 h-4" /> :
               <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold uppercase tracking-wider ${themeText}`}>
                  {title} Catalog
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
                  {processedItems.length} {processedItems.length === 1 ? 'entry' : 'entries'}
                </span>
                {isMulti && currentSelected.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-600/60 text-[10px] font-mono text-cyan-300 font-bold animate-pulse">
                    {currentSelected.length} selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Browse verified options or build a new record directly into the database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Prominent Header "+ Build New Option" Button */}
            {allowBuild && onOpenManageModal && (
              <button
                type="button"
                onClick={handleBuildNew}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
                title={`Build and persist a new ${title} record`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Build New {title}</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SEARCH, SORT & VIEW MODE CONTROLS */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()} by name, tags, description...`}
                className="w-full bg-slate-950 border border-slate-700/90 focus:border-cyan-400 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/90 rounded-lg px-2.5 py-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-2 font-medium"
              >
                <option value="recommended" className="bg-slate-950 text-slate-200">Recommended Sort</option>
                <option value="az" className="bg-slate-950 text-slate-200">Name (A → Z)</option>
                <option value="za" className="bg-slate-950 text-slate-200">Name (Z → A)</option>
                <option value="cost_desc" className="bg-slate-950 text-slate-200">Cost / CP (High → Low)</option>
                <option value="cost_asc" className="bg-slate-950 text-slate-200">Cost / CP (Low → High)</option>
                <option value="tl_desc" className="bg-slate-950 text-slate-200">Tech Level (High → Low)</option>
              </select>
            </div>

            {/* View Mode Toggle: Clean Table vs Sharp High-Tech Cards */}
            <div className="flex items-center bg-slate-950 border border-slate-700/90 rounded-lg p-1 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Clean Table Listing View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sharp High-Tech Selection Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {categoryPills.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
              {categoryPills.map(cat => {
                const isActive = activeCategoryFilter === cat;
                const count = categoryCounts[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{cat}</span>
                    {count !== undefined && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-cyan-400/20 text-cyan-200 font-bold' : 'bg-slate-900 text-slate-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CATALOG BODY: TABLE OR HIGH-TECH CARDS */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-cyan-400 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono tracking-wider animate-pulse">SYNCHRONIZING CATALOG DATA...</span>
            </div>
          ) : processedItems.length === 0 ? (
            /* EMPTY / NO MATCH STATE WITH INLINE BUILD ACTION */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">
                  No matching {title.toLowerCase()} found
                </h4>
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? `No entries match "${searchQuery}". Expand the catalog by creating a new entry.`
                    : `No options available in category "${activeCategoryFilter}".`}
                </p>
              </div>

              {allowBuild && onOpenManageModal && (
                <button
                  type="button"
                  onClick={handleBuildNew}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build New {title} Entry</span>
                </button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* ========================================================================= */
            /* VIEW MODE: CLEAN TABLE LISTING                                            */
            /* ========================================================================= */
            <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg bg-slate-950/70">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    {isMulti && <th className="py-3 px-3 w-10 text-center">Sel</th>}
                    <th className="py-3 px-4">Designation / Name</th>
                    <th className="py-3 px-4">Category / Type</th>
                    <th className="py-3 px-4">Specifications & Stats</th>
                    <th className="py-3 px-4 hidden md:table-cell">Summary / Mechanics</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {processedItems.map((item, idx) => {
                    const isSelected = isItemSelected(item);

                    return (
                      <tr
                        key={item.id || idx}
                        onClick={() => handleItemClick(item)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-cyan-950/60 border-l-4 border-l-cyan-400'
                            : 'hover:bg-cyan-950/30'
                        }`}
                      >
                        {isMulti && (
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleItemClick(item)}
                              className="accent-cyan-500 w-4 h-4 cursor-pointer rounded"
                            />
                          </td>
                        )}

                        {/* Name & Gem */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]' : 'bg-slate-600'} shrink-0`} />
                            <div>
                              <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                                {item.name || item.title || item.id}
                              </div>
                              {canonicalColKey === 'species' && item.parent_species && (
                                <div className="text-[10px] text-cyan-400/80 font-mono">
                                  Lineage: {item.parent_species}
                                </div>
                              )}
                              {item.sphere && (
                                <div className="text-[10px] text-purple-400 font-mono">
                                  {item.sphere}
                                </div>
                              )}
                              {item.school && (
                                <div className="text-[10px] text-cyan-400/80 font-mono">
                                  {item.school}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category / Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] font-mono text-cyan-300">
                            {getItemCategory(item, canonicalColKey)}
                          </span>
                        </td>

                        {/* Stats */}
                        <td className="py-3 px-4">
                          {renderItemStats(item)}
                        </td>

                        {/* Summary Description */}
                        <td className="py-3 px-4 hidden md:table-cell max-w-xs">
                          <p className="text-slate-400 text-[11px] line-clamp-1 leading-snug">
                            {item.description || item.summary || item.flavor || item.mechanic || item.desc || '—'}
                          </p>
                        </td>

                        {/* Select & Edit Action Buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {allowEdit && onOpenManageModal && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(item);
                                }}
                                className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/70 text-slate-400 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                title={`Manage & edit ${item.name || item.title || 'record'} in database`}
                              >
                                <span>✏️</span>
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item);
                              }}
                              className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                  : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW MODE: SHARP HIGH-TECH SELECTION CARDS                                */
            /* ========================================================================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {processedItems.map((item, idx) => {
                const isSelected = isItemSelected(item);

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => handleItemClick(item)}
                    className={`relative rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                        : 'bg-slate-900/40 hover:bg-slate-900/90 border-slate-800 hover:border-cyan-500/70 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]'
                    }`}
                  >
                    {/* Top Cyber Accents */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {isMulti && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-cyan-500 w-3.5 h-3.5 cursor-pointer rounded"
                          />
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-[10px] font-mono text-cyan-300 uppercase tracking-wide">
                          {getItemCategory(item, canonicalColKey)}
                        </span>
                      </div>

                      {item.tech_level !== undefined ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-400">
                          TL {item.tech_level}
                        </span>
                      ) : item.cp !== undefined ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300">
                          {item.cp} CP
                        </span>
                      ) : item.bp_chassis ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300">
                          {item.bp_chassis} BP
                        </span>
                      ) : null}
                    </div>

                    {/* Card Title */}
                    <div className="mb-2">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {item.name || item.title || item.id}
                      </h4>
                      {item.sphere && (
                        <p className="text-[10px] text-purple-400 font-mono line-clamp-1 mt-0.5">
                          {item.sphere}
                        </p>
                      )}
                      {item.school && (
                        <p className="text-[10px] text-cyan-400/80 font-mono line-clamp-1 mt-0.5">
                          {item.school}
                        </p>
                      )}
                    </div>

                    {/* Specifications Chips */}
                    <div className="mb-3">
                      {renderItemStats(item)}
                    </div>

                    {/* Description Snippet */}
                    <div className="flex-1 mb-3">
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || item.summary || item.flavor || item.mechanic || item.desc || 'No additional technical briefing available.'}
                      </p>
                    </div>

                    {/* Card Footer: Edit & Select Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.id ? `#${String(item.id).slice(-6)}` : ''}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {allowEdit && onOpenManageModal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            className="px-2.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/70 text-slate-400 hover:text-amber-300 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                            title={`Manage & edit ${item.name || item.title || 'record'} in database`}
                          >
                            <span>✏️</span>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                              : 'bg-cyan-950/90 group-hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <span>Select</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
            <span>Catalog: <span className="text-cyan-400 font-bold">{canonicalColKey}</span> ({processedItems.length} active)</span>
            {isMulti && (
              <span className="text-cyan-300 font-bold">
                • {currentSelected.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {allowBuild && onOpenManageModal && (
              <button
                type="button"
                onClick={handleBuildNew}
                className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Build New</span>
              </button>
            )}

            {isMulti && (
              <button
                type="button"
                onClick={handleConfirmMulti}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.3)] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Selection ({currentSelected.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(UniversalCatalogModal);
