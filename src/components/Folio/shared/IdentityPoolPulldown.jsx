import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, Plus, Minus, X, Search, Sparkles, Layers, Info, Shield, Dna, BookOpen, Filter } from 'lucide-react';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { DEFAULT_FEATURES, FEATURE_CATEGORIES } from '../../../data/featuresData';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';

const PRIMARY_ATTRIBUTES = [
  { id: 'attr-strength', name: 'Strength', short: 'STR', category: 'Physical' },
  { id: 'attr-agility', name: 'Agility', short: 'AGI', category: 'Physical' },
  { id: 'attr-stamina', name: 'Stamina', short: 'STA', category: 'Physical' },
  { id: 'attr-intellect', name: 'Intellect', short: 'INT', category: 'Mental' },
  { id: 'attr-wisdom', name: 'Wisdom', short: 'WIS', category: 'Mental' },
  { id: 'attr-charisma', name: 'Charisma', short: 'CHA', category: 'Mental' }
];

const SUB_ATTRIBUTES = [
  { id: 'attr-might', name: 'Might', short: 'MIG', category: 'Physical', primaryId: 'attr-strength' },
  { id: 'attr-reflex', name: 'Reflex', short: 'REF', category: 'Physical', primaryId: 'attr-agility' },
  { id: 'attr-fortitude', name: 'Fortitude', short: 'FOR', category: 'Physical', primaryId: 'attr-stamina' },
  { id: 'attr-logic', name: 'Reason / Logic', short: 'LOG', category: 'Mental', primaryId: 'attr-intellect' },
  { id: 'attr-will', name: 'Willpower', short: 'WIL', category: 'Mental', primaryId: 'attr-wisdom' },
  { id: 'attr-etiquette', name: 'Etiquette', short: 'ETI', category: 'Mental', primaryId: 'attr-charisma' }
];

export const normalizeTraitName = (trait) => {
  if (!trait) return '';
  const raw = typeof trait === 'object' ? (trait.name || trait.title || trait.id || '') : String(trait);
  const cleaned = raw.replace(/^(trait|feature|hindrance|disadvantage)-/i, '').replace(/[-_]/g, ' ').trim();
  return cleaned.replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Intelligent Skill Pattern Expander: Expands group patterns (e.g. "Vocations", "Any Social Skills",
 * "Disciplines (Attune or any known Metafocus Skill)", "Stealth and one Social or Vocation Skill")
 * into the full list of selectable individual skills.
 */
export const expandSkillGroupPatterns = (recommendedSkills = [], allSkills = ALL_CANONICAL_SKILLS) => {
  const catalog = allSkills?.length > 0 ? allSkills : ALL_CANONICAL_SKILLS;
  
  const nameToSkillMap = new Map();
  const groupToSkillsMap = new Map();

  const registerGroupSkill = (grpKey, skill) => {
    const key = grpKey.toLowerCase().trim();
    if (!groupToSkillsMap.has(key)) groupToSkillsMap.set(key, []);
    groupToSkillsMap.get(key).push(skill);
  };

  catalog.forEach(s => {
    const sName = (s.name || s.title || '').trim();
    if (sName) {
      nameToSkillMap.set(sName.toLowerCase(), s);
    }
    const sId = (s.id || '').toLowerCase();
    if (sId) {
      nameToSkillMap.set(sId, s);
    }

    const mainGroup = (s.group || '').toLowerCase();
    const sub = (s.subcategory || s.categoryLabel || '').toLowerCase();
    const sIdLower = sId;

    if (mainGroup) registerGroupSkill(mainGroup, s);
    if (sub.includes('vocation') || sIdLower.includes('vocation') || (s.type && s.type.toLowerCase().includes('vocation'))) {
      registerGroupSkill('vocation', s);
    }
    if (sub.includes('knowledge') || sIdLower.includes('knowledge') || (s.type && s.type.toLowerCase().includes('knowledge'))) {
      registerGroupSkill('knowledge', s);
    }
    if (sub.includes('expression') || sIdLower.includes('expression')) registerGroupSkill('expression', s);
    if (sub.includes('manipulation') || sIdLower.includes('manipulation')) registerGroupSkill('manipulation', s);
    if (mainGroup === 'social' || sub.includes('social')) registerGroupSkill('social', s);
    if (mainGroup === 'combat' || sub.includes('combat') || sub.includes('archaic') || sub.includes('modern') || sub.includes('advanced')) {
      registerGroupSkill('combat', s);
    }
    if (mainGroup === 'physical' || sub.includes('physical')) registerGroupSkill('physical', s);
    if (mainGroup === 'meta' || sub.includes('metafocus') || sub.includes('discipline')) registerGroupSkill('meta', s);

    if (['science', 'technology', 'physics', 'computers', 'academics', 'medicine'].includes(sName.toLowerCase())) {
      registerGroupSkill('science_tech', s);
    }
  });

  const rawList = Array.isArray(recommendedSkills) ? recommendedSkills : [recommendedSkills];
  const expandedItemsMap = new Map();
  const packageNotes = [];
  const groupFiltersFound = new Set(['All']);

  rawList.forEach(raw => {
    if (!raw) return;
    const str = typeof raw === 'object' ? (raw.name || raw.title || raw.skill || raw.id || '') : String(raw);
    const cleanStr = str.trim();
    if (!cleanStr) return;

    const lower = cleanStr.toLowerCase();

    // 1. Direct Skill Match
    let directSkill = nameToSkillMap.get(lower);
    if (!directSkill) {
      const match = cleanStr.match(/^([^(]+)\(([^)]+)\)$/);
      if (match) {
        const inner = match[2].trim().toLowerCase();
        if (nameToSkillMap.has(inner)) {
          directSkill = nameToSkillMap.get(inner);
        }
      }
    }

    if (directSkill) {
      const sName = directSkill.name || directSkill.title;
      const grp = directSkill.subcategory || directSkill.group || 'Specific';
      if (!expandedItemsMap.has(sName.toLowerCase())) {
        expandedItemsMap.set(sName.toLowerCase(), {
          ...directSkill,
          name: sName,
          groupLabel: grp,
          sourceTag: 'Specific'
        });
        groupFiltersFound.add('Specific');
      }
      return;
    }

    // 2. Check for Group & Wildcard Expressions
    let matchedGroup = false;

    // Vocations
    if (lower.includes('vocation')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Vocations');
      const vocSkills = groupToSkillsMap.get('vocation') || [];
      vocSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: 'Vocation',
            sourceTag: 'Vocations'
          });
        }
      });
    }

    // Social
    if (lower.includes('social')) {
      matchedGroup = true;
      if (!lower.includes('vocation')) packageNotes.push(cleanStr);
      groupFiltersFound.add('Social');
      const socSkills = groupToSkillsMap.get('social') || [];
      socSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: s.subcategory ? `Social - ${s.subcategory}` : 'Social',
            sourceTag: 'Social'
          });
        }
      });
    }

    // Combat
    if (lower.includes('combat') && !lower.includes('non-combat')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Combat');
      const comSkills = groupToSkillsMap.get('combat') || [];
      comSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: s.subcategory ? `Combat - ${s.subcategory}` : 'Combat',
            sourceTag: 'Combat'
          });
        }
      });
    }

    // Physical
    if (lower.includes('physical') && !lower.includes('non-physical')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Physical');
      const physSkills = groupToSkillsMap.get('physical') || [];
      physSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: 'Physical',
            sourceTag: 'Physical'
          });
        }
      });
    }

    // Knowledges
    if (lower.includes('knowledge') && !lower.includes('(')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Knowledges');
      const knowSkills = groupToSkillsMap.get('knowledge') || [];
      knowSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: 'Knowledge',
            sourceTag: 'Knowledges'
          });
        }
      });
    }

    // Science & Tech
    if (lower.includes('science') || (lower.includes('technology') && lower.includes('skill') && !lower.includes('knowledge (technology)'))) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Science & Tech');
      const sciSkills = groupToSkillsMap.get('science_tech') || [];
      sciSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: 'Science & Tech',
            sourceTag: 'Science & Tech'
          });
        }
      });
    }

    // Metafocus / Disciplines
    if (lower.includes('discipline') || lower.includes('metafocus') || lower.includes('attune')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Metafocus');
      const metaSkills = groupToSkillsMap.get('meta') || [];
      metaSkills.forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: s.discipline ? `Discipline: ${s.discipline}` : (s.subcategory || 'Metafocus'),
            sourceTag: 'Metafocus'
          });
        }
      });
    }

    // Non-Combat
    if (lower.includes('non-combat')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Non-Combat');
      catalog.filter(s => (s.group || '').toLowerCase() !== 'combat').forEach(s => {
        const sName = s.name || s.title;
        if (!expandedItemsMap.has(sName.toLowerCase())) {
          expandedItemsMap.set(sName.toLowerCase(), {
            ...s,
            name: sName,
            groupLabel: s.subcategory || s.group || 'Non-Combat',
            sourceTag: 'Non-Combat'
          });
        }
      });
    }

    // Scan for any specific named skill within compound sentences
    catalog.forEach(s => {
      const sName = (s.name || s.title || '').toLowerCase();
      if (sName.length >= 4 && (new RegExp(`\\b${sName}\\b`, 'i')).test(cleanStr)) {
        if (!expandedItemsMap.has(sName)) {
          expandedItemsMap.set(sName, {
            ...s,
            name: s.name || s.title,
            groupLabel: s.subcategory || s.group || 'Specific Skill',
            sourceTag: 'Specific'
          });
          groupFiltersFound.add('Specific');
        }
      }
    });

    const CATEGORY_NAMES = new Set([
      'knowledge', 'knowledges', 'vocation', 'vocations', 'discipline', 'disciplines', 'metafocus',
      'skill', 'skills', 'general', 'physical', 'mental', 'social', 'combat', 'meta'
    ]);
    if (!matchedGroup && expandedItemsMap.size === 0 && !CATEGORY_NAMES.has(lower)) {
      expandedItemsMap.set(cleanStr.toLowerCase(), {
        id: `skill_${cleanStr.toLowerCase().replace(/\s+/g, '_')}`,
        name: cleanStr,
        group: 'Skill',
        baseAttr: 'attr-intellect',
        groupLabel: 'Custom',
        sourceTag: 'Custom'
      });
    }
  });

  return {
    items: Array.from(expandedItemsMap.values()),
    packageNotes: Array.from(new Set(packageNotes)),
    groupFilters: Array.from(groupFiltersFound)
  };
};

