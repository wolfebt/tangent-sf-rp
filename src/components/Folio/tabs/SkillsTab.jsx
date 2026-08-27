import React, { useState, useMemo, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { DEFAULT_SKILLS } from '../../../data/skillsData';

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
    color: 'text-emerald-400',
    border: 'border-emerald-900/50',
    accentBorder: 'border-emerald-500/60'
  },
  {
    key: 'mental',
    title: 'Mental Skills',
    color: 'text-blue-400',
    border: 'border-blue-900/50',
    accentBorder: 'border-blue-500/60'
  }
];

const RIGHT_COLUMN_CONFIG = [
  {
    key: 'social',
    title: 'Social Skills',
    color: 'text-cyan-400',
    border: 'border-cyan-900/50',
    accentBorder: 'border-cyan-500/60'
  },
  {
    key: 'combat',
    title: 'Combat Skills',
    color: 'text-amber-400',
    border: 'border-amber-900/50',
    accentBorder: 'border-amber-500/60'
  },
  {
    key: 'meta',
    title: 'Metafocus Skills',
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
    isGMConfirmed
  } = useFolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const isStatsLocked = isInActiveGame && !isGMConfirmed;

  const getNum = useCallback((id) => parseInt(characterData[id] || 0, 10), [characterData]);

  // Helper to calculate total for a regular skill (rank max 20)
  const getSkillTotal = useCallback((skillId) => {
    const rank = Math.min(20, Math.max(0, getNum(`skill-${skillId}-rank`)));
    const mod = getNum(`skill-${skillId}-mod`);
    const baseAttrKey = characterData[`skill-${skillId}-base`] || '';

    let baseAttrVal = 0;
    if (baseAttrKey) {
      const attrVal = getNum(baseAttrKey);
      const attrMod = getNum(`${baseAttrKey}-mod`);
      baseAttrVal = attrVal + attrMod;
    }

    return rank + baseAttrVal + mod;
  }, [characterData, getNum]);

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
    Object.keys(characterData).forEach((key) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const id = key.replace('skill-', '').replace('-rank', '');
        if (!defaultSkillIds.has(id)) {
          const parts = id.split('-');
          const group = ['physical', 'mental', 'social', 'combat', 'meta'].includes(parts[0]) ? parts[0] : 'mental';
          const subcategory = characterData[`skill-${id}-subcategory`] || 'General';
          const storedName = characterData[`skill-${id}-name`];
          const name = storedName || parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || id;
          const mapKey = `${group}|${subcategory}`;
          if (!result[mapKey]) result[mapKey] = [];
          result[mapKey].push({ name, id, group, subcategory });
        }
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
            total: getSkillTotal(s.id)
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
          total: getSkillTotal(s.id)
        });
      });
    });
    return list;
  }, [customSkillsBySubcategory, getSkillTotal]);

  // Lookup map for skill names and totals by ID
  const skillLookup = useMemo(() => {
    const map = {};
    allAvailableSkills.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [allAvailableSkills]);

  // Map specializations by baseSkillId
  const specializationsByBaseSkill = useMemo(() => {
    const map = {};
    const specs = Array.isArray(characterData.specializations) ? characterData.specializations : [];
    specs.forEach((s) => {
      if (!s.baseSkillId) return;
      if (!map[s.baseSkillId]) map[s.baseSkillId] = [];
      map[s.baseSkillId].push(s);
    });
    return map;
  }, [characterData.specializations]);

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
          if (!q) {
            count++;
          } else {
            const specMatches = (specializationsByBaseSkill[s.id] || []).some(spec => spec.name.toLowerCase().includes(q));
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
  }, [searchQuery, customSkillsBySubcategory, specializationsByBaseSkill]);

  // Set of unlocked Metafocus discipline names (lowercase) from purchased features/awakened items
  const unlockedDisciplines = useMemo(() => {
    const unlocked = new Set();
    const featuresList = Array.isArray(characterData.features) ? characterData.features : [];
    const awakenedList = Array.isArray(characterData.awakened) ? characterData.awakened : [];
    const allFeats = [...featuresList, ...awakenedList];

    allFeats.forEach((feat) => {
      const featName = (typeof feat === 'object' ? (feat.name || feat.title || '') : String(feat)).toLowerCase();
      const featType = (typeof feat === 'object' ? (feat.type || feat.category || '') : '').toLowerCase();
      const featId = (typeof feat === 'object' ? (feat.id || '') : '').toLowerCase();

      const isAwakened = featType.includes('awakened') || featName.includes('awakened') || featId.includes('awakened') || (Array.isArray(characterData.awakened) && characterData.awakened.includes(feat));

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
  }, [characterData.features, characterData.awakened]);

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

    // Locking rules:
    // 1. Attune is locked unless character has ANY awakened feature
    // 2. Discipline skills are locked unless character has THAT specific awakened discipline
    let isLocked = false;
    let lockMessage = '';

    if (isAttune) {
      if (!hasAnyAwakened) {
        isLocked = true;
        lockMessage = "Attune requires purchasing or possessing any Awakened feature in the Features tab";
      }
    } else if (isDisciplineSkill) {
      if (!unlockedDisciplines.has(discKey)) {
        isLocked = true;
        const discTitle = discKey.charAt(0).toUpperCase() + discKey.slice(1);
        lockMessage = `Requires purchasing 'Awakened: ${discTitle}' feature in Features tab to unlock ${skill.name}`;
      }
    }

    const rank = isLocked ? 0 : Math.min(20, Math.max(0, getNum(`skill-${skill.id}-rank`)));
    const mod = getNum(`skill-${skill.id}-mod`);
    const baseAttr = characterData[`skill-${skill.id}-base`] || (skill.baseAttr || 'attr-wisdom');
    const baseSkillTotal = isLocked ? 0 : getSkillTotal(skill.id);
    const linkedSpecs = specializationsByBaseSkill[skill.id] || [];

    return (
      <div key={skill.id} className="space-y-1.5">
        <div
          className={`grid grid-cols-12 items-center gap-2 py-1 px-2 rounded transition-colors text-xs border ${
            isLocked
              ? 'bg-slate-950/40 opacity-60 border-slate-800/60'
              : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/40'
          }`}
          title={isLocked ? lockMessage : undefined}
        >
          <div className="col-span-4 flex items-center justify-between pr-1 overflow-hidden">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`font-medium ${isLocked ? 'text-slate-500' : 'text-slate-200'} truncate`} title={skill.name}>
                {skill.name}
              </span>
              {isLocked && (
                <span
                  className="text-[9px] font-mono font-bold text-amber-400/90 bg-amber-950/70 border border-amber-900/60 px-1.5 py-0.2 rounded shrink-0"
                  title={lockMessage}
                >
                  🔒 Locked
                </span>
              )}
            </div>
            {isCustom && !isLocked && (
              <button
                type="button"
                onClick={() => {
                  if (confirmTypedDeletion(skill.name, 'custom skill')) {
                    handleDeleteSkill(skill.id);
                  }
                }}
                className="text-red-400/60 hover:text-red-400 font-bold px-1 text-xs shrink-0"
                title="Delete Custom Skill"
              >
                &times;
              </button>
            )}
          </div>

          {/* Rank Input (Max Level 20) */}
          <input
            type="number"
            min="0"
            max="20"
            disabled={isLocked || isStatsLocked}
            value={rank}
            onChange={(e) => !isLocked && !isStatsLocked && updateField(`skill-${skill.id}-rank`, Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0)))}
            title={isStatsLocked ? 'Skill rank locked during active game session. Request GM AP update.' : isLocked ? lockMessage : undefined}
            className={`col-span-2 text-center bg-slate-950 border ${
              isLocked || isStatsLocked 
                ? 'border-slate-800 text-slate-600 cursor-not-allowed opacity-75' 
                : 'border-slate-700 focus:border-cyan-400 text-slate-100'
            } rounded py-0.5 outline-none text-xs font-mono`}
          />

          {/* Base Attr Select */}
          <select
            value={baseAttr}
            disabled={isLocked || isStatsLocked}
            onChange={(e) => !isLocked && !isStatsLocked && updateField(`skill-${skill.id}-base`, e.target.value)}
            title={isStatsLocked ? 'Skill base attribute locked during active game session.' : undefined}
            className={`col-span-3 bg-slate-950 border ${
              isLocked || isStatsLocked 
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

          {/* Mod */}
          <span className={`col-span-1 text-center font-mono ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
            {mod}
          </span>

          {/* Total Base Skill Score */}
          <span className={`col-span-2 text-center font-mono font-bold ${isLocked ? 'text-slate-600' : 'text-cyan-300'}`}>
            {baseSkillTotal}
          </span>
        </div>

        {/* Linked Specializations List */}
        {linkedSpecs.map((spec) => {
          const specRank = Math.min(10, Math.max(0, parseInt(spec.rank || 0, 10)));
          const specMod = parseInt(spec.mod || 0, 10);
          const specTotal = baseSkillTotal + specRank + specMod;
          const isMetaSkill = skill.group === 'meta' || skill.id.startsWith('meta-');

          return (
            <div
              key={spec.id}
              className={`ml-6 pl-2.5 border-l-2 ${isMetaSkill ? 'border-purple-500/60 bg-purple-950/20 hover:bg-purple-900/30 border-purple-900/30' : 'border-amber-500/60 bg-amber-950/20 hover:bg-amber-900/30 border-amber-900/30'} grid grid-cols-12 items-center gap-2 py-1 px-2 rounded transition-colors text-xs border`}
            >
              {/* Specialization Name & Base Skill Ref */}
              <div className="col-span-4 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center gap-1 truncate">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isMetaSkill ? 'text-purple-400 font-mono' : 'text-amber-400/90'} shrink-0`}>
                    {isMetaSkill ? 'EVOCATION:' : 'SPEC:'}
                  </span>
                  <span className={`font-semibold ${isMetaSkill ? 'text-purple-200' : 'text-amber-200'} truncate`} title={spec.name}>
                    {spec.name}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono truncate">
                  {isMetaSkill ? 'Discipline: ' : 'Base: '}<span className="text-slate-300">{skill.name}</span> ({baseSkillTotal})
                </span>
              </div>

              {/* Specialization Level / Rank Input (Max Level 10) */}
              <div className="col-span-2 flex items-center justify-center">
                <input
                  type="number"
                  min="0"
                  max="10"
                  disabled={isLocked}
                  value={specRank}
                  onChange={(e) => !isLocked && handleUpdateSpecialization(spec.id, 'rank', e.target.value)}
                  className={`w-full text-center bg-slate-950 border ${isLocked ? 'border-slate-800 text-slate-600 cursor-not-allowed' : (isMetaSkill ? 'border-purple-800/60 focus:border-purple-400 text-purple-200' : 'border-amber-800/60 focus:border-amber-400 text-amber-200')} rounded py-0.5 outline-none text-xs font-bold`}
                />
              </div>

              {/* Linked Label / Indicator */}
              <span className={`col-span-3 text-center text-[10px] font-mono ${isMetaSkill ? 'text-purple-400/80' : 'text-amber-400/80'} truncate`}>
                +{specRank} to Base
              </span>

              {/* Spec Mod Input */}
              <input
                type="number"
                disabled={isLocked}
                value={specMod}
                onChange={(e) => !isLocked && handleUpdateSpecialization(spec.id, 'mod', e.target.value)}
                className={`col-span-1 text-center bg-slate-950 border ${isLocked ? 'border-slate-800 text-slate-600 cursor-not-allowed' : (isMetaSkill ? 'border-purple-900/40 focus:border-purple-400' : 'border-amber-900/40 focus:border-amber-400')} rounded py-0.5 text-slate-300 outline-none text-xs font-mono`}
              />

              {/* Specialization Total Score */}
              <div className="col-span-2 flex items-center justify-between pl-1">
                <span className={`font-mono font-bold ${isLocked ? 'text-slate-600' : (isMetaSkill ? 'text-purple-300' : 'text-amber-300')} text-center w-full`}>
                  {isLocked ? 0 : specTotal}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmTypedDeletion(spec.name, 'specialization')) {
                      handleDeleteSpecialization(spec.id);
                    }
                  }}
                  className="text-red-400/60 hover:text-red-400 font-bold px-1 text-xs shrink-0"
                  title={isMetaSkill ? "Delete Evocation" : "Delete Specialization"}
                >
                  &times;
                </button>
              </div>
            </div>
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
      <div key={key} className={`bg-slate-900/60 border ${borderClass} rounded-lg p-4 space-y-3 shadow-lg backdrop-blur-sm`}>
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
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
            {skillsList.length} {skillsList.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {/* Column Table Header */}
        <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 border-b border-slate-800/60 pb-1">
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
        if (!q) return true;
        const specMatches = (specializationsByBaseSkill[s.id] || []).some(spec => spec.name.toLowerCase().includes(q));
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
          if (!q || s.name.toLowerCase().includes(q)) {
            unmappedCustomSkills.push(s);
          }
        });
      }
    });

    const totalSkillCount = filteredGroups.reduce((acc, g) => acc + g.skills.length, 0) + unmappedCustomSkills.length;

    if (totalSkillCount === 0) return null;

    const unmappedBlockTitle = cat.key === 'meta' ? 'Special Abilities' : `Custom ${cat.title}`;
    const isSingleTabMode = activeCategoryTab !== 'all';

    return (
      <div key={cat.key} className="space-y-3">
        {/* Category Header Banner */}
        <div className={`flex justify-between items-center px-4 py-2 bg-slate-950/80 border ${cat.border} border-l-4 ${cat.accentBorder} rounded-r-lg rounded-l-sm shadow-md`}>
          <h3 className={`text-xs font-bold uppercase tracking-widest ${cat.color}`}>
            {cat.title}
          </h3>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-bold">
            {totalSkillCount} {totalSkillCount === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {/* Subcategory Blocks */}
        {isSingleTabMode && cat.key === 'mental' ? (
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
          <div className={isSingleTabMode && (filteredGroups.length > 1 || unmappedCustomSkills.length > 0) ? "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" : "space-y-4"}>
            {filteredGroups.map((group, idx) =>
              renderSubcategoryBlock(group.title, group.skills, cat.color, cat.border, `${cat.key}-${idx}`, cat.key)
            )}
            {unmappedCustomSkills.length > 0 &&
              renderSubcategoryBlock(unmappedBlockTitle, unmappedCustomSkills, 'text-amber-400', 'border-amber-900/50', `${cat.key}-custom`, cat.key)
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-4 pb-20">
      {/* Header Toolbar & Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-900/60 pb-3 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Skill Categories, Custom Skills & Specializations
          </h3>
          <p className="text-[11px] text-slate-400">
            Skills have a maximum level of 20. Linked specializations have a maximum level of 10.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Filter Input */}
          <div className="relative flex-1 sm:w-52">
            <input
              type="text"
              placeholder="Filter skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-cyan-900/70 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>

          {/* Consolidated Action Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSelectorModal) {
                onOpenSelectorModal('skills', 'Skills Database', 'skills');
              } else if (onOpenAddSkillModal) {
                onOpenAddSkillModal('skill', allAvailableSkills);
              }
            }}
            className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0 flex items-center gap-1.5 cursor-pointer"
            title="Open Skills Catalog (Table / Cards) with build option"
          >
            <span>✨</span>
            <span>+ Add Skill</span>
          </button>
        </div>
      </div>

      {/* Category Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 border-b border-cyan-900/50 pb-1">
        {TABS_CONFIG.map((tab) => {
          const isActive = activeCategoryTab === tab.key;
          const count = categoryCounts[tab.key] || 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategoryTab(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-t-md transition-all flex items-center gap-2 whitespace-nowrap border-t-2 ${
                isActive
                  ? `${tab.activeBg} ${tab.activeBorder} ${tab.color} border-b-2 border-b-transparent shadow-[0_-2px_10px_rgba(0,0,0,0.3)]`
                  : 'bg-slate-950/60 border-t-transparent border-b border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{tab.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-slate-900/90 border border-slate-700/80' : 'bg-slate-900 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Skills Content Display */}
      {activeCategoryTab === 'all' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Physical, Mental */}
          <div className="space-y-6">
            {LEFT_COLUMN_CONFIG.map(renderCategorySection)}
          </div>

          {/* Right Column: Social, Combat, Metafocus */}
          <div className="space-y-6">
            {RIGHT_COLUMN_CONFIG.map(renderCategorySection)}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORY_CONFIG_MAP[activeCategoryTab] && renderCategorySection(CATEGORY_CONFIG_MAP[activeCategoryTab])}
        </div>
      )}

      {/* Empty Search State */}
      {searchQuery && categoryCounts[activeCategoryTab] === 0 && (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-slate-400">
            No skills matching <span className="text-cyan-300">"{searchQuery}"</span> found in{' '}
            <span className="text-amber-300">
              {activeCategoryTab === 'all' ? 'All Skills' : CATEGORY_CONFIG_MAP[activeCategoryTab]?.title || activeCategoryTab}
            </span>.
          </p>
          {activeCategoryTab !== 'all' && categoryCounts.all > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategoryTab('all')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold"
            >
              View results in All Skills ({categoryCounts.all} matches)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillsTab);


