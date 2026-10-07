import React, { useState, useMemo, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { Dices, Zap, Plus, Lock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { DEFAULT_SKILLS } from '../../../data/skillsData';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_OCCUPATIONS } from '../../../data/occupationsData';
import { DEFAULT_ORIGINS } from '../../../data/originsData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { resolveMetaSkillForInvocation, isSpecialAbility } from '../../../utils/metaphysicsUtils';
import FolioTooltip from '../shared/FolioTooltip';
import { checkPrerequisite } from '../../../utils/prerequisiteEvaluator';
import { expandSkillGroupPatterns } from '../shared/IdentityPoolPulldown';
import SituationalModifiersPanel from './SituationalModifiersPanel';

const ATTRIBUTE_OPTIONS = [
  { value: 'attr-strength', label: 'STR' },
  { value: 'attr-agility', label: 'AGI' },
  { value: 'attr-stamina', label: 'STA' },
  { value: 'attr-intellect', label: 'INT' },
  { value: 'attr-wisdom', label: 'WIS' },
  { value: 'attr-charisma', label: 'CHA' }
];

const LEFT_COLUMN_CONFIG = [
  {
    key: 'physical',
    title: 'Physical Skills',
    icon: '🏃',
    color: 'text-emerald-400',
    border: 'border-emerald-900/50',
    accentBorder: 'border-emerald-500/60'
  },
  {
    key: 'mental',
    title: 'Mental Skills',
    icon: '🧠',
    color: 'text-blue-400',
    border: 'border-blue-900/50',
    accentBorder: 'border-blue-500/60'
  }
];

const RIGHT_COLUMN_CONFIG = [
  {
    key: 'social',
    title: 'Social Skills',
    icon: '🗣️',
    color: 'text-cyan-400',
    border: 'border-cyan-900/50',
    accentBorder: 'border-cyan-500/60'
  },
  {
    key: 'combat',
    title: 'Combat Skills',
    icon: '⚔️',
    color: 'text-amber-400',
    border: 'border-amber-900/50',
    accentBorder: 'border-amber-500/60'
  },
  {
    key: 'meta',
    title: 'Metafocus Skills',
    icon: '🔮',
    color: 'text-purple-400',
    border: 'border-purple-900/50',
    accentBorder: 'border-purple-500/60'
  }
];

const CATEGORY_CONFIG_MAP = {
  physical: LEFT_COLUMN_CONFIG[0],
  mental: LEFT_COLUMN_CONFIG[1],
  social: RIGHT_COLUMN_CONFIG[0],
  combat: RIGHT_COLUMN_CONFIG[1],
  meta: RIGHT_COLUMN_CONFIG[2]
};

const TABS_CONFIG = [
  {
    key: 'physical',
    title: 'Physical',
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-950/40',
    activeBorder: 'border-emerald-500'
  },
  {
    key: 'mental',
    title: 'Mental',
    color: 'text-blue-400',
    activeBg: 'bg-blue-950/40',
    activeBorder: 'border-blue-500'
  },
  {
    key: 'social',
    title: 'Social',
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-950/40',
    activeBorder: 'border-cyan-500'
  },
  {
    key: 'combat',
    title: 'Combat',
    color: 'text-amber-400',
    activeBg: 'bg-amber-950/40',
    activeBorder: 'border-amber-500'
  },
  {
    key: 'meta',
    title: 'Metafocus',
    color: 'text-purple-400',
    activeBg: 'bg-purple-950/40',
    activeBorder: 'border-purple-500'
  },
  {
    key: 'all',
    title: 'All Skills',
    color: 'text-white',
    activeBg: 'bg-slate-900/50',
    activeBorder: 'border-white'
  }
];

const SkillsTab = ({ onOpenAddSkillModal, onOpenSelectorModal }) => {
  const {
    characterData,
    updateField,
    handleDeleteSkill,
    handleUpdateSpecialization,
    handleDeleteSpecialization,
    isInActiveGame,
    isGMConfirmed,
    isLocked: isFolioLocked,
    isPlayerOverride,
    getSkillBreakdown,
    computedModifiers,
    getAttrTotal
  } = useFolio();
  const { openDiceRoller } = useDice();
  const [activePane, setActivePane] = useState('skills'); // 'skills' | 'granted' | 'modifiers'
  const [expandedCategories, setExpandedCategories] = useState({}); // ALL CATEGORIES COLLAPSED BY DEFAULT
  const searchQuery = '';
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [showTrainedOnly, setShowTrainedOnly] = useState(false);
  const [showIdentitySummary, setShowIdentitySummary] = useState(true);

  const toggleCategory = useCallback((catKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  }, []);

  const ALL_CATEGORY_KEYS = useMemo(() => ['physical', 'mental', 'social', 'combat', 'meta'], []);

  const areAllCategoriesExpanded = useMemo(() => {
    return ALL_CATEGORY_KEYS.every(catKey => Boolean(expandedCategories[catKey]));
  }, [ALL_CATEGORY_KEYS, expandedCategories]);

  const toggleAllCategories = useCallback(() => {
    if (areAllCategoriesExpanded) {
      setExpandedCategories({});
    } else {
      setExpandedCategories({
        physical: true,
        mental: true,
        social: true,
        combat: true,
        meta: true
      });
    }
  }, [areAllCategoriesExpanded]);

  const expandAllCategories = useCallback(() => {
    setExpandedCategories({
      physical: true,
      mental: true,
      social: true,
      combat: true,
      meta: true
    });
  }, []);

  const collapseAllCategories = useCallback(() => {
    setExpandedCategories({});
  }, []);

  // Helper to extract clean normalized skill tokens with full group pattern expansion
  const addSkillToPillarSet = (set, raw) => {
    if (!raw) return;
    const str = typeof raw === 'object' ? (raw.name || raw.skill || raw.id || '') : String(raw);
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean) set.add(clean);
    const matchParen = str.match(/\(([^)]+)\)/);
    if (matchParen && matchParen[1]) {
      const innerClean = matchParen[1].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (innerClean && innerClean !== 'any') set.add(innerClean);
    }
    const baseWord = str.split('(')[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseWord && baseWord.length >= 3) set.add(baseWord);

    // Expand group patterns (e.g. "Mental (Any)", "Physical (Any)", "Combat (Any)", "Vocations", "ANY")
    try {
      const expanded = expandSkillGroupPatterns([raw]);
      if (expanded.items && expanded.items.length > 0) {
        expanded.items.forEach(s => {
          const sName = (s.name || s.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const sCleanId = (s.id || '').replace(/^[a-z]+-/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (sName) set.add(sName);
          if (sCleanId) set.add(sCleanId);
        });
      }
    } catch {
      // safe fallback
    }
  };

  // 1. Archetype Recommended / Essential Skills
  const archetypeEssentialSkills = useMemo(() => {
    const archName = characterData?.['char-archetype'];
    if (!archName) return new Set();
    const arch = DEFAULT_ARCHETYPES.find(a => (a.name || a.id || '').toLowerCase() === String(archName).toLowerCase());
    if (!arch || !Array.isArray(arch.essential_skills)) return new Set();
    const set = new Set();
    arch.essential_skills.forEach(s => addSkillToPillarSet(set, s));
    return set;
  }, [characterData?.['char-archetype']]);

  // 2. Species Recommended / Granted Skills
  const speciesRecommendedSkills = useMemo(() => {
    const specName = characterData?.['char-species'];
    if (!specName) return new Set();
    const spec = DEFAULT_SPECIES.find(s => (s.name || s.title || s.id || '').toLowerCase() === String(specName).toLowerCase());
    const set = new Set();
    if (spec) {
      if (Array.isArray(spec.specific_skill_bonuses)) {
        spec.specific_skill_bonuses.forEach(b => addSkillToPillarSet(set, b.skill || b.name));
      }
      if (Array.isArray(spec.bonus_skill_choices)) {
        spec.bonus_skill_choices.forEach(s => addSkillToPillarSet(set, s));
      }
      if (Array.isArray(spec.skills)) {
        spec.skills.forEach(s => addSkillToPillarSet(set, s));
      }
    }
    const allocated = characterData?.speciesAllocations?.skills;
    if (allocated && typeof allocated === 'object') {
      Object.keys(allocated).forEach(k => addSkillToPillarSet(set, k));
    }
    return set;
  }, [characterData?.['char-species'], characterData?.speciesAllocations]);

  // 3. Occupation Recommended Skills
  const occupationRecommendedSkills = useMemo(() => {
    const occuName = characterData?.['char-occu'];
    if (!occuName) return new Set();
    const occu = DEFAULT_OCCUPATIONS.find(o => (o.name || o.id || '').toLowerCase() === String(occuName).toLowerCase());
    const set = new Set();
    if (occu) {
      const skills = occu.professional_skills || occu.skills || [];
      if (Array.isArray(skills)) {
        skills.forEach(s => addSkillToPillarSet(set, s));
      }
    }
    const allocated = characterData?.occuAllocations?.skills;
    if (allocated && typeof allocated === 'object') {
      Object.keys(allocated).forEach(k => addSkillToPillarSet(set, k));
    }
    return set;
  }, [characterData?.['char-occu'], characterData?.occuAllocations]);

  // 4. Origin Recommended Skills
  const originRecommendedSkills = useMemo(() => {
    const origName = characterData?.['char-origin'];
    if (!origName) return new Set();
    const orig = DEFAULT_ORIGINS.find(o => (o.name || o.id || '').toLowerCase() === String(origName).toLowerCase());
    const set = new Set();
    if (orig) {
      const skills = orig.society_skills || orig.skills || [];
      if (Array.isArray(skills)) {
        skills.forEach(s => addSkillToPillarSet(set, s));
      }
    }
    const allocated = characterData?.originAllocations?.skills;
    if (allocated && typeof allocated === 'object') {
      Object.keys(allocated).forEach(k => addSkillToPillarSet(set, k));
    }
    return set;
  }, [characterData?.['char-origin'], characterData?.originAllocations]);

  // 5. Faction Recommended Skills
  const factionRecommendedSkills = useMemo(() => {
    const facName = characterData?.['char-faction'];
    if (!facName) return new Set();
    const fac = DEFAULT_FACTIONS.find(f => (f.name || f.id || '').toLowerCase() === String(facName).toLowerCase());
    const set = new Set();
    if (fac) {
      const skills = fac.skill_package || fac.skills || [];
      if (Array.isArray(skills)) {
        skills.forEach(s => addSkillToPillarSet(set, s));
      }
    }
    const allocated = characterData?.factionAllocations?.skills;
    if (allocated && typeof allocated === 'object') {
      Object.keys(allocated).forEach(k => addSkillToPillarSet(set, k));
    }
    return set;
  }, [characterData?.['char-faction'], characterData?.factionAllocations]);

  // Universal helper to match a skill against a pillar recommendation set
  const checkSkillMatchesSet = useCallback((set, skill) => {
    if (!set || set.size === 0 || !skill) return false;
    const sName = (skill.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sCleanId = (skill.id || '').replace(/^[a-z]+-/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (set.has(sName) || set.has(sCleanId)) return true;
    for (const item of set) {
      if (!item || item.length < 3) continue;
      if (sName === item || sCleanId === item || (sName.startsWith(item) && item.length >= 4) || (item.startsWith(sName) && sName.length >= 4)) {
        return true;
      }
    }
    return false;
  }, []);

  // Compute list of recommending identity pillars for a skill
  const getPillarRecommendations = useCallback((skill) => {
    const list = [];
    if (checkSkillMatchesSet(archetypeEssentialSkills, skill)) {
      list.push({
        id: 'archetype',
        name: 'Archetype',
        detail: characterData?.['char-archetype'] || 'Archetype',
        dotClass: 'bg-amber-400 border border-amber-300/80 shadow-[0_0_5px_rgba(245,158,11,0.7)]',
        tooltip: `Recommended by Archetype: ${characterData?.['char-archetype'] || 'Selected Archetype'}`
      });
    }
    if (checkSkillMatchesSet(speciesRecommendedSkills, skill)) {
      list.push({
        id: 'species',
        name: 'Species',
        detail: characterData?.['char-species'] || 'Species',
        dotClass: 'bg-cyan-400 border border-cyan-300/80 shadow-[0_0_5px_rgba(34,211,238,0.7)]',
        tooltip: `Recommended / Granted by Species: ${characterData?.['char-species'] || 'Selected Species'}`
      });
    }
    if (checkSkillMatchesSet(occupationRecommendedSkills, skill)) {
      list.push({
        id: 'occupation',
        name: 'Occupation',
        detail: characterData?.['char-occu'] || 'Occupation',
        dotClass: 'bg-sky-400 border border-sky-300/80 shadow-[0_0_5px_rgba(56,189,248,0.7)]',
        tooltip: `Recommended by Occupation: ${characterData?.['char-occu'] || 'Selected Occupation'}`
      });
    }
    if (checkSkillMatchesSet(originRecommendedSkills, skill)) {
      list.push({
        id: 'origin',
        name: 'Origin',
        detail: characterData?.['char-origin'] || 'Origin',
        dotClass: 'bg-emerald-400 border border-emerald-300/80 shadow-[0_0_5px_rgba(52,211,153,0.7)]',
        tooltip: `Recommended by Origin: ${characterData?.['char-origin'] || 'Selected Origin'}`
      });
    }
    if (checkSkillMatchesSet(factionRecommendedSkills, skill)) {
      list.push({
        id: 'faction',
        name: 'Faction',
        detail: characterData?.['char-faction'] || 'Faction',
        dotClass: 'bg-purple-400 border border-purple-300/80 shadow-[0_0_5px_rgba(192,132,252,0.7)]',
        tooltip: `Recommended by Faction: ${characterData?.['char-faction'] || 'Selected Faction'}`
      });
    }
    return list;
  }, [
    checkSkillMatchesSet,
    archetypeEssentialSkills,
    speciesRecommendedSkills,
    occupationRecommendedSkills,
    originRecommendedSkills,
    factionRecommendedSkills,
    characterData
  ]);

  // Identity Pools SP Breakdown
  const identityPoolsBreakdown = useMemo(() => {
    const calcPoolSP = (poolObj) => {
      if (!poolObj || typeof poolObj !== 'object') return 0;
      return Object.values(poolObj).reduce((sum, v) => sum + (parseInt(typeof v === 'object' ? (v.rank || v.value) : v, 10) || 0), 0);
    };

    return {
      species: {
        name: characterData?.['char-species'] || 'Species',
        allocated: calcPoolSP(characterData?.speciesAllocations?.skills),
        skills: characterData?.speciesAllocations?.skills || {}
      },
      occupation: {
        name: characterData?.['char-occu'] || 'Occupation',
        allocated: calcPoolSP(characterData?.occuAllocations?.skills),
        skills: characterData?.occuAllocations?.skills || {}
      },
      origin: {
        name: characterData?.['char-origin'] || 'Origin',
        allocated: calcPoolSP(characterData?.originAllocations?.skills),
        skills: characterData?.originAllocations?.skills || {}
      },
      faction: {
        name: characterData?.['char-faction'] || 'Faction',
        allocated: calcPoolSP(characterData?.factionAllocations?.skills),
        skills: characterData?.factionAllocations?.skills || {}
      }
    };
  }, [characterData]);

  // Calculate total granted skills count
  const totalGrantedCount = useMemo(() => {
    let count = 0;
    count += Object.keys(identityPoolsBreakdown.species.skills).length;
    count += Object.keys(identityPoolsBreakdown.occupation.skills).length;
    count += Object.keys(identityPoolsBreakdown.origin.skills).length;
    count += Object.keys(identityPoolsBreakdown.faction.skills).length;
    count += (computedModifiers?.activeSkillModifiers?.length || 0);
    return count;
  }, [identityPoolsBreakdown, computedModifiers?.activeSkillModifiers]);

  // Calculate total active modifiers count
  const totalModifiersCount = useMemo(() => {
    let count = 0;
    if (Array.isArray(characterData?.customSituationalModifiers)) {
      count += characterData.customSituationalModifiers.length;
    }
    count += (computedModifiers?.activeEquipmentModifiers?.length || 0);
    count += (computedModifiers?.activeTraitModifiers?.length || 0);
    return count;
  }, [characterData?.customSituationalModifiers, computedModifiers]);

  const isStatsLocked = isInActiveGame && !isGMConfirmed;
  const isSheetLocked = Boolean(isFolioLocked && !isPlayerOverride);

  const getNum = useCallback((id) => parseInt(characterData?.[id] || 0, 10), [characterData]);

  // Universal skill rank resolver supporting canonical key, legacy non-prefixed key, allocation pools, and structured arrays
  const getSkillRank = useCallback((skill) => {
    if (!skill || !characterData) return 0;
    const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
    const sName = typeof skill === 'object' ? (skill.name || '') : '';
    const cleanId = sId.replace(/^[a-z]+-/, '');
    const cleanName = sName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Direct canonical key (e.g. skill-physical-acrobatics-rank)
    if (characterData[`skill-${sId}-rank`] !== undefined) {
      const val = parseInt(characterData[`skill-${sId}-rank`], 10);
      if (!isNaN(val) && val > 0) return Math.min(20, Math.max(0, val));
    }

    // 2. Legacy / non-prefixed key (e.g. skill-acrobatics-rank)
    if (cleanId && characterData[`skill-${cleanId}-rank`] !== undefined) {
      const val = parseInt(characterData[`skill-${cleanId}-rank`], 10);
      if (!isNaN(val) && val > 0) return Math.min(20, Math.max(0, val));
    }

    // 3. Check identity allocation pools (species, occu, origin, faction, general)
    const pools = [
      characterData?.speciesAllocations?.skills,
      characterData?.occuAllocations?.skills,
      characterData?.originAllocations?.skills,
      characterData?.factionAllocations?.skills,
      characterData?.generalAllocations?.skills
    ];
    let poolTotal = 0;
    pools.forEach(p => {
      if (!p || typeof p !== 'object') return;
      Object.entries(p).forEach(([k, v]) => {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if ((cleanName && cleanK === cleanName) || (cleanId && cleanK === cleanId.replace(/[^a-z0-9]/g, ''))) {
          poolTotal += parseInt(v, 10) || 0;
        }
      });
    });
    if (poolTotal > 0) return Math.min(20, Math.max(0, poolTotal));

    // 4. Check characterData.skills if structured array or object
    if (Array.isArray(characterData?.skills)) {
      const match = characterData.skills.find(item => {
        if (!item) return false;
        const n = (typeof item === 'object' ? (item.name || item.id || '') : String(item)).toLowerCase().replace(/[^a-z0-9]/g, '');
        return (cleanName && n === cleanName) || (cleanId && n === cleanId.replace(/[^a-z0-9]/g, ''));
      });
      if (match) {
        const val = typeof match === 'object' ? (match.rank ?? match.value ?? 1) : 1;
        return Math.min(20, Math.max(0, parseInt(val, 10) || 0));
      }
    } else if (characterData?.skills && typeof characterData.skills === 'object') {
      for (const [k, v] of Object.entries(characterData.skills)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if ((cleanName && cleanK === cleanName) || (cleanId && cleanK === cleanId.replace(/[^a-z0-9]/g, ''))) {
          const val = typeof v === 'object' ? (v.rank ?? v.value ?? 1) : parseInt(v, 10) || 1;
          return Math.min(20, Math.max(0, val));
        }
      }
    }

    return 0;
  }, [characterData]);

  // Universal skill modifier resolver using comprehensive modifier engine (features, traits, hindrances, augmentations, equipment, manual)
  const getSkillMod = useCallback((skill) => {
    if (!skill) return 0;
    if (getSkillBreakdown) {
      const breakdown = getSkillBreakdown(skill);
      if (breakdown && typeof breakdown.totalModifier === 'number') {
        return breakdown.totalModifier;
      }
    }
    if (!characterData) return 0;
    const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
    const cleanId = sId.replace(/^[a-z]+-/, '');

    const canonMod = parseInt(characterData[`skill-${sId}-mod`], 10);
    if (!isNaN(canonMod) && canonMod !== 0) return canonMod;

    const legacyMod = parseInt(characterData[`skill-${cleanId}-mod`], 10);
    if (!isNaN(legacyMod) && legacyMod !== 0) return legacyMod;

    return 0;
  }, [characterData, getSkillBreakdown]);

  // Helper to calculate total for a regular skill (rank max 20 + attribute + all active modifiers)
  const getSkillTotal = useCallback((skill) => {
    if (!skill) return 0;
    if (getSkillBreakdown) {
      const breakdown = getSkillBreakdown(skill);
      if (breakdown && typeof breakdown.score === 'number') {
        return breakdown.score;
      }
    }
    const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
    const cleanId = sId.replace(/^[a-z]+-/, '');
    const rank = getSkillRank(skill);
    const mod = getSkillMod(skill);
    const baseAttrKey = characterData?.[`skill-${sId}-base`] || characterData?.[`skill-${cleanId}-base`] || (typeof skill === 'object' ? skill.baseAttr : '') || '';

    let baseAttrVal = 0;
    if (baseAttrKey) {
      const attrVal = getNum(baseAttrKey);
      const attrMod = getNum(`${baseAttrKey}-mod`);
      baseAttrVal = attrVal + attrMod;
    }

    return rank + baseAttrVal + mod;
  }, [characterData, getNum, getSkillRank, getSkillMod, getSkillBreakdown]);

  // Collect default skill IDs set to detect custom skills
  const defaultSkillIds = useMemo(() => {
    const ids = new Set();
    Object.values(DEFAULT_SKILLS).forEach((groups) => {
      groups.forEach((g) => {
        g.skills.forEach((s) => ids.add(s.id));
      });
    });
    return ids;
  }, []);

  // Dynamically map custom skills added by user by group and subcategory
  const customSkillsBySubcategory = useMemo(() => {
    const result = {};
    if (!characterData || typeof characterData !== 'object') return result;

    const BANNED_CUSTOM_IDS = new Set([
      'knowledge', 'knowledges', 'vocation', 'vocations', 'discipline', 'disciplines', 'metafocus',
      'skill', 'skills', 'general', 'physical', 'mental', 'social', 'combat', 'meta'
    ]);

    const META_DISCIPLINE_KEYS = {
      dimension: 'Dimension',
      energy: 'Energy',
      entropy: 'Entropy',
      illusion: 'Illusion',
      matter: 'Matter',
      mental: 'Mental',
      mind: 'Mental'
    };

    Object.keys(characterData).forEach((key) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const id = key.replace('skill-', '').replace('-rank', '');
        const cleanIdLower = id.toLowerCase();

        // 1. Exclude bare category header names
        if (BANNED_CUSTOM_IDS.has(cleanIdLower)) return;

        // 2. Check if this is a canonical skill or legacy stripped ID
        const isCanonicalOrLegacy = defaultSkillIds.has(id) || Array.from(defaultSkillIds).some(did => did.replace(/^[a-z]+-/, '') === id);
        if (isCanonicalOrLegacy) return;

        // 3. Determine Group & Subcategory
        const parts = id.split('-');
        let group = ['physical', 'mental', 'social', 'combat', 'meta'].includes(parts[0]) ? parts[0] : null;
        let subcategory = characterData[`skill-${id}-subcategory`];

        if (!group) {
          if (id.startsWith('knowledge-') || subcategory?.toLowerCase() === 'knowledges') {
            group = 'mental';
            subcategory = 'Knowledges';
          } else if (id.startsWith('vocation-') || subcategory?.toLowerCase() === 'vocations') {
            group = 'mental';
            subcategory = 'Vocations';
          } else if (id.startsWith('meta-') || META_DISCIPLINE_KEYS[cleanIdLower] || cleanIdLower === 'attune') {
            group = 'meta';
            subcategory = META_DISCIPLINE_KEYS[cleanIdLower] || (cleanIdLower === 'attune' ? 'General' : 'Disciplines');
          } else {
            group = 'mental';
            subcategory = subcategory || 'General';
          }
        } else if (group === 'meta') {
          subcategory = subcategory || META_DISCIPLINE_KEYS[cleanIdLower.replace('meta-', '')] || 'Disciplines';
        } else if (group === 'mental') {
          if (id.startsWith('mental-knowledge-') || subcategory?.toLowerCase() === 'knowledges') {
            subcategory = 'Knowledges';
          } else if (id.startsWith('mental-vocation-') || subcategory?.toLowerCase() === 'vocations') {
            subcategory = 'Vocations';
          } else {
            subcategory = subcategory || 'General';
          }
        } else {
          subcategory = subcategory || 'General';
        }

        // Exclude meta disciplines or attune if somehow labeled under mental group
        if (META_DISCIPLINE_KEYS[cleanIdLower] || cleanIdLower === 'attune') {
          group = 'meta';
          subcategory = META_DISCIPLINE_KEYS[cleanIdLower] || 'General';
        }

        const storedName = characterData[`skill-${id}-name`];
        const name = storedName || parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || id;
        
        // Final sanity check: if the name is literally a category name, exclude it
        if (BANNED_CUSTOM_IDS.has(name.toLowerCase().trim())) return;

        const mapKey = `${group}|${subcategory}`;
        if (!result[mapKey]) result[mapKey] = [];
        result[mapKey].push({ name, id, group, subcategory });
      }
    });
    return result;
  }, [characterData, defaultSkillIds]);

  // Master list of all skills (default + custom) with current total scores for specialization pickers
  const allAvailableSkills = useMemo(() => {
    const list = [];
    Object.keys(DEFAULT_SKILLS).forEach((catKey) => {
      DEFAULT_SKILLS[catKey].forEach((group) => {
        group.skills.forEach((s) => {
          list.push({
            id: s.id,
            name: s.name,
            group: catKey,
            description: s.description,
            baseAttr: s.baseAttr,
            rank: getSkillRank(s),
            total: getSkillTotal(s)
          });
        });
      });
    });
    Object.values(customSkillsBySubcategory).forEach((skillsList) => {
      skillsList.forEach((s) => {
        list.push({
          id: s.id,
          name: s.name,
          group: s.group,
          description: characterData?.[`skill-${s.id}-description`] || characterData?.[`skill-${s.id}-desc`] || 'Custom operative skill.',
          baseAttr: characterData?.[`skill-${s.id}-base`] || 'attr-intellect',
          rank: getSkillRank(s),
          total: getSkillTotal(s)
        });
      });
    });
    return list;
  }, [customSkillsBySubcategory, getSkillTotal, getSkillRank, characterData]);

  // Lookup map for skill names and totals by ID
  const skillLookup = useMemo(() => {
    const map = {};
    allAvailableSkills.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [allAvailableSkills]);

  // Map specializations and learned Invocations by baseSkillId
  const specializationsByBaseSkill = useMemo(() => {
    const map = {};
    const specs = Array.isArray(characterData?.specializations) ? characterData.specializations : [];
    const seenIds = new Set();

    specs.forEach((s) => {
      if (!s || typeof s !== 'object' || !s.baseSkillId) return;
      seenIds.add(s.id);
      if (!map[s.baseSkillId]) map[s.baseSkillId] = [];
      map[s.baseSkillId].push(s);
      const cleanBaseId = s.baseSkillId.replace(/^[a-z]+-/, '');
      if (cleanBaseId !== s.baseSkillId) {
        if (!map[cleanBaseId]) map[cleanBaseId] = [];
        map[cleanBaseId].push(s);
      }
    });

    // Sub-list learned Invocations under the appropriate meta skill
    const invs = Array.isArray(characterData?.invocations) ? characterData.invocations : [];
    invs.forEach((inv) => {
      if (!inv) return;
      const invObj = typeof inv === 'object' ? inv : { name: String(inv) };
      const resolved = resolveMetaSkillForInvocation(invObj);
      const baseSkillId = invObj.baseSkillId || resolved.baseSkillId;
      const id = invObj.id || `inv_${invObj.name}`;

      if (seenIds.has(id)) return;
      seenIds.add(id);

      const isSpecAbility = isSpecialAbility(invObj);
      const invSpecItem = {
        id,
        name: invObj.name || invObj.title || 'Invocation',
        baseSkillId,
        rank: Math.min(10, Math.max(1, parseInt(invObj.rank || 1, 10))),
        mod: parseInt(invObj.mod || 0, 10),
        isInvocation: true,
        isSpecialAbility: isSpecAbility,
        powerType: isSpecAbility ? 'special_ability' : 'invocation',
        foundationAttribute: invObj.foundationAttribute || invObj.foundation_attribute || invObj.baseAttr || 'attr-intellect',
        sourceInvocation: invObj,
        discipline: invObj.discipline || resolved.discipline,
        subSkill: invObj.subSkill || resolved.subSkill,
        baseDC: invObj.baseDC || 15,
        description: invObj.description || invObj.body || '',
        cp: invObj.cp !== undefined ? parseInt(invObj.cp, 10) : 1
      };

      if (!map[baseSkillId]) map[baseSkillId] = [];
      map[baseSkillId].push(invSpecItem);

      const cleanBaseId = baseSkillId.replace(/^[a-z]+-/, '');
      if (cleanBaseId !== baseSkillId) {
        if (!map[cleanBaseId]) map[cleanBaseId] = [];
        map[cleanBaseId].push(invSpecItem);
      }
    });

    return map;
  }, [characterData?.specializations, characterData?.invocations]);

  // Unified update handler for standard Specializations & Invocations
  const handleUpdateSpecOrInv = useCallback((spec, field, value) => {
    if (spec.isInvocation) {
      const currentInvs = Array.isArray(characterData?.invocations) ? [...characterData.invocations] : [];
      const idx = currentInvs.findIndex(i => (typeof i === 'object' ? (i.id === spec.id || i.name === spec.name) : i === spec.name));
      if (idx >= 0) {
        const oldObj = typeof currentInvs[idx] === 'object' ? currentInvs[idx] : { name: currentInvs[idx] };
        currentInvs[idx] = {
          ...oldObj,
          [field]: field === 'rank' ? Math.min(10, Math.max(1, parseInt(value, 10) || 1)) : parseInt(value, 10) || 0
        };
        updateField('invocations', currentInvs);
      }
    } else {
      handleUpdateSpecialization(spec.id, field, value);
    }
  }, [characterData?.invocations, updateField, handleUpdateSpecialization]);

  // Unified delete handler for standard Specializations & Invocations
  const handleDeleteSpecOrInv = useCallback(async (spec) => {
    if (spec.isInvocation) {
      if (await confirmTypedDeletion(spec.name, 'invocation')) {
        const currentInvs = Array.isArray(characterData?.invocations) ? [...characterData.invocations] : [];
        const updated = currentInvs.filter(i => (typeof i === 'object' ? (i.id !== spec.id && i.name !== spec.name) : i !== spec.name));
        updateField('invocations', updated);
      }
    } else {
      if (await confirmTypedDeletion(spec.name, 'specialization')) {
        handleDeleteSpecialization(spec.id);
      }
    }
  }, [characterData?.invocations, updateField, handleDeleteSpecialization]);

  // Dynamic Skill Counts per category tab
  const categoryCounts = useMemo(() => {
    const counts = { all: 0, physical: 0, mental: 0, social: 0, combat: 0, meta: 0 };
    const q = searchQuery.trim().toLowerCase();

    ['physical', 'mental', 'social', 'combat', 'meta'].forEach((catKey) => {
      const groupList = DEFAULT_SKILLS[catKey] || [];
      const standardSubcategoryTitles = new Set(groupList.map(g => g.title || 'General'));
      if (catKey === 'meta') {
        ['Disciplines', 'Dimension', 'Energy', 'Entropy', 'Illusion', 'Matter', 'Mental'].forEach(t => standardSubcategoryTitles.add(t));
      }

      let count = 0;
      groupList.forEach((g) => {
        const subTitle = g.title || 'General';
        let customSubSkills = [];
        if (catKey === 'meta' && subTitle === 'Disciplines') {
          const metaDisciplineKeys = ['Disciplines', 'Dimension', 'Energy', 'Entropy', 'Illusion', 'Matter', 'Mental'];
          metaDisciplineKeys.forEach(dk => {
            const skillsList = customSkillsBySubcategory[`meta|${dk}`] || [];
            customSubSkills.push(...skillsList);
          });
        } else {
          const mapKey = `${catKey}|${subTitle}`;
          customSubSkills = customSkillsBySubcategory[mapKey] || [];
        }
        const combinedSkills = [...g.skills, ...customSubSkills];
        combinedSkills.forEach((s) => {
          const sRank = getSkillRank(s);
          if (showTrainedOnly && sRank === 0) return;

          if (!q) {
            count++;
          } else {
            const specMatches = (specializationsByBaseSkill[s.id] || []).some(spec => spec && spec.name && spec.name.toLowerCase().includes(q));
            if (s.name.toLowerCase().includes(q) || (g.title && g.title.toLowerCase().includes(q)) || specMatches) {
              count++;
            }
          }
        });
      });

      Object.keys(customSkillsBySubcategory).forEach((mapKey) => {
        const [grp, sub] = mapKey.split('|');
        if (grp === catKey && !standardSubcategoryTitles.has(sub)) {
          customSkillsBySubcategory[mapKey].forEach((s) => {
            const sRank = getSkillRank(s);
            if (showTrainedOnly && sRank === 0) return;

            if (!q || s.name.toLowerCase().includes(q)) {
              count++;
            }
          });
        }
      });

      counts[catKey] = count;
      counts.all += count;
    });

    return counts;
  }, [searchQuery, customSkillsBySubcategory, specializationsByBaseSkill, showTrainedOnly, getSkillRank]);

  // Set of unlocked Metafocus discipline names (lowercase) from purchased features/awakened items
  const unlockedDisciplines = useMemo(() => {
    const unlocked = new Set();
    const featuresList = Array.isArray(characterData?.features) ? characterData.features : [];
    const awakenedList = Array.isArray(characterData?.awakened) ? characterData.awakened : [];
    const allFeats = [...featuresList, ...awakenedList];

    allFeats.forEach((feat) => {
      if (!feat) return;
      const featName = (typeof feat === 'object' ? (feat.name || feat.title || '') : String(feat)).toLowerCase();
      const featType = (typeof feat === 'object' ? (feat.type || feat.category || '') : '').toLowerCase();
      const featId = (typeof feat === 'object' ? (feat.id || '') : '').toLowerCase();

      const isAwakened = featType.includes('awakened') || featName.includes('awakened') || featId.includes('awakened') || (Array.isArray(characterData?.awakened) && characterData.awakened.includes(feat));

      if (isAwakened) {
        if (featName.includes('dimension') || featId.endsWith('_dim') || featId.endsWith('-dim') || featId === 'dimension') {
          unlocked.add('dimension');
        }
        if (featName.includes('energy') || featId.endsWith('_ene') || featId.endsWith('-ene') || featId === 'energy') {
          unlocked.add('energy');
        }
        if (featName.includes('entropy') || featId.endsWith('_ent') || featId.endsWith('-ent') || featId === 'entropy') {
          unlocked.add('entropy');
        }
        if (featName.includes('illusion') || featId.endsWith('_ill') || featId.endsWith('-ill') || featId === 'illusion') {
          unlocked.add('illusion');
        }
        if (featName.includes('matter') || featId.endsWith('_mat') || featId.endsWith('-mat') || featId === 'matter') {
          unlocked.add('matter');
        }
        if (featName.includes('mental') || featId.endsWith('_men') || featId.endsWith('-men') || featId === 'mental') {
          unlocked.add('mental');
        }
      }
    });

    return unlocked;
  }, [characterData?.features, characterData?.awakened]);

  const hasAnyAwakened = unlockedDisciplines.size > 0;

  // Helper to determine the parent discipline for a metaphysical skill
  const getDisciplineForSkill = (skill) => {
    if (skill.discipline) return skill.discipline.toLowerCase();
    const id = skill.id.toLowerCase();
    if (id === 'meta-summoning' || id === 'meta-teleport' || id === 'meta-dimension') return 'dimension';
    if (id === 'meta-elemental' || id === 'meta-force' || id === 'meta-energy') return 'energy';
    if (id === 'meta-chaos' || id === 'meta-order' || id === 'meta-entropy') return 'entropy';
    if (id === 'meta-phantasm' || id === 'meta-shadow' || id === 'meta-illusion') return 'illusion';
    if (id === 'meta-enhancement' || id === 'meta-transmutation' || id === 'meta-matter') return 'matter';
    if (id === 'meta-projection' || id === 'meta-sense' || id === 'meta-mental') return 'mental';
    return null;
  };

  const renderSkillRow = (skill) => {
    const isCustom = !defaultSkillIds.has(skill.id);
    const isAttune = skill.id === 'meta-attune';
    const discKey = getDisciplineForSkill(skill);
    const isDisciplineSkill = (skill.group === 'meta' || skill.id.startsWith('meta-')) && !isAttune && Boolean(discKey);
    const cleanId = skill.id.replace(/^[a-z]+-/, '');

    const cleanName = (skill.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const isArchetypeEssential = archetypeEssentialSkills.has(cleanName) || archetypeEssentialSkills.has(cleanId.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Locking rules:
    // 1. Attune is locked unless character has ANY awakened feature
    // 2. Discipline skills are locked unless character has THAT specific awakened discipline
    let isDisciplineLocked = false;
    let lockMessage = '';

    if (isAttune) {
      if (!hasAnyAwakened) {
        isDisciplineLocked = true;
        lockMessage = "Attune requires purchasing or possessing any Awakened feature in the Features tab";
      }
    } else if (isDisciplineSkill) {
      if (!unlockedDisciplines.has(discKey)) {
        isDisciplineLocked = true;
        lockMessage = `Requires possessing the Awakened: ${discKey.charAt(0).toUpperCase() + discKey.slice(1)} feature`;
      }
    }

    const breakdown = getSkillBreakdown ? getSkillBreakdown(skill) : null;
    const rank = breakdown?.rank ?? getSkillRank(skill);
    const mod = breakdown?.totalModifier ?? getSkillMod(skill);
    const baseAttr = characterData?.[`skill-${skill.id}-base`] || characterData?.[`skill-${cleanId}-base`] || skill.baseAttr || '';
    const baseAttrLabel = breakdown?.baseAttrLabel || ATTRIBUTE_OPTIONS.find((opt) => opt.value === baseAttr)?.label || '--';
    const baseSkillTotal = breakdown?.score ?? getSkillTotal(skill);
    const linkedSpecs = specializationsByBaseSkill[skill.id] || specializationsByBaseSkill[cleanId] || [];
    const pillarRecs = getPillarRecommendations(skill);

    const groupName = skill.group ? skill.group.charAt(0).toUpperCase() + skill.group.slice(1) : 'General';
    const badgeColor = isDisciplineSkill ? 'purple' : (CATEGORY_CONFIG_MAP[skill.group]?.key === 'physical' ? 'emerald' : CATEGORY_CONFIG_MAP[skill.group]?.key === 'mental' ? 'blue' : CATEGORY_CONFIG_MAP[skill.group]?.key === 'social' ? 'cyan' : CATEGORY_CONFIG_MAP[skill.group]?.key === 'combat' ? 'amber' : 'purple');
    const skillDesc = characterData?.[`skill-${skill.id}-description`] || characterData?.[`skill-${skill.id}-desc`] || skill.description || 'Core operative skill.';

    return (
      <div key={skill.id} className="space-y-1.5">
        {/* Desktop / Tablet Grid View (>= 640px) */}
        <div
          className={`folio-skill-row-desktop grid-cols-12 items-center gap-2 py-1 px-2 rounded transition-colors text-xs border ${
            isDisciplineLocked
              ? 'bg-slate-950/40 opacity-60 border-slate-800/60'
              : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/40'
          }`}
          title={isDisciplineLocked ? lockMessage : undefined}
        >
          <div className="col-span-4 flex items-center justify-between pr-1 overflow-hidden">
            <div className="flex items-center gap-1.5 truncate">
              <FolioTooltip
                title={skill.name}
                badge={`${groupName} Skill`}
                badgeColor={badgeColor}
                description={isDisciplineLocked ? `${lockMessage}. ${skillDesc}` : skillDesc}
                formula={breakdown?.formula || `Total (${baseSkillTotal}) = Rank (${rank}) + Base ${baseAttrLabel} + Mod (${mod})`}
                skillBreakdown={breakdown}
                associatedEquipment={breakdown?.equipment}
                tags={['Max Rank: 20', `Base: ${baseAttrLabel}`, groupName.toUpperCase(), ...pillarRecs.map(p => `${p.name}: ${p.detail}`)]}
                showInfoIcon={true}
              >
                <span className={`font-medium ${isDisciplineLocked ? 'text-slate-500' : 'text-slate-200 hover:text-cyan-300'} truncate transition-colors`}>
                  {skill.name}
                </span>
              </FolioTooltip>
              {pillarRecs.length > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-0.5" title={pillarRecs.map(p => p.tooltip).join(' • ')}>
                  {pillarRecs.map((pillar) => (
                    <span
                      key={pillar.id}
                      className={`w-2 h-2 rounded-full shrink-0 ${pillar.dotClass}`}
                      title={pillar.tooltip}
                    />
                  ))}
                </div>
              )}
              {isDisciplineLocked && (
                <span
                  className="text-[9px] font-mono font-bold text-amber-400/90 bg-amber-950/70 border border-amber-900/60 px-1.5 py-0.2 rounded shrink-0"
                  title={lockMessage}
                >
                  🔒 Locked
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(skill.group === 'meta' || skill.id.startsWith('meta-')) && !isDisciplineLocked && !isSheetLocked && onOpenSelectorModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSelectorModal('invocations', `${skill.name} Invocations (Omnicortex)`, 'invocations', skill.discipline || skill.name);
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/90 hover:bg-purple-900 border border-purple-800 hover:border-purple-500 text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-0.5 cursor-pointer shadow-sm"
                  title={`Browse Omnicortex Invocations for ${skill.name}`}
                >
                  <Zap size={9} className="text-purple-400" />
                  <span>+ Inv</span>
                </button>
              )}
              {isCustom && !isDisciplineLocked && !isSheetLocked && (
                <button
                  type="button"
                  onClick={async () => {
                    if (await confirmTypedDeletion(skill.name, 'custom skill')) {
                      handleDeleteSkill(skill.id);
                    }
                  }}
                  className="text-red-400/60 hover:text-red-400 font-bold px-1 text-xs shrink-0 cursor-pointer"
                  title="Delete Custom Skill"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Rank Input (Max Level 20) */}
          {isSheetLocked ? (
            <span className="col-span-2 text-center font-mono font-bold text-xs text-slate-200">
              {rank}
            </span>
          ) : (
            <input
              type="number"
              min="0"
              max="20"
              disabled={isDisciplineLocked || isStatsLocked}
              value={rank}
              onChange={(e) => {
                if (isDisciplineLocked || isStatsLocked) return;
                const val = Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0));
                updateField(`skill-${skill.id}-rank`, val);
                if (cleanId !== skill.id) updateField(`skill-${cleanId}-rank`, val);
              }}
              title={isStatsLocked ? 'Skill rank locked during active game session. Request GM AP update.' : isDisciplineLocked ? lockMessage : undefined}
              className={`col-span-2 text-center bg-slate-950 border ${
                isDisciplineLocked || isStatsLocked 
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-75' 
                  : 'border-slate-700 focus:border-cyan-400 text-slate-100'
              } rounded py-0.5 outline-none text-xs font-mono`}
            />
          )}

          {/* Base Attr Select */}
          {isSheetLocked ? (
            <span className="col-span-3 text-center text-xs font-mono text-slate-300 font-semibold">
              {baseAttrLabel}
            </span>
          ) : (
            <select
              value={baseAttr}
              disabled={isDisciplineLocked || isStatsLocked}
              onChange={(e) => {
                if (isDisciplineLocked || isStatsLocked) return;
                updateField(`skill-${skill.id}-base`, e.target.value);
                if (cleanId !== skill.id) updateField(`skill-${cleanId}-base`, e.target.value);
              }}
              title={isStatsLocked ? 'Skill base attribute locked during active game session.' : undefined}
              className={`col-span-3 bg-slate-950 border ${
                isDisciplineLocked || isStatsLocked 
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-75' 
                  : 'border-slate-700 focus:border-cyan-400 text-slate-300'
              } rounded py-0.5 text-center outline-none text-xs`}
            >
              <option value="">--</option>
              {ATTRIBUTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Mod */}
          <span className={`col-span-1 text-center font-mono ${isDisciplineLocked ? 'text-slate-600' : 'text-slate-400'}`}>
            {mod}
          </span>

          {/* Total Base Skill Score & Roll Trigger */}
          <div className="col-span-2 flex items-center justify-center gap-1.5">
            <span className={`font-mono font-bold ${isDisciplineLocked ? 'text-slate-600' : 'text-cyan-300'}`}>
              {baseSkillTotal}
            </span>
            <button
              type="button"
              disabled={isDisciplineLocked}
              onClick={() => {
                if (isDisciplineLocked) return;
                openDiceRoller({
                  label: `${skill.name} Check`,
                  baseModifier: baseSkillTotal,
                  expression: `2d10${baseSkillTotal !== 0 ? (baseSkillTotal > 0 ? `+${baseSkillTotal}` : `${baseSkillTotal}`) : ''}`,
                  rollMode: 'normal',
                  characterName: characterData['char-name'] || 'Operative',
                  personaId: characterData['character-doc-id'] || characterData.id,
                  autoRoll: true
                });
              }}
              className={`p-1 rounded transition-all flex items-center justify-center cursor-pointer ${
                isDisciplineLocked
                  ? 'opacity-40 cursor-not-allowed text-slate-600'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white shadow-sm'
              }`}
              title={isDisciplineLocked ? lockMessage : `Roll ${skill.name} Check (2d10 + ${baseSkillTotal})`}
            >
              <Dices size={11} />
            </button>
          </div>
        </div>

        {/* Mobile View (< 640px) */}
        <div
          className={`folio-skill-row-mobile flex-col gap-1.5 p-2 rounded transition-colors text-xs border ${
            isDisciplineLocked
              ? 'bg-slate-950/40 opacity-60 border-slate-800/60'
              : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/60'
          }`}
          title={isDisciplineLocked ? lockMessage : undefined}
        >
          {/* Top Line: Name + Status + Delete + Total Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <FolioTooltip
                title={skill.name}
                badge={`${groupName} Skill`}
                badgeColor={badgeColor}
                description={isDisciplineLocked ? `${lockMessage}. ${skillDesc}` : skillDesc}
                formula={breakdown?.formula || `Total (${baseSkillTotal}) = Rank (${rank}) + Base ${baseAttrLabel} + Mod (${mod})`}
                skillBreakdown={breakdown}
                associatedEquipment={breakdown?.equipment}
                tags={['Max Rank: 20', `Base: ${baseAttrLabel}`, groupName.toUpperCase(), ...pillarRecs.map(p => `${p.name}: ${p.detail}`)]}
                showInfoIcon={true}
              >
                <span className={`font-semibold ${isDisciplineLocked ? 'text-slate-500' : 'text-slate-100 hover:text-cyan-300'} truncate transition-colors`}>
                  {skill.name}
                </span>
              </FolioTooltip>
              {pillarRecs.length > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-0.5" title={pillarRecs.map(p => p.tooltip).join(' • ')}>
                  {pillarRecs.map((pillar) => (
                    <span
                      key={pillar.id}
                      className={`w-2 h-2 rounded-full shrink-0 ${pillar.dotClass}`}
                      title={pillar.tooltip}
                    />
                  ))}
                </div>
              )}
              {isDisciplineLocked && (
                <span
                  className="text-[9px] font-mono font-bold text-amber-400/90 bg-amber-950/70 border border-amber-900/60 px-1.5 py-0.2 rounded shrink-0"
                  title={lockMessage}
                >
                  🔒 Locked
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                isDisciplineLocked ? 'bg-slate-800 text-slate-500' : 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-sm'
              }`}>
                Score: {baseSkillTotal}
              </span>
              <button
                type="button"
                disabled={isDisciplineLocked}
                onClick={() => {
                  if (isDisciplineLocked) return;
                  openDiceRoller({
                    label: `${skill.name} Check`,
                    baseModifier: baseSkillTotal,
                    expression: `2d10${baseSkillTotal !== 0 ? (baseSkillTotal > 0 ? `+${baseSkillTotal}` : `${baseSkillTotal}`) : ''}`,
                    rollMode: 'normal',
                    characterName: characterData['char-name'] || 'Operative',
                    personaId: characterData['character-doc-id'] || characterData.id,
                    autoRoll: true
                  });
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-0.5 cursor-pointer ${
                  isDisciplineLocked
                    ? 'opacity-40 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-600'
                    : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300'
                }`}
                title={isDisciplineLocked ? lockMessage : `Roll ${skill.name} Check (2d10 + ${baseSkillTotal})`}
              >
                <Dices size={11} />
                <span>Roll</span>
              </button>
              {isCustom && !isDisciplineLocked && !isSheetLocked && (
                <button
                  type="button"
                  onClick={async () => {
                    if (await confirmTypedDeletion(skill.name, 'custom skill')) {
                      handleDeleteSkill(skill.id);
                    }
                  }}
                  className="text-red-400/70 hover:text-red-400 font-bold p-1 text-sm shrink-0"
                  title="Delete Custom Skill"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Bottom Line: Rank Input + Base Attr Select + Mod */}
          <div className="flex items-center gap-2 text-[11px] font-mono pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">Rank:</span>
              {isSheetLocked ? (
                <span className="font-mono font-bold text-slate-200 px-1">
                  {rank}
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="20"
                  disabled={isDisciplineLocked || isStatsLocked}
                  value={rank}
                  onChange={(e) => {
                    if (isDisciplineLocked || isStatsLocked) return;
                    const val = Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0));
                    updateField(`skill-${skill.id}-rank`, val);
                    if (cleanId !== skill.id) updateField(`skill-${cleanId}-rank`, val);
                  }}
                  className={`w-12 text-center bg-slate-950 border ${
                    isDisciplineLocked || isStatsLocked 
                      ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-75' 
                      : 'border-slate-700 focus:border-cyan-400 text-slate-100'
                  } rounded py-0.5 outline-none font-bold`}
                />
              )}
            </div>

            <div className="flex items-center gap-1 flex-1">
              <span className="text-slate-400 text-[10px]">Attr:</span>
              {isSheetLocked ? (
                <span className="font-mono text-slate-300 font-semibold px-1">
                  {baseAttrLabel}
                </span>
              ) : (
                <select
                  value={baseAttr}
                  disabled={isDisciplineLocked || isStatsLocked}
                  onChange={(e) => {
                    if (isDisciplineLocked || isStatsLocked) return;
                    updateField(`skill-${skill.id}-base`, e.target.value);
                    if (cleanId !== skill.id) updateField(`skill-${cleanId}-base`, e.target.value);
                  }}
                  className={`flex-1 bg-slate-950 border ${
                    isDisciplineLocked || isStatsLocked 
                      ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-75' 
                      : 'border-slate-700 focus:border-cyan-400 text-slate-300'
                  } rounded py-0.5 text-center outline-none`}
                >
                  <option value="">--</option>
                  {ATTRIBUTE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {mod !== 0 && (
              <span className="text-amber-400 text-[10px] shrink-0">
                Mod: {mod > 0 ? `+${mod}` : mod}
              </span>
            )}
          </div>
        </div>

        {/* Linked Specializations & Invocations List */}
        {linkedSpecs.map((spec) => {
          const specRank = Math.min(10, Math.max(0, parseInt(spec.rank || 0, 10)));
          const specMod = parseInt(spec.mod || 0, 10);
          const isMetaSkill = skill.group === 'meta' || skill.id.startsWith('meta-');
          const isInvocation = spec.isInvocation || (isMetaSkill && spec.category === 'invocations');
          const isSpecAbility = spec.isSpecialAbility || isSpecialAbility(spec.sourceInvocation || spec);
          const specAttrKey = spec.foundationAttribute || spec.sourceInvocation?.foundationAttribute || 'attr-intellect';
          const specAttrTotal = getAttrTotal ? getAttrTotal(specAttrKey) : (parseInt(characterData?.[specAttrKey] || 0, 10));
          const specTotal = isSpecAbility ? (specAttrTotal + specRank + specMod) : (baseSkillTotal + specRank + specMod);
          const isSpecLocked = isSpecAbility ? false : isDisciplineLocked;

          const prereqResult = checkPrerequisite(
            { ...spec, isSpecialAbility: isSpecAbility, skillId: skill.id, skillName: skill.name, baseSkillRank: rank },
            characterData,
            isInvocation ? 'invocations' : 'specializations'
          );
          const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

          return (
            <React.Fragment key={spec.id}>
              {/* Desktop / Tablet View (>= 640px) */}
              <div
                className={`folio-skill-row-desktop ml-6 pl-2.5 border-l-2 ${
                  isPrereqUnmet
                    ? 'border-rose-900/60 bg-slate-950/80 border-dashed border-rose-900/50 opacity-60 grayscale-[70%] hover:opacity-100 hover:grayscale-0'
                    : isSpecAbility
                    ? 'border-cyan-500/80 bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-900/40'
                    : isInvocation
                    ? 'border-purple-500/80 bg-purple-950/30 hover:bg-purple-900/40 border-purple-900/40'
                    : isMetaSkill
                    ? 'border-purple-500/60 bg-purple-950/20 hover:bg-purple-900/30 border-purple-900/30'
                    : 'border-amber-500/60 bg-amber-950/20 hover:bg-amber-900/30 border-amber-900/30'
                } grid-cols-12 items-center gap-2 py-1 px-2 rounded transition-colors text-xs border`}
              >
                {/* Specialization / Invocation Name & Base Skill Ref */}
                <div className="col-span-4 flex flex-col justify-center overflow-hidden">
                  <div className="flex items-center gap-1 truncate">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      isSpecAbility
                        ? 'text-cyan-300 font-mono flex items-center gap-0.5'
                        : isInvocation
                        ? 'text-purple-300 font-mono flex items-center gap-0.5'
                        : isMetaSkill
                        ? 'text-purple-400 font-mono'
                        : 'text-amber-400/90'
                    } shrink-0`}>
                      {isSpecAbility ? <><Sparkles size={9} className="text-cyan-400" />SPECIAL ABILITY:</> : isInvocation ? <><Zap size={9} className="text-purple-400" />INVOCATION:</> : isMetaSkill ? 'EVOCATION:' : 'SPEC:'}
                    </span>
                    <FolioTooltip
                      title={spec.name}
                      badge={isSpecAbility ? 'Stand-Alone Special Ability' : isInvocation ? 'Metaphysical Invocation (1 CP)' : isMetaSkill ? 'Metaphysical Evocation' : 'Skill Specialization'}
                      badgeColor={isPrereqUnmet ? 'rose' : isSpecAbility ? 'cyan' : 'purple'}
                      description={isSpecAbility
                        ? (spec.description || `Stand-alone special ability trait governed by ${specAttrKey.replace('attr-', '').toUpperCase()}. Adds +${specRank} bonus directly to the attribute foundation.`)
                        : isInvocation
                        ? (spec.description || `Specialized invocation formula for ${skill.name}. Adds +${specRank} bonus directly to the base discipline score.`)
                        : isMetaSkill
                        ? `Specialized evocation technique for ${skill.name}. Adds +${specRank} bonus directly to the base discipline score.`
                        : `Focused specialized niche of ${skill.name}. Adds +${specRank} bonus directly to the base skill roll.`
                      }
                      formula={isSpecAbility
                        ? `Special Ability Total (${specTotal}) = Attribute Foundation (${specAttrTotal}) + Rank (${specRank}) + Mod (${specMod}) vs DC ${spec.baseDC || 15}`
                        : isInvocation
                        ? `Invocation Total (${specTotal}) = Base Skill (${baseSkillTotal}) + Rank (${specRank}) + Mod (${specMod}) vs CR ${spec.baseDC || 15}`
                        : `Spec Total (${specTotal}) = Base Skill (${baseSkillTotal}) + Rank (${specRank}) + Mod (${specMod})`
                      }
                      prerequisites={prereqResult.prerequisiteText || (isSpecAbility ? 'Stand-Alone Trait (No Awakened Discipline Required)' : isInvocation ? `Awakened (${spec.discipline || skill.name})` : `Trained ${skill.name} (Rank >= 1)`)}
                      prerequisiteMet={!isPrereqUnmet}
                      prerequisiteUnmetReasons={prereqResult.unmetReasons}
                      tags={isSpecAbility ? ['Special Ability', `Foundation: ${specAttrKey.replace('attr-', '').toUpperCase()}`, `DC: ${spec.baseDC || 15}`] : isInvocation ? ['1 CP', 'Invocation', `Base: ${skill.name}`, `DC: ${spec.baseDC || 15}`] : ['Max Rank: 10', `Base: ${skill.name}`]}
                      showInfoIcon={true}
                    >
                      <span className={`font-semibold ${isPrereqUnmet ? 'text-slate-400 hover:text-rose-300' : isSpecAbility ? 'text-cyan-200 hover:text-cyan-100' : isMetaSkill || isInvocation ? 'text-purple-200 hover:text-purple-100' : 'text-amber-200 hover:text-amber-100'} truncate transition-colors flex items-center gap-1`}>
                        <span>{spec.name}</span>
                        {isPrereqUnmet && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8.5px] font-mono uppercase bg-rose-950/90 border border-rose-800 text-rose-300">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Missing Prereq</span>
                          </span>
                        )}
                      </span>
                    </FolioTooltip>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono truncate">
                    {isSpecAbility ? 'Foundational Attribute: ' : isInvocation ? 'Discipline Skill: ' : isMetaSkill ? 'Discipline: ' : 'Base: '}<span className="text-slate-300">{isSpecAbility ? specAttrKey.replace('attr-', '').toUpperCase() : skill.name}</span> ({isSpecAbility ? specAttrTotal : baseSkillTotal})
                  </span>
                </div>

                {/* Specialization Level / Rank Input (Max Level 10) */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateSpecOrInv(spec, 'rank', specRank - 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-amber-300">
                      {specRank}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSpecOrInv(spec, 'rank', specRank + 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Mod Display */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="font-mono text-xs text-slate-400">
                    {specMod !== 0 ? (specMod > 0 ? `+${specMod}` : specMod) : '—'}
                  </span>
                </div>

                {/* Total & Roll Action */}
                <div className="col-span-4 flex items-center justify-end gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      isSpecLocked ? 'bg-slate-800 text-slate-500' : isSpecAbility ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-200' : (isMetaSkill || isInvocation ? 'bg-purple-950 border border-purple-500/50 text-purple-200' : 'bg-amber-950 border border-amber-500/50 text-amber-200')
                    }`}>
                      {isSpecLocked ? 0 : specTotal}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpecLocked) return;
                        openDiceRoller({
                          label: isSpecAbility
                            ? `${spec.name} (Special Ability) Check`
                            : `${skill.name}: ${spec.name} (${isInvocation ? 'Invocation' : isMetaSkill ? 'Evocation' : 'Specialization'})`,
                          baseModifier: specTotal,
                          expression: `2d10${specTotal !== 0 ? (specTotal > 0 ? `+${specTotal}` : `${specTotal}`) : ''}`,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Operative',
                          personaId: characterData['character-doc-id'] || characterData.id,
                          autoRoll: true
                        });
                      }}
                      disabled={isSpecLocked}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        isSpecLocked
                          ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                          : isSpecAbility
                          ? 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white shadow-sm'
                          : isInvocation
                          ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-white shadow-sm'
                          : 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white shadow-sm'
                      }`}
                      title={isSpecLocked ? lockMessage : `Roll ${spec.name} Check (2d10 + ${specTotal})`}
                    >
                      <Dices size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpecOrInv(spec)}
                      className="text-red-400/60 hover:text-red-400 font-bold px-1 text-xs shrink-0 cursor-pointer"
                      title={isSpecAbility ? "Delete Special Ability" : isInvocation ? "Delete Invocation" : isMetaSkill ? "Delete Evocation" : "Delete Specialization"}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Spec View (< 640px) */}
              <div
                className={`folio-skill-row-mobile ml-3 pl-2.5 border-l-2 ${
                  isPrereqUnmet
                    ? 'border-rose-900/60 bg-slate-950/80 border-dashed border-rose-900/50 opacity-60 grayscale-[70%] hover:opacity-100 hover:grayscale-0'
                    : isSpecAbility
                    ? 'border-cyan-500/80 bg-cyan-950/30 border-cyan-900/40'
                    : isInvocation
                    ? 'border-purple-500/80 bg-purple-950/30 border-purple-900/40'
                    : isMetaSkill
                    ? 'border-purple-500/60 bg-purple-950/20 border-purple-900/30'
                    : 'border-amber-500/60 bg-amber-950/20 border-amber-900/30'
                } p-2 rounded transition-colors text-xs border flex-col gap-1.5`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      isSpecAbility
                        ? 'text-cyan-300 font-mono flex items-center gap-0.5'
                        : isInvocation
                        ? 'text-purple-300 font-mono flex items-center gap-0.5'
                        : isMetaSkill
                        ? 'text-purple-400 font-mono'
                        : 'text-amber-400/90'
                    } shrink-0`}>
                      {isSpecAbility ? <><Sparkles size={9} className="text-cyan-400" />SPEC ABIL:</> : isInvocation ? <><Zap size={9} className="text-purple-400" />INVOC:</> : isMetaSkill ? 'EVOC:' : 'SPEC:'}
                    </span>
                    <FolioTooltip
                      title={spec.name}
                      badge={isSpecAbility ? 'Stand-Alone Special Ability' : isInvocation ? 'Metaphysical Invocation (1 CP)' : isMetaSkill ? 'Metaphysical Evocation' : 'Skill Specialization'}
                      badgeColor={isPrereqUnmet ? 'rose' : isSpecAbility ? 'cyan' : 'purple'}
                      description={isSpecAbility
                        ? (spec.description || `Stand-alone special ability trait governed by ${specAttrKey.replace('attr-', '').toUpperCase()}. Adds +${specRank} bonus directly to the attribute foundation.`)
                        : isInvocation
                        ? (spec.description || `Specialized invocation formula for ${skill.name}. Adds +${specRank} bonus directly to the base discipline score.`)
                        : isMetaSkill
                        ? `Specialized evocation technique for ${skill.name}. Adds +${specRank} bonus directly to the base discipline score.`
                        : `Focused specialized niche of ${skill.name}. Adds +${specRank} bonus directly to the base skill roll.`
                      }
                      formula={isSpecAbility
                        ? `Special Ability Total (${specTotal}) = Attribute Foundation (${specAttrTotal}) + Rank (${specRank}) + Mod (${specMod}) vs DC ${spec.baseDC || 15}`
                        : isInvocation
                        ? `Invocation Total (${specTotal}) = Base Skill (${baseSkillTotal}) + Rank (${specRank}) + Mod (${specMod}) vs CR ${spec.baseDC || 15}`
                        : `Spec Total (${specTotal}) = Base Skill (${baseSkillTotal}) + Rank (${specRank}) + Mod (${specMod})`
                      }
                      prerequisites={prereqResult.prerequisiteText || (isSpecAbility ? 'Stand-Alone Trait (No Awakened Discipline Required)' : isInvocation ? `Awakened (${spec.discipline || skill.name})` : `Trained ${skill.name} (Rank >= 1)`)}
                      prerequisiteMet={!isPrereqUnmet}
                      prerequisiteUnmetReasons={prereqResult.unmetReasons}
                      tags={isSpecAbility ? ['Special Ability', `Foundation: ${specAttrKey.replace('attr-', '').toUpperCase()}`, `DC: ${spec.baseDC || 15}`] : isInvocation ? ['1 CP', 'Invocation', `Base: ${skill.name}`] : ['Max Rank: 10', `Base: ${skill.name}`]}
                      showInfoIcon={true}
                    >
                      <span className={`font-semibold ${isPrereqUnmet ? 'text-slate-400 hover:text-rose-300' : isSpecAbility ? 'text-cyan-200 hover:text-cyan-100' : isMetaSkill || isInvocation ? 'text-purple-200 hover:text-purple-100' : 'text-amber-200 hover:text-amber-100'} truncate transition-colors flex items-center gap-1`}>
                        <span>{spec.name}</span>
                        {isPrereqUnmet && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8.5px] font-mono uppercase bg-rose-950/90 border border-rose-800 text-rose-300">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Missing</span>
                          </span>
                        )}
                      </span>
                    </FolioTooltip>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      isSpecLocked ? 'bg-slate-800 text-slate-500' : isSpecAbility ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-200' : (isMetaSkill || isInvocation ? 'bg-purple-950 border border-purple-500/50 text-purple-200' : 'bg-amber-950 border border-amber-500/50 text-amber-200')
                    }`}>
                      {isSpecLocked ? 0 : specTotal}
                    </span>
                    <button
                      type="button"
                      disabled={isSpecLocked}
                      onClick={() => {
                        if (isSpecLocked) return;
                        openDiceRoller({
                          label: isSpecAbility
                            ? `${spec.name} (Special Ability) Check`
                            : `${skill.name}: ${spec.name} (${isInvocation ? 'Invocation' : isMetaSkill ? 'Evocation' : 'Specialization'})`,
                          baseModifier: specTotal,
                          expression: `2d10${specTotal !== 0 ? (specTotal > 0 ? `+${specTotal}` : `${specTotal}`) : ''}`,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Operative',
                          personaId: characterData['character-doc-id'] || characterData.id,
                          autoRoll: true
                        });
                      }}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-0.5 cursor-pointer ${
                        isSpecLocked
                          ? 'opacity-40 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-600'
                          : isSpecAbility
                          ? 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300'
                          : isMetaSkill || isInvocation
                          ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300'
                          : 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300'
                      }`}
                      title={isSpecLocked ? lockMessage : `Roll ${spec.name} Check (2d10 + ${specTotal})`}
                    >
                      <Dices size={11} />
                      <span>Roll</span>
                    </button>
                    {!isSheetLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSpecOrInv(spec)}
                        className="text-red-400/60 hover:text-red-400 font-bold p-1 text-sm shrink-0 cursor-pointer"
                        title={isSpecAbility ? "Delete Special Ability" : isInvocation ? "Delete Invocation" : isMetaSkill ? "Delete Evocation" : "Delete Specialization"}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10.5px] font-mono pt-1 border-t border-slate-800/40">
                  <span className="text-slate-400 text-[10px]">Rank:</span>
                  {isSheetLocked ? (
                    <span className="font-mono font-bold text-slate-200 px-1">
                      {specRank}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      disabled={isDisciplineLocked}
                      value={specRank}
                      onChange={(e) => !isDisciplineLocked && handleUpdateSpecOrInv(spec, 'rank', e.target.value)}
                      className={`w-12 text-center bg-slate-950 border ${
                        isDisciplineLocked ? 'border-slate-800 text-slate-600 cursor-not-allowed' : (isMetaSkill || isInvocation ? 'border-purple-800/60 text-purple-200' : 'border-amber-800/60 text-amber-200')
                      } rounded py-0.5 outline-none font-bold`}
                    />
                  )}
                  <span className={`text-[10px] ${isMetaSkill || isInvocation ? 'text-purple-400/80' : 'text-amber-400/80'}`}>
                    +{specRank} to Base
                  </span>
                  {specMod !== 0 && (
                    <span className="text-slate-400 text-[10px] ml-auto">
                      Mod: {specMod}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderSubcategoryBlock = (groupTitle, skillsList, colorClass, borderClass, key, catKey) => {
    if (skillsList.length === 0) return null;

    // Metadata for Metafocus discipline blocks
    const isMetaCategory = catKey === 'meta';
    const isDiscipline = isMetaCategory && groupTitle !== 'General';
    const discKey = isDiscipline ? groupTitle.toLowerCase() : null;
    const isDisciplineUnlocked = discKey ? unlockedDisciplines.has(discKey) : (groupTitle === 'General' ? hasAnyAwakened : true);

    const discIcons = {
      dimension: '🌀',
      energy: '⚡',
      entropy: '⏳',
      illusion: '🎭',
      matter: '🧱',
      mental: '🧠'
    };

    return (
      <div key={key} className={`bg-slate-900/60 border ${borderClass} rounded-lg p-3 sm:p-4 space-y-3 shadow-lg backdrop-blur-sm`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            {isDiscipline && (
              <span className="text-base">{discIcons[discKey] || '🔮'}</span>
            )}
            <h4 className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>
              {isDiscipline ? `Discipline: ${groupTitle}` : (groupTitle || 'General')}
            </h4>
            {isMetaCategory && (
              <span
                className={`px-2 py-0.2 rounded text-[9.5px] font-mono font-bold uppercase border ${
                  isDisciplineUnlocked
                    ? 'bg-purple-950/80 border-purple-500/60 text-purple-200'
                    : 'bg-amber-950/70 border-amber-900/60 text-amber-300'
                }`}
              >
                {isDisciplineUnlocked ? '✨ Awakened' : '🔒 Locked'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isMetaCategory && onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal('invocations', `${groupTitle} Invocations (Omnicortex)`, 'invocations', isDiscipline ? groupTitle : null)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-800 hover:border-purple-600 text-purple-300 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                title={`Browse Omnicortex Invocations for ${groupTitle}`}
              >
                <Zap size={10} className="text-purple-400" />
                <span>+ Invocations</span>
              </button>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              {skillsList.length} {skillsList.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>
        </div>

        {/* Column Table Header (Desktop Only) */}
        <div className="folio-skill-row-desktop grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 border-b border-slate-800/60 pb-1">
          <span className="col-span-4">Skill / Specialization</span>
          <span className="col-span-2 text-center">Rank</span>
          <span className="col-span-3 text-center">Attr / Base</span>
          <span className="col-span-1 text-center">Mod</span>
          <span className="col-span-2 text-center">Total</span>
        </div>

        {/* Full Skills List */}
        <div className="space-y-2">
          {skillsList.map(renderSkillRow)}
        </div>
      </div>
    );
  };

  const renderCategorySection = (cat) => {
    const groupList = DEFAULT_SKILLS[cat.key] || [];
    const q = searchQuery.trim().toLowerCase();

    // Track standard subcategory titles for this category
    const standardSubcategoryTitles = new Set(groupList.map(g => g.title || 'General'));
    if (cat.key === 'meta') {
      ['Disciplines', 'Dimension', 'Energy', 'Entropy', 'Illusion', 'Matter', 'Mental'].forEach(t => standardSubcategoryTitles.add(t));
    }

    // Filter groups and skills by search query, incorporating custom skills in their subcategory
    const filteredGroups = groupList.map((g) => {
      const subTitle = g.title || 'General';
      let customSubSkills = [];
      if (cat.key === 'meta' && subTitle === 'Disciplines') {
        const metaDisciplineKeys = ['Disciplines', 'Dimension', 'Energy', 'Entropy', 'Illusion', 'Matter', 'Mental'];
        metaDisciplineKeys.forEach(dk => {
          const skillsList = customSkillsBySubcategory[`meta|${dk}`] || [];
          customSubSkills.push(...skillsList);
        });
      } else {
        const mapKey = `${cat.key}|${subTitle}`;
        customSubSkills = customSkillsBySubcategory[mapKey] || [];
      }
      const combinedSkills = [...g.skills, ...customSubSkills];

      const matchingSkills = combinedSkills.filter((s) => {
        const sRank = getSkillRank(s);
        if (showTrainedOnly && sRank === 0) return false;
        if (!q) return true;
        const specMatches = (specializationsByBaseSkill[s.id] || []).some(spec => spec && spec.name && spec.name.toLowerCase().includes(q));
        return s.name.toLowerCase().includes(q) || (g.title && g.title.toLowerCase().includes(q)) || specMatches;
      });

      return { ...g, skills: matchingSkills };
    }).filter((g) => g.skills.length > 0);

    // Find any custom skills for this category whose subcategory doesn't match standard subcategory titles
    const unmappedCustomSkills = [];
    Object.keys(customSkillsBySubcategory).forEach((mapKey) => {
      const [grp, sub] = mapKey.split('|');
      if (grp === cat.key && !standardSubcategoryTitles.has(sub)) {
        customSkillsBySubcategory[mapKey].forEach((s) => {
          const sRank = getSkillRank(s);
          if (showTrainedOnly && sRank === 0) return;
          if (!q || s.name.toLowerCase().includes(q)) {
            unmappedCustomSkills.push(s);
          }
        });
      }
    });

    const totalSkillCount = filteredGroups.reduce((acc, g) => acc + g.skills.length, 0) + unmappedCustomSkills.length;

    if (totalSkillCount === 0 && q) return null;

    const unmappedBlockTitle = cat.key === 'meta' ? 'Special Abilities' : `Custom ${cat.title}`;
    // Collapsed by default; auto-expand if searching and matching
    const isExpanded = Boolean(expandedCategories[cat.key] || (q.length > 0 && totalSkillCount > 0));

    return (
      <div key={cat.key} className={`rounded-xl border ${cat.border} bg-slate-950/70 overflow-hidden shadow-lg transition-all`}>
        {/* Category Accordion Header Banner */}
        <div
          onClick={() => toggleCategory(cat.key)}
          className={`flex justify-between items-center px-4 py-3 bg-slate-900/80 hover:bg-slate-900 border-l-4 ${cat.accentBorder} ${
            isExpanded ? 'border-b border-slate-800' : ''
          } cursor-pointer transition-colors select-none`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">{cat.icon || '❖'}</span>
            <h3 className={`text-xs font-bold uppercase tracking-widest ${cat.color}`}>
              {cat.title}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-bold">
              {totalSkillCount} {totalSkillCount === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            <div className="p-1 rounded text-slate-400 hover:text-white transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Subcategory Blocks (rendered only when accordion is open) */}
        {isExpanded && (
          <div className="p-3 sm:p-4 space-y-4">
            {cat.key === 'mental' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {/* Left Column: General & Knowledges */}
                <div className="space-y-4">
                  {filteredGroups
                    .filter((g) => (g.title || 'General') === 'General' || (g.title || '') === 'Knowledges')
                    .map((group, idx) =>
                      renderSubcategoryBlock(group.title, group.skills, cat.color, cat.border, `${cat.key}-left-${idx}`, cat.key)
                    )}
                </div>

                {/* Right Column: Vocations & Custom */}
                <div className="space-y-4">
                  {filteredGroups
                    .filter((g) => (g.title || '') !== 'General' && (g.title || '') !== 'Knowledges')
                    .map((group, idx) =>
                      renderSubcategoryBlock(group.title, group.skills, cat.color, cat.border, `${cat.key}-right-${idx}`, cat.key)
                    )}
                  {unmappedCustomSkills.length > 0 &&
                    renderSubcategoryBlock(unmappedBlockTitle, unmappedCustomSkills, 'text-amber-400', 'border-amber-900/50', `${cat.key}-custom`, cat.key)
                  }
                </div>
              </div>
            ) : (
              <div className={filteredGroups.length > 1 || unmappedCustomSkills.length > 0 ? "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" : "space-y-4"}>
                {filteredGroups.map((group, idx) =>
                  renderSubcategoryBlock(group.title, group.skills, cat.color, cat.border, `${cat.key}-${idx}`, cat.key)
                )}
                {unmappedCustomSkills.length > 0 &&
                  renderSubcategoryBlock(unmappedBlockTitle, unmappedCustomSkills, 'text-amber-400', 'border-amber-900/50', `${cat.key}-custom`, cat.key)
                }
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: GRANTED SKILLS PANE (Grouped by Source: Species, Occupation, Origin, Faction, Features)
  // ----------------------------------------------------------------------------------
  const renderGrantedSkillsPane = () => {
    const pillars = [
      {
        id: 'species',
        label: 'Species Lineage Skills',
        icon: '🧬',
        name: identityPoolsBreakdown.species.name,
        allocated: identityPoolsBreakdown.species.allocated,
        skills: identityPoolsBreakdown.species.skills,
        color: 'text-cyan-400',
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-950/20',
        badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
      },
      {
        id: 'occupation',
        label: 'Career & Professional Skills',
        icon: '💼',
        name: identityPoolsBreakdown.occupation.name,
        allocated: identityPoolsBreakdown.occupation.allocated,
        skills: identityPoolsBreakdown.occupation.skills,
        color: 'text-sky-400',
        border: 'border-sky-500/40',
        bg: 'bg-sky-950/20',
        badgeBg: 'bg-sky-950 text-sky-300 border-sky-500/50'
      },
      {
        id: 'origin',
        label: 'Homeworld & Society Skills',
        icon: '🌍',
        name: identityPoolsBreakdown.origin.name,
        allocated: identityPoolsBreakdown.origin.allocated,
        skills: identityPoolsBreakdown.origin.skills,
        color: 'text-emerald-400',
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/20',
        badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
      },
      {
        id: 'faction',
        label: 'Faction Allegiance Skills',
        icon: '🏛️',
        name: identityPoolsBreakdown.faction.name,
        allocated: identityPoolsBreakdown.faction.allocated,
        skills: identityPoolsBreakdown.faction.skills,
        color: 'text-purple-400',
        border: 'border-purple-500/40',
        bg: 'bg-purple-950/20',
        badgeBg: 'bg-purple-950 text-purple-300 border-purple-500/50'
      }
    ];

    const featureModifiers = computedModifiers?.activeSkillModifiers || [];

    return (
      <div className="space-y-4">
        {/* Overview Banner */}
        <div className="p-3.5 bg-slate-900/80 border border-cyan-900/60 rounded-xl space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Identity Pillar Granted Skills & Source Packages
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Operative skills funded and granted through your Species lineage, Occupational career, Origin environment, Faction allegiance, and active cybernetics or traits.
          </p>
        </div>

        {/* Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map(p => {
            const skillEntries = Object.entries(p.skills || {});
            return (
              <div key={p.id} className={`rounded-xl border ${p.border} ${p.bg} p-3.5 space-y-3 shadow-md backdrop-blur-sm`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.icon}</span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">{p.label}</span>
                      <h4 className={`text-xs font-bold uppercase tracking-wide ${p.color}`}>
                        {p.name || 'None Selected'}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${p.badgeBg}`}>
                    {p.allocated} SP Allocated
                  </span>
                </div>

                {skillEntries.length > 0 ? (
                  <div className="space-y-1.5">
                    {skillEntries.map(([sName, sVal]) => {
                      const rank = typeof sVal === 'object' ? (sVal.rank || sVal.value || 1) : parseInt(sVal, 10) || 1;
                      const cleanName = sName.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const matchingSkill = allAvailableSkills.find(s => {
                        const sn = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const sid = s.id.replace(/^[a-z]+-/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        return sn === cleanName || sid === cleanName;
                      });
                      const totalScore = matchingSkill ? getSkillTotal(matchingSkill) : getSkillTotal(sName);
                      return (
                        <div key={sName} className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-200 font-semibold truncate">{sName}</span>
                            <span className="text-[10px] text-cyan-400 font-bold">+{rank} Rank</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300 font-bold text-[11px]">
                              Score: {totalScore}
                            </span>
                            <button
                              type="button"
                              onClick={() => openDiceRoller({
                                label: `${sName} (Granted Check)`,
                                baseModifier: totalScore,
                                expression: `2d10${totalScore !== 0 ? (totalScore > 0 ? `+${totalScore}` : `${totalScore}`) : ''}`,
                                rollMode: 'normal',
                                characterName: characterData['char-name'] || 'Operative',
                                personaId: characterData['character-doc-id'] || characterData.id,
                                autoRoll: true
                              })}
                              className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Roll ${sName} Check`}
                            >
                              <Dices size={10} /> Roll
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-slate-500 italic py-2 text-center">
                    No skills currently allocated in this package.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature & Trait Active Modifiers Section */}
        {featureModifiers.length > 0 && (
          <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-3.5 space-y-3 shadow-md backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Features, Traits & Cybernetics</span>
                <h4 className="text-xs font-bold uppercase tracking-wide text-purple-300">
                  Active Skill Adjustments ({featureModifiers.length})
                </h4>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {featureModifiers.map((mod, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-purple-900/50 px-2.5 py-1.5 rounded-lg text-xs font-mono space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 truncate">{mod.target}</span>
                    <span className={`font-bold ${mod.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {mod.value >= 0 ? `+${mod.value}` : mod.value}
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-400/90 truncate">
                    Source: {mod.source} {mod.sourceType ? `(${mod.sourceType})` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------------------------------------
  // RENDER: MODIFIERS PANE (SituationalModifiersPanel & Gear/Trait Skill Modifiers)
  // ----------------------------------------------------------------------------------
  const renderModifiersPane = () => {
    return (
      <div className="space-y-4">
        {/* Situational & Conditional Skill Check Modifiers Panel */}
        <SituationalModifiersPanel
          characterData={characterData}
          updateField={updateField}
        />

        {/* Possessed Equipment & Active Modifiers Details */}
        {(computedModifiers?.activeEquipmentModifiers?.length > 0 || computedModifiers?.activeSkillModifiers?.length > 0) && (
          <div className="bg-slate-900/80 border border-amber-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
                <span>🎒</span> Possessed Gear &amp; Equipment Skill Adjustments
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {computedModifiers?.activeEquipmentModifiers?.map((eq, i) => (
                <div key={i} className="bg-slate-950/70 border border-slate-800 p-2 rounded flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-bold block">{eq.target}</span>
                    <span className="text-[10px] text-amber-400/90">{eq.source || 'Equipped Item'}</span>
                  </div>
                  <span className="text-emerald-300 font-bold">+{eq.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-4 pb-20">
      {/* Vertical 3-Pane Navigation Rail (Skills Catalog | Granted Skills | Modifiers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => setActivePane('skills')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activePane === 'skills'
              ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] text-white'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📚</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider font-mono">Skills Catalog</div>
              <div className="text-[10px] text-slate-400">Physical, Mental, Social, Combat, Meta</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            activePane === 'skills' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50' : 'bg-slate-950 text-slate-500'
          }`}>
            {categoryCounts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePane('granted')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activePane === 'granted'
              ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✨</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider font-mono">Granted Skills</div>
              <div className="text-[10px] text-slate-400">Identity Pillars &amp; Source Grants</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            activePane === 'granted' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50' : 'bg-slate-950 text-slate-500'
          }`}>
            {totalGrantedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePane('modifiers')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activePane === 'modifiers'
              ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-white'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚡</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider font-mono">Skill Modifiers</div>
              <div className="text-[10px] text-slate-400">Situational, Tactical &amp; Gear</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            activePane === 'modifiers' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50' : 'bg-slate-950 text-slate-500'
          }`}>
            {totalModifiersCount}
          </span>
        </button>
      </div>

      {/* Pane Content Rendering */}
      {activePane === 'granted' && renderGrantedSkillsPane()}
      {activePane === 'modifiers' && renderModifiersPane()}

      {activePane === 'skills' && (
        <div className="space-y-4">
          {/* Header Toolbar & Search Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-900/60 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Operative Skill Categories &amp; Specializations
              </h3>
              <p className="text-[11px] text-slate-400">
                Skills max rank 20. Linked specializations max rank 10. Click any category header to expand or collapse.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Trained Only Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowTrainedOnly(prev => !prev)}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  showTrainedOnly
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-700'
                }`}
                title="Filter to only show skills with trained ranks (> 0)"
              >
                <span>🎯</span>
                <span className="hidden sm:inline">{showTrainedOnly ? 'Trained Only' : 'All Skills'}</span>
                <span className="sm:hidden">{showTrainedOnly ? 'Trained' : 'All'}</span>
              </button>

              {/* Consolidated Expand / Collapse All Trigger */}
              <button
                type="button"
                onClick={toggleAllCategories}
                className="px-3 py-1.5 rounded text-xs font-mono font-bold uppercase bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                title={areAllCategoriesExpanded ? 'Collapse all skill categories' : 'Expand all skill categories'}
              >
                {areAllCategoriesExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Expand All</span>
                  </>
                )}
              </button>

              {/* Add Skill Button */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSelectorModal) {
                    onOpenSelectorModal('skills', 'Skills Database', 'skills');
                  } else if (onOpenAddSkillModal) {
                    onOpenAddSkillModal('skill', allAvailableSkills);
                  }
                }}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0 flex items-center gap-1.5 cursor-pointer"
                title="Open Skills Catalog (Table / Cards) with build option"
              >
                <span>✨</span>
                <span>+ Add Skill</span>
              </button>
            </div>
          </div>

          {/* Main Skills Categories Accordions */}
          <div className="space-y-4">
            {[...LEFT_COLUMN_CONFIG, ...RIGHT_COLUMN_CONFIG].map(renderCategorySection)}
          </div>

          {/* Empty Search / Filter State */}
          {categoryCounts.all === 0 && (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-slate-400">
                {showTrainedOnly ? (
                  <>
                    No trained skills (&gt; 0 rank) found.
                  </>
                ) : (
                  'No skills found.'
                )}
              </p>
              {showTrainedOnly && (
                <button
                  type="button"
                  onClick={() => setShowTrainedOnly(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
                >
                  Switch to All Skills Catalog
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillsTab);