/**
 * Intelligent Feature Pattern Expander: Expands group lines (e.g. "Take Features from any Acute Sense Line",
 * "Combat Features", "Ability Features") into the full list of candidate features.
 */
export const expandFeatureGroupPatterns = (recommendedFeatures = [], allFeatures = DEFAULT_FEATURES) => {
  const catalog = allFeatures?.length > 0 ? allFeatures : DEFAULT_FEATURES;

  const nameToFeatMap = new Map();
  const catToFeatsMap = new Map();

  catalog.forEach(f => {
    const fName = (f.name || f.title || '').trim();
    if (fName) {
      nameToFeatMap.set(fName.toLowerCase(), f);
      nameToFeatMap.set(normalizeTraitName(fName).toLowerCase(), f);
    }
    const fId = (f.id || '').toLowerCase();
    if (fId) {
      nameToFeatMap.set(fId, f);
    }
    const cat = (f.category || f.type || 'General').trim();
    const catLower = cat.toLowerCase();
    if (!catToFeatsMap.has(catLower)) catToFeatsMap.set(catLower, []);
    catToFeatsMap.get(catLower).push(f);
  });

  const rawList = Array.isArray(recommendedFeatures) ? recommendedFeatures : [recommendedFeatures];
  const expandedItemsMap = new Map();
  const packageNotes = [];
  const groupFiltersFound = new Set(['All']);

  rawList.forEach(raw => {
    if (!raw) return;
    const str = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    const cleanStr = str.trim();
    if (!cleanStr) return;

    const lower = cleanStr.toLowerCase();

    // 1. Direct Feature Match
    let directFeat = nameToFeatMap.get(lower) || nameToFeatMap.get(normalizeTraitName(cleanStr).toLowerCase());
    if (directFeat) {
      const fName = directFeat.name || directFeat.title;
      if (!expandedItemsMap.has(fName.toLowerCase())) {
        expandedItemsMap.set(fName.toLowerCase(), {
          ...directFeat,
          name: fName,
          groupLabel: directFeat.category || 'Specific Feature',
          sourceTag: directFeat.category || 'Specific'
        });
        groupFiltersFound.add(directFeat.category || 'Specific');
      }
      return;
    }

    // 2. Group / Wildcard / Line Expressions
    let matchedGroup = false;

    // Acute Sense Line
    if (lower.includes('acute') || lower.includes('senses line') || lower.includes('sense line')) {
      matchedGroup = true;
      packageNotes.push(cleanStr);
      groupFiltersFound.add('Acute Senses');
      catalog.filter(f => {
        const name = (f.name || f.title || '').toLowerCase();
        const desc = (f.description || f.mechanic || '').toLowerCase();
        return name.includes('acute') || desc.includes('acute sense');
      }).forEach(f => {
        const fName = f.name || f.title;
        if (!expandedItemsMap.has(fName.toLowerCase())) {
          expandedItemsMap.set(fName.toLowerCase(), {
            ...f,
            name: fName,
            groupLabel: 'Acute Sense Line',
            sourceTag: 'Acute Senses'
          });
        }
      });
    }

    // Category matches
    FEATURE_CATEGORIES.forEach(cat => {
      const catLower = cat.toLowerCase();
      if (lower === catLower || lower.includes(`${catLower} feature`) || lower.includes(`${catLower} features`)) {
        matchedGroup = true;
        packageNotes.push(cleanStr);
        groupFiltersFound.add(cat);
        const featsInCat = catToFeatsMap.get(catLower) || [];
        featsInCat.forEach(f => {
          const fName = f.name || f.title;
          if (!expandedItemsMap.has(fName.toLowerCase())) {
            expandedItemsMap.set(fName.toLowerCase(), {
              ...f,
              name: fName,
              groupLabel: cat,
              sourceTag: cat
            });
          }
        });
      }
    });

    if (!matchedGroup && expandedItemsMap.size === 0) {
      expandedItemsMap.set(cleanStr.toLowerCase(), {
        id: `feat_${cleanStr.toLowerCase().replace(/\s+/g, '_')}`,
        name: cleanStr,
        category: 'Feature',
        groupLabel: 'Custom',
        sourceTag: 'Custom'
      });
    }
  });

  return {
    items: Array.from(expandedItemsMap.values()),
    packageNotes: Array.from(new Set(packageNotes)),
    groupFilters: Array.from(groupFiltersFound)
  };
};

/**
 * Intelligent Trait Pattern Expander: Expands group expressions into specific trait lists.
 */
export const expandTraitGroupPatterns = (recommendedTraits = [], allTraits = ALL_CANONICAL_TRAITS) => {
  const catalog = (allTraits && allTraits.length >= ALL_CANONICAL_TRAITS.length)
    ? allTraits
    : Array.from(new Map([...ALL_CANONICAL_TRAITS, ...(allTraits || [])].map(t => [t.id || t.name, t])).values());
  const nameToTraitMap = new Map();
  catalog.forEach(t => {
    const tName = (t.name || t.title || '').trim();
    if (tName) {
      nameToTraitMap.set(tName.toLowerCase(), t);
      nameToTraitMap.set(normalizeTraitName(tName).toLowerCase(), t);
    }
    const tId = (t.id || '').toLowerCase();
    if (tId) {
      nameToTraitMap.set(tId, t);
    }
  });

  const rawList = Array.isArray(recommendedTraits) ? recommendedTraits : [recommendedTraits];
  const expandedItemsMap = new Map();
  const packageNotes = [];
  const groupFiltersFound = new Set(['All']);

  rawList.forEach(raw => {
    if (!raw) return;
    const str = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
    const cleanStr = str.trim();
    if (!cleanStr) return;

    const lower = cleanStr.toLowerCase();
    const cleanNorm = normalizeTraitName(cleanStr).toLowerCase();

    let directTrait = nameToTraitMap.get(lower) || nameToTraitMap.get(cleanNorm);
    if (directTrait) {
      const tName = directTrait.name || directTrait.title;
      if (!expandedItemsMap.has(tName.toLowerCase())) {
        expandedItemsMap.set(tName.toLowerCase(), {
          ...directTrait,
          name: tName,
          groupLabel: directTrait.classification || directTrait.trait_tier || 'Trait',
          sourceTag: directTrait.classification || 'Specific'
        });
        groupFiltersFound.add(directTrait.classification || directTrait.trait_tier || 'Specific');
      }
      return;
    }

    // Check group expressions (e.g. "Physical Traits", "Mental Traits", "Social Traits")
    let matchedGroup = false;
    ['physical', 'mental', 'social', 'biological', 'combat'].forEach(cls => {
      if (lower.includes(`${cls} trait`) || lower.includes(`${cls} traits`) || lower === cls) {
        matchedGroup = true;
        packageNotes.push(cleanStr);
        const tag = cls.charAt(0).toUpperCase() + cls.slice(1);
        groupFiltersFound.add(tag);
        catalog.filter(t => (t.classification || t.type || '').toLowerCase() === cls).forEach(t => {
          const tName = t.name || t.title;
          if (!expandedItemsMap.has(tName.toLowerCase())) {
            expandedItemsMap.set(tName.toLowerCase(), {
              ...t,
              name: tName,
              groupLabel: tag,
              sourceTag: tag
            });
          }
        });
      }
    });

    if (!matchedGroup && !expandedItemsMap.has(cleanNorm) && !expandedItemsMap.has(lower)) {
      expandedItemsMap.set(cleanNorm, {
        id: `trait_${cleanNorm.replace(/\s+/g, '_')}`,
        name: normalizeTraitName(cleanStr) || cleanStr,
        category: 'traits',
        groupLabel: 'Custom',
        sourceTag: 'Custom'
      });
    }
  });

  return {
    items: Array.from(expandedItemsMap.values()),
    packageNotes: Array.from(new Set(packageNotes)),
    groupFilters: Array.from(groupFiltersFound)
  };
};

const THEME_STYLES = {
  cyan: {
    border: 'border-cyan-500/40',
    borderFocus: 'border-cyan-400',
    bg: 'bg-cyan-950/20',
    bgActive: 'bg-cyan-950/40',
    text: 'text-cyan-300',
    textMuted: 'text-cyan-400/80',
    badge: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
    btn: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]',
    tag: 'bg-cyan-950 border-cyan-500/60 text-cyan-200'
  },
  amber: {
    border: 'border-amber-500/40',
    borderFocus: 'border-amber-400',
    bg: 'bg-amber-950/20',
    bgActive: 'bg-amber-950/40',
    text: 'text-amber-300',
    textMuted: 'text-amber-400/80',
    badge: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
    btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    tag: 'bg-amber-950 border-amber-500/60 text-amber-200'
  },
  emerald: {
    border: 'border-emerald-500/40',
    borderFocus: 'border-emerald-400',
    bg: 'bg-emerald-950/20',
    bgActive: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    textMuted: 'text-emerald-400/80',
    badge: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    tag: 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
  },
  purple: {
    border: 'border-purple-500/40',
    borderFocus: 'border-purple-400',
    bg: 'bg-purple-950/20',
    bgActive: 'bg-purple-950/40',
    text: 'text-purple-300',
    textMuted: 'text-purple-400/80',
    badge: 'bg-purple-950/80 border-purple-500/50 text-purple-300',
    btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    tag: 'bg-purple-950 border-purple-500/60 text-purple-200'
  },
  sky: {
    border: 'border-sky-500/40',
    borderFocus: 'border-sky-400',
    bg: 'bg-sky-950/20',
    bgActive: 'bg-sky-950/40',
    text: 'text-sky-300',
    textMuted: 'text-sky-400/80',
    badge: 'bg-sky-950/80 border-sky-500/50 text-sky-300',
    btn: 'bg-sky-600 hover:bg-sky-500 text-white',
    glow: 'shadow-[0_0_12px_rgba(14,165,233,0.2)]',
    tag: 'bg-sky-950 border-sky-500/60 text-sky-200'
  }
};

/**
 * 1. ATTRIBUTE POOL ALLOCATOR PULDOWN
 * Allows allocating bonus attribute points (e.g. +1 to any chosen attribute or restricted physical/mental).
 */
export const AttributePoolPulldown = ({
  title = 'Bonus Attribute Points',
  maxPoints = 1,
  allocatedAttrs = {},
  onAllocate,
  allowedOptions = null, // e.g. ['Physical', 'Mental'] or specific attribute IDs
  colorTheme = 'cyan',
  subtitle = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = THEME_STYLES[colorTheme] || THEME_STYLES.cyan;
  const dropdownRef = useRef(null);

  // Calculate total spent
  const spentPoints = useMemo(() => {
    return Object.values(allocatedAttrs).reduce((acc, val) => acc + (parseInt(val, 10) || 0), 0);
  }, [allocatedAttrs]);

  const pointsRemaining = Math.max(0, maxPoints - spentPoints);

  // Filter available attributes
  const availableAttrs = useMemo(() => {
    let list = PRIMARY_ATTRIBUTES;
    if (allowedOptions) {
      const lowerAllowed = (Array.isArray(allowedOptions) ? allowedOptions : [allowedOptions]).map(o => String(o).toLowerCase());
      if (lowerAllowed.includes('physical') && !lowerAllowed.includes('mental')) {
        list = list.filter(a => a.category === 'Physical');
      } else if (lowerAllowed.includes('mental') && !lowerAllowed.includes('physical')) {
        list = list.filter(a => a.category === 'Mental');
      } else if (lowerAllowed.length > 0) {
        list = list.filter(a => {
          const aName = a.name.toLowerCase();
          const aId = a.id.toLowerCase();
          return lowerAllowed.some(opt => opt.includes(aName) || opt.includes(aId) || aName.includes(opt));
        });
      }
    }
    return list;
  }, [allowedOptions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} className={theme.text} />
          <span>{title}</span>
          {subtitle && <span className="text-slate-500 font-normal">({subtitle})</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            pointsRemaining === 0
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-amber-300'
          }`}>
            {spentPoints} / {maxPoints} Spent ({pointsRemaining} Left)
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-all flex items-center gap-1 cursor-pointer ${
              isOpen ? 'bg-slate-800 border-slate-600 text-white' : `${theme.bg} ${theme.border} ${theme.text} hover:text-white`
            }`}
          >
            <span>{isOpen ? 'Close' : 'Allocate'}</span>
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Selected Attributes Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[26px]">
        {Object.entries(allocatedAttrs).filter(([_, pts]) => pts > 0).length === 0 ? (
          <span className="text-[10px] text-slate-500 italic py-0.5">
            No bonus attribute points assigned yet ({maxPoints} available).
          </span>
        ) : (
          Object.entries(allocatedAttrs).filter(([_, pts]) => pts > 0).map(([attrKey, pts]) => {
            const attrObj = PRIMARY_ATTRIBUTES.find(a => a.id === attrKey || a.name.toLowerCase() === attrKey.toLowerCase());
            const attrLabel = attrObj?.name || attrKey.replace('attr-', '').toUpperCase();
            return (
              <span
                key={attrKey}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold flex items-center gap-1.5 ${theme.tag}`}
              >
                <span>{attrLabel} +{pts}</span>
                <button
                  type="button"
                  onClick={() => onAllocate && onAllocate(attrKey, -1)}
                  className="text-slate-400 hover:text-red-400 font-bold ml-0.5"
                  title="Remove point"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Pulldown Allocation Tray */}
      {isOpen && (
        <div className="p-2.5 bg-slate-950 border border-slate-700 rounded-lg space-y-2 shadow-2xl animate-in fade-in-50 duration-100 mt-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
            <span>Select Attribute to Increase:</span>
            <span className={pointsRemaining > 0 ? theme.text : 'text-slate-500'}>
              {pointsRemaining > 0 ? `${pointsRemaining} Points Available` : 'Pool Fully Allocated'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {availableAttrs.map(attr => {
              const currentPts = allocatedAttrs[attr.id] || allocatedAttrs[attr.name] || 0;
              const canAdd = pointsRemaining > 0;
              const canSub = currentPts > 0;

              return (
                <div
                  key={attr.id}
                  className={`p-1.5 rounded border flex items-center justify-between text-xs transition-colors ${
                    currentPts > 0
                      ? `${theme.bgActive} ${theme.border} text-white font-bold`
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="truncate mr-1">
                    <span className="font-mono text-[11px] block truncate">{attr.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">{attr.category}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={!canSub}
                      onClick={() => onAllocate && onAllocate(attr.id, -1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                      title="Decrease point"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-4 text-center font-mono font-bold text-xs text-cyan-300">
                      {currentPts}
                    </span>
                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => onAllocate && onAllocate(attr.id, 1)}
                      className={`w-5 h-5 rounded disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs cursor-pointer ${
                        canAdd ? theme.btn : 'bg-slate-800 text-slate-500'
                      }`}
                      title="Add point"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 2. FEATURE MULTISELECT PULLDOWN (Dedicated for Features from DEFAULT_FEATURES / dbData.features)
 * Allows multiselecting 1 or 2 (or N) features from recommended choices,
 * or searching global database features, with chip tag removal and capacity limits.
 */
export const FeatureMultiselectPulldown = ({
  title = 'Recommended Features',
  categoryLabel = 'Feature',
  maxSelectable = 2,
  selectedFeatures = [],
  recommendedFeatures = [],
  allFeatures = DEFAULT_FEATURES,
  onToggleFeature,
  onRemoveFeature,
  colorTheme = 'amber',
  subtitle = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('recommended'); // 'recommended' | 'all'
  const [activeGroupFilter, setActiveGroupFilter] = useState('All');
  const theme = THEME_STYLES[colorTheme] || THEME_STYLES.amber;
  const dropdownRef = useRef(null);

  const featCatalog = allFeatures?.length > 0 ? allFeatures : DEFAULT_FEATURES;

  // Normalized selected set
  const selectedNormSet = useMemo(() => {
    const set = new Set();
    selectedFeatures.forEach(f => {
      const name = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
      if (name) {
        set.add(normalizeTraitName(name).toLowerCase());
        set.add(name.toLowerCase());
      }
    });
    return set;
  }, [selectedFeatures]);

  const selectedCount = selectedFeatures.length;
  const isAtCapacity = selectedCount >= maxSelectable;

  // Expand group expressions into full candidate feature list
  const { items: recommendedItems, packageNotes, groupFilters } = useMemo(() => {
    return expandFeatureGroupPatterns(recommendedFeatures, featCatalog);
  }, [recommendedFeatures, featCatalog]);

  // Displayed items in pulldown tray
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = viewMode === 'recommended' ? recommendedItems : featCatalog;

    return sourceList.filter(item => {
      const name = (item.name || item.title || '').toLowerCase();
      const desc = (item.description || item.mechanic || '').toLowerCase();
      const cat = (item.category || item.groupLabel || '').toLowerCase();
      const sourceTag = (item.sourceTag || '').toLowerCase();

      // Group filter check
      if (activeGroupFilter !== 'All') {
        const target = activeGroupFilter.toLowerCase();
        const matchesGroup = cat.includes(target) || sourceTag.includes(target) || (item.category && item.category.toLowerCase() === target);
        if (!matchesGroup) return false;
      }

      if (!query) return true;
      return name.includes(query) || desc.includes(query) || cat.includes(query);
    });
  }, [viewMode, recommendedItems, featCatalog, searchQuery, activeGroupFilter]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} className={theme.text} />
          <span>{title}</span>
          {subtitle && <span className="text-slate-500 font-normal">({subtitle})</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            selectedCount === maxSelectable
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : selectedCount > maxSelectable
                ? 'bg-red-950/80 border-red-500/50 text-red-300'
                : 'bg-slate-900 border-slate-700 text-amber-300'
          }`}>
            {selectedCount} / {maxSelectable} Selected
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-all flex items-center gap-1 cursor-pointer ${
              isOpen ? 'bg-slate-800 border-slate-600 text-white' : `${theme.bg} ${theme.border} ${theme.text} hover:text-white`
            }`}
          >
            <span>{isOpen ? 'Close' : 'Choose'}</span>
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Selected Features Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[26px]">
        {selectedFeatures.length === 0 ? (
          <span className="text-[10px] text-slate-500 italic py-0.5">
            No features selected in this pool yet (Choose up to {maxSelectable}).
          </span>
        ) : (
          selectedFeatures.map((feat) => {
            const fName = typeof feat === 'object' ? (feat.name || feat.title || feat.id) : String(feat);
            const cleanTitle = normalizeTraitName(fName);
            const desc = typeof feat === 'object' ? (feat.description || '') : '';
            return (
              <span
                key={cleanTitle || fName}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold flex items-center gap-1.5 ${theme.tag}`}
                title={desc}
              >
                <Sparkles size={10} className="shrink-0 text-amber-400" />
                <span className="truncate max-w-[200px]">{cleanTitle}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFeature && onRemoveFeature(fName)}
                  className="text-slate-400 hover:text-red-400 font-bold ml-0.5 shrink-0"
                  title="Remove feature"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Pulldown Tray */}
      {isOpen && (
        <div className="p-3 bg-slate-950 border border-slate-700 rounded-lg space-y-2.5 shadow-2xl animate-in fade-in-50 duration-100 mt-1 max-h-80 flex flex-col">
          {/* Package Requirement Banner */}
          {packageNotes.length > 0 && (
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-start gap-2 text-xs text-amber-200">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-amber-300 block">
                  Package Group Selection:
                </span>
                <p className="text-[11px] text-slate-300">
                  {packageNotes.join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Header Controls: Search & Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={viewMode === 'recommended' ? `Search ${recommendedItems.length} candidate features...` : 'Search all features...'}
                className="w-full bg-slate-900 border border-slate-700 rounded px-7 py-1 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none font-mono"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs"
                >✕</button>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex border border-slate-800 rounded bg-slate-900 p-0.5 shrink-0 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => { setViewMode('recommended'); setActiveGroupFilter('All'); }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'recommended' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recommended ({recommendedItems.length})
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('all'); setActiveGroupFilter('All'); }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'all' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({featCatalog.length})
              </button>
            </div>
          </div>

          {/* Group Filter Chips (if multiple groups exist) */}
          {groupFilters.length > 2 && viewMode === 'recommended' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar shrink-0">
              <Filter size={11} className="text-slate-500 shrink-0" />
              {groupFilters.map(grp => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setActiveGroupFilter(grp)}
                  className={`px-2 py-0.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                    activeGroupFilter === grp
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}

          {/* Feature List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {displayedItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No matching features found.
              </div>
            ) : (
              displayedItems.map((feat) => {
                const fName = typeof feat === 'object' ? (feat.name || feat.title || feat.id) : String(feat);
                const cleanTitle = normalizeTraitName(fName);
                const isSelected = selectedNormSet.has(cleanTitle.toLowerCase()) || selectedNormSet.has(fName.toLowerCase());
                const desc = typeof feat === 'object' ? (feat.description || feat.mechanic || '') : '';
                const cat = typeof feat === 'object' ? (feat.category || feat.groupLabel || categoryLabel) : categoryLabel;

                return (
                  <div
                    key={cleanTitle || fName}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveFeature && onRemoveFeature(fName);
                      } else {
                        if (isAtCapacity) {
                          alert(`You have already selected the maximum of ${maxSelectable} features in this pool. Remove one first to swap.`);
                          return;
                        }
                        onToggleFeature && onToggleFeature(cleanTitle, feat);
                      }
                    }}
                    className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400/80 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : isAtCapacity
                          ? 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold truncate ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                          {cleanTitle}
                        </span>
                        {cat && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-950 border border-slate-800 text-slate-400">
                            {cat}
                          </span>
                        )}
                      </div>
                      {desc && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center pt-0.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-slate-950 border-slate-700 text-transparent'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 3. TRAIT MULTISELECT PULLDOWN (Dedicated for Traits from speciesTraitsData / ALL_CANONICAL_TRAITS)
 * Allows multiselecting 1 or 2 (or N) traits from recommended choices or the global traits database.
 */
export const TraitMultiselectPulldown = ({
  title = 'Recommended Traits',
  categoryLabel = 'Origin Trait',
  maxSelectable = 2,
  selectedTraits = [],
  recommendedTraits = [],
  allTraits = ALL_CANONICAL_TRAITS,
  onToggleTrait,
  onRemoveTrait,
  colorTheme = 'emerald',
  subtitle = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('recommended'); // 'recommended' | 'all'
  const [activeGroupFilter, setActiveGroupFilter] = useState('All');
  const theme = THEME_STYLES[colorTheme] || THEME_STYLES.emerald;
  const dropdownRef = useRef(null);

  const traitCatalog = useMemo(() => {
    if (!allTraits || allTraits.length === 0) return ALL_CANONICAL_TRAITS;
    if (allTraits.length >= ALL_CANONICAL_TRAITS.length) return allTraits;
    const map = new Map();
    ALL_CANONICAL_TRAITS.forEach(t => map.set(t.id || t.name, t));
    allTraits.forEach(t => map.set(t.id || t.name, { ...(map.get(t.id || t.name) || {}), ...t }));
    return Array.from(map.values());
  }, [allTraits]);

  // Normalize selected traits
  const selectedNormSet = useMemo(() => {
    const set = new Set();
    selectedTraits.forEach(t => {
      const name = typeof t === 'object' ? (t.name || t.title || t.id || '') : String(t);
      if (name) {
        set.add(normalizeTraitName(name).toLowerCase());
        set.add(name.toLowerCase());
      }
    });
    return set;
  }, [selectedTraits]);

  const selectedCount = selectedTraits.length;
  const isAtCapacity = selectedCount >= maxSelectable;

  // Expand group expressions into full candidate traits list
  const { items: recommendedItems, packageNotes, groupFilters } = useMemo(() => {
    return expandTraitGroupPatterns(recommendedTraits, traitCatalog);
  }, [recommendedTraits, traitCatalog]);

  // Filter items based on search query and group mode
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = viewMode === 'recommended' ? recommendedItems : traitCatalog;

    return sourceList.map(item => {
      const name = item.name || item.title || '';
      const cleanName = normalizeTraitName(name);
      return {
        id: item.id || `trait_${name}`,
        name: cleanName || name,
        rawName: name,
        category: item.trait_type || item.category || categoryLabel,
        tier: item.trait_tier || 'Basic',
        classification: item.classification || item.type || 'General',
        description: item.description || item.desc || item.mechanics || '',
        groupLabel: item.groupLabel || item.classification || 'Trait',
        sourceTag: item.sourceTag || 'General',
        bp: item.bp !== undefined ? item.bp : 1
      };
    }).filter(item => {
      // Group filter check
      if (activeGroupFilter !== 'All') {
        const target = activeGroupFilter.toLowerCase();
        const matchesGroup = (item.classification && item.classification.toLowerCase().includes(target)) ||
          (item.tier && item.tier.toLowerCase() === target) ||
          (item.sourceTag && item.sourceTag.toLowerCase().includes(target));
        if (!matchesGroup) return false;
      }

      if (!query) return true;
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();
      const cat = item.category.toLowerCase();
      const tier = (item.tier || '').toLowerCase();
      return name.includes(query) || desc.includes(query) || cat.includes(query) || tier.includes(query);
    });
  }, [viewMode, recommendedItems, traitCatalog, searchQuery, activeGroupFilter, categoryLabel]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} className={theme.text} />
          <span>{title}</span>
          {subtitle && <span className="text-slate-500 font-normal">({subtitle})</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            selectedCount === maxSelectable
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : selectedCount > maxSelectable
                ? 'bg-red-950/80 border-red-500/50 text-red-300'
                : 'bg-slate-900 border-slate-700 text-amber-300'
          }`}>
            {selectedCount} / {maxSelectable} Selected
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-all flex items-center gap-1 cursor-pointer ${
              isOpen ? 'bg-slate-800 border-slate-600 text-white' : `${theme.bg} ${theme.border} ${theme.text} hover:text-white`
            }`}
          >
            <span>{isOpen ? 'Close' : 'Choose'}</span>
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Selected Traits Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[26px]">
        {selectedTraits.length === 0 ? (
          <span className="text-[10px] text-slate-500 italic py-0.5">
            No traits selected in this pool yet (Choose up to {maxSelectable}).
          </span>
        ) : (
          selectedTraits.map((trait) => {
            const tName = typeof trait === 'object' ? (trait.name || trait.title || trait.id) : String(trait);
            const cleanTitle = normalizeTraitName(tName);
            const desc = typeof trait === 'object' ? (trait.description || trait.desc || '') : '';
            return (
              <span
                key={cleanTitle || tName}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold flex items-center gap-1.5 ${theme.tag}`}
                title={desc}
              >
                <Sparkles size={10} className="shrink-0 text-emerald-400" />
                <span className="truncate max-w-[200px]">{cleanTitle}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTrait && onRemoveTrait(tName)}
                  className="text-slate-400 hover:text-red-400 font-bold ml-0.5 shrink-0"
                  title="Remove trait"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Pulldown Tray */}
      {isOpen && (
        <div className="p-3 bg-slate-950 border border-slate-700 rounded-lg space-y-2.5 shadow-2xl animate-in fade-in-50 duration-100 mt-1 max-h-80 flex flex-col">
          {/* Package Requirement Banner */}
          {packageNotes.length > 0 && (
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-2 text-xs text-emerald-200">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-300 block">
                  Trait Group Package:
                </span>
                <p className="text-[11px] text-slate-300">
                  {packageNotes.join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Header Controls: Search & Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={viewMode === 'recommended' ? `Search ${recommendedItems.length} candidate traits...` : `Search all ${traitCatalog.length} traits...`}
                className="w-full bg-slate-900 border border-slate-700 rounded px-7 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none font-mono"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs"
                >✕</button>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex border border-slate-800 rounded bg-slate-900 p-0.5 shrink-0 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => { setViewMode('recommended'); setActiveGroupFilter('All'); }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'recommended' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recommended ({recommendedItems.length})
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('all'); setActiveGroupFilter('All'); }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({traitCatalog.length})
              </button>
            </div>
          </div>

          {/* Group Filter Chips (if multiple groups exist) */}
          {groupFilters.length > 2 && viewMode === 'recommended' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar shrink-0">
              <Filter size={11} className="text-slate-500 shrink-0" />
              {groupFilters.map(grp => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setActiveGroupFilter(grp)}
                  className={`px-2 py-0.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                    activeGroupFilter === grp
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}

          {/* Trait List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {displayedItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No matching traits found.
              </div>
            ) : (
              displayedItems.map((trait) => {
                const isSelected = selectedNormSet.has(trait.name.toLowerCase()) || selectedNormSet.has((trait.rawName || '').toLowerCase());
                const tierColor = trait.tier === 'Elite' ? 'bg-purple-950/80 text-purple-300 border-purple-500/50' :
                                  trait.tier === 'Advanced' ? 'bg-sky-950/80 text-sky-300 border-sky-500/50' :
                                  'bg-slate-950 text-slate-400 border-slate-800';

                return (
                  <div
                    key={trait.id || trait.name}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveTrait && onRemoveTrait(trait.name);
                      } else {
                        if (isAtCapacity) {
                          alert(`You have already selected the maximum of ${maxSelectable} traits in this pool. Remove one first to swap.`);
                          return;
                        }
                        onToggleTrait && onToggleTrait(trait.name, trait);
                      }
                    }}
                    className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-400/80 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : isAtCapacity
                          ? 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold truncate ${isSelected ? 'text-emerald-200' : 'text-slate-200'}`}>
                          {trait.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${tierColor}`}>
                          {trait.tier}
                        </span>
                        {trait.classification && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-950 border border-slate-800 text-slate-400">
                            {trait.classification}
                          </span>
                        )}
                      </div>
                      {trait.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {trait.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center pt-0.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-950 border-slate-700 text-transparent'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 4. SKILL POOL RANK INCREASER PULDOWN (Dedicated for Skills with Group Contents expansion)
 */
export const SkillPoolRankPulldown = ({
  title = 'Skill Point Pool',
  categoryLabel = 'Society Skills',
  maxSP = 20,
  allocatedSkills = {}, // { [skillName]: rank }
  recommendedSkills = [],
  allSkills = ALL_CANONICAL_SKILLS,
  onUpdateRank,
  onRemoveSkill,
  colorTheme = 'emerald',
  subtitle = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('recommended'); // 'recommended' | 'all'
  const [activeGroupFilter, setActiveGroupFilter] = useState('All');
  const theme = THEME_STYLES[colorTheme] || THEME_STYLES.emerald;
  const dropdownRef = useRef(null);

  const skillCatalog = allSkills?.length > 0 ? allSkills : ALL_CANONICAL_SKILLS;

  // Calculate total spent SP
  const spentSP = useMemo(() => {
    return Object.values(allocatedSkills).reduce((acc, rank) => acc + (parseInt(rank, 10) || 0), 0);
  }, [allocatedSkills]);

  const spRemaining = Math.max(0, maxSP - spentSP);

  // Expand group expressions (e.g. "Vocations", "Any Social Skills", "Disciplines", "Stealth and one Social or Vocation Skill")
  const { items: recommendedItems, packageNotes, groupFilters } = useMemo(() => {
    return expandSkillGroupPatterns(recommendedSkills, skillCatalog);
  }, [recommendedSkills, skillCatalog]);

  // Displayed items in pulldown tray
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = viewMode === 'recommended' ? recommendedItems : skillCatalog;

    return sourceList.filter(item => {
      const name = (item.name || item.title || '').toLowerCase();
      const group = (item.group || '').toLowerCase();
      const sub = (item.subcategory || item.groupLabel || '').toLowerCase();
      const sourceTag = (item.sourceTag || '').toLowerCase();

      // Group filter check
      if (activeGroupFilter !== 'All') {
        const target = activeGroupFilter.toLowerCase();
        const matchesGroup = group.includes(target) || sub.includes(target) || sourceTag.includes(target);
        if (!matchesGroup) return false;
      }

      if (!query) return true;
      return name.includes(query) || group.includes(query) || sub.includes(query);
    });
  }, [viewMode, recommendedItems, skillCatalog, searchQuery, activeGroupFilter]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen size={12} className={theme.text} />
          <span>{title}</span>
          {subtitle && <span className="text-slate-500 font-normal">({subtitle})</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            spRemaining === 0
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-cyan-300'
          }`}>
            {spentSP} / {maxSP} SP Spent ({spRemaining} SP Left)
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-all flex items-center gap-1 cursor-pointer ${
              isOpen ? 'bg-slate-800 border-slate-600 text-white' : `${theme.bg} ${theme.border} ${theme.text} hover:text-white`
            }`}
          >
            <span>{isOpen ? 'Close' : 'Allocate'}</span>
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Allocated Skills Display */}
      <div className="flex flex-wrap gap-1.5 min-h-[26px]">
        {Object.entries(allocatedSkills).filter(([_, rank]) => (parseInt(rank, 10) || 0) > 0).length === 0 ? (
          <span className="text-[10px] text-slate-500 italic py-0.5">
            No skill ranks allocated yet ({maxSP} SP pool available).
          </span>
        ) : (
          Object.entries(allocatedSkills).filter(([_, rank]) => (parseInt(rank, 10) || 0) > 0).map(([sName, rank]) => {
            const numRank = parseInt(rank, 10) || 0;
            return (
              <div
                key={sName}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold flex items-center gap-1.5 ${theme.tag}`}
              >
                <span className="text-slate-200">{sName}</span>
                <span className={`font-bold ${theme.text}`}>+{numRank}</span>
                <div className="flex items-center gap-0.5 ml-1 border-l border-slate-700 pl-1">
                  <button
                    type="button"
                    disabled={spRemaining < 1 || numRank >= 11}
                    onClick={() => onUpdateRank && onUpdateRank(sName, numRank + 1, 1)}
                    className="text-cyan-400 hover:text-cyan-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold px-0.5"
                    title={numRank >= 11 ? "Creation cap reached (Rank 11)" : "Add 1 rank"}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (numRank > 1) {
                        onUpdateRank && onUpdateRank(sName, numRank - 1, -1);
                      } else {
                        onRemoveSkill && onRemoveSkill(sName);
                      }
                    }}
                    className="text-red-400 hover:text-red-200 font-bold px-0.5"
                    title="Reduce 1 rank"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSkill && onRemoveSkill(sName)}
                    className="text-slate-500 hover:text-red-400 font-bold ml-0.5"
                    title="Remove skill"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pulldown Tray */}
      {isOpen && (
        <div className="p-3 bg-slate-950 border border-slate-700 rounded-lg space-y-2.5 shadow-2xl animate-in fade-in-50 duration-100 mt-1 max-h-80 flex flex-col">
          {/* Package Requirement Banner */}
          {packageNotes.length > 0 && (
            <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/40 flex items-start gap-2 text-xs text-sky-200">
              <Layers className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-sky-300 block">
                  Package Group Requirements:
                </span>
                <p className="text-[11px] text-slate-300">
                  {packageNotes.join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Header Controls: Search & Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={viewMode === 'recommended' ? `Search ${recommendedItems.length} candidate skills...` : 'Search all skills...'}
                className="w-full bg-slate-900 border border-slate-700 rounded px-7 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none font-mono"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs"
                >✕</button>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex border border-slate-800 rounded bg-slate-900 p-0.5 shrink-0 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => { setViewMode('recommended'); setActiveGroupFilter('All'); }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'recommended' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recommended ({recommendedItems.length})
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('all'); setActiveGroupFilter('All'); }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Skills ({skillCatalog.length})
              </button>
            </div>
          </div>

          {/* Group Filter Chips (if multiple groups exist) */}
          {groupFilters.length > 2 && viewMode === 'recommended' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar shrink-0">
              <Filter size={11} className="text-slate-500 shrink-0" />
              {groupFilters.map(grp => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setActiveGroupFilter(grp)}
                  className={`px-2 py-0.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                    activeGroupFilter === grp
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}

          {/* Skill Items List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {displayedItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No matching skills found.
              </div>
            ) : (
              displayedItems.map((sk) => {
                const sName = sk.name || sk.title;
                const allocatedRank = parseInt(allocatedSkills[sName], 10) || 0;
                const canAdd = spRemaining > 0 && allocatedRank < 11;
                const canSub = allocatedRank > 0;
                const grpBadge = sk.groupLabel || sk.subcategory || sk.group;

                return (
                  <div
                    key={sName}
                    className={`p-2 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                      allocatedRank > 0
                        ? 'bg-emerald-950/60 border-emerald-400/80 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold truncate ${allocatedRank > 0 ? 'text-emerald-200' : 'text-slate-200'}`}>
                          {sName}
                        </span>
                        {grpBadge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-950 border border-slate-800 text-slate-400">
                            {grpBadge}
                          </span>
                        )}
                        {allocatedRank > 6 && (
                          <span
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300 font-mono"
                            title="Recommended creation limit is Rank 6 (Trained/Professional). Rank 7-11 allowed for specialized character concept."
                          >
                            Specialized (R{allocatedRank})
                          </span>
                        )}
                      </div>
                      {sk.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
                          {sk.description}
                        </p>
                      )}
                    </div>

                    {/* Rank Stepper Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick +5 button if enough SP and under Rank 11 cap */}
                      {spRemaining >= 5 && (allocatedRank + 5 <= 11) && (
                        <button
                          type="button"
                          onClick={() => onUpdateRank && onUpdateRank(sName, allocatedRank + 5, 5)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-700 text-[9px] font-mono text-emerald-300 font-bold border border-slate-700 transition-colors cursor-pointer"
                          title="Allocate +5 SP"
                        >
                          +5
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={!canSub}
                        onClick={() => {
                          if (allocatedRank > 1) {
                            onUpdateRank && onUpdateRank(sName, allocatedRank - 1, -1);
                          } else {
                            onRemoveSkill && onRemoveSkill(sName);
                          }
                        }}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                        title="Reduce 1 rank"
                      >
                        <Minus size={10} />
                      </button>

                      <span className="w-6 text-center font-mono font-bold text-xs text-emerald-300">
                        {allocatedRank > 0 ? `+${allocatedRank}` : '0'}
                      </span>

                      <button
                        type="button"
                        disabled={!canAdd}
                        onClick={() => onUpdateRank && onUpdateRank(sName, allocatedRank + 1, 1)}
                        className={`w-5 h-5 rounded disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs cursor-pointer ${
                          canAdd ? theme.btn : 'bg-slate-800 text-slate-500'
                        }`}
                        title={allocatedRank >= 11 ? "Creation Cap reached (Max Rank 11)" : "Add 1 rank"}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
