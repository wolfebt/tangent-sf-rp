import React, { useState, useMemo, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';

const DEFAULT_SKILLS = {
  physical: [
    {
      title: null,
      skills: [
        { name: 'Acrobatics', id: 'physical-acrobatics', group: 'physical' },
        { name: 'Athletics', id: 'physical-athletics', group: 'physical' },
        { name: 'Endurance', id: 'physical-endurance', group: 'physical' },
        { name: 'Piloting', id: 'physical-piloting', group: 'physical' },
        { name: 'Stealth', id: 'physical-stealth', group: 'physical' }
      ]
    }
  ],
  mental: [
    {
      title: 'General',
      skills: [
        { name: 'Alertness', id: 'mental-alertness', group: 'mental' },
        { name: 'Academics', id: 'mental-academics', group: 'mental' }
      ]
    },
    {
      title: 'Knowledges',
      skills: [
        { name: 'Appraisal', id: 'mental-appraisal', group: 'mental' },
        { name: 'Business', id: 'mental-business', group: 'mental' },
        { name: 'Computers', id: 'mental-computers', group: 'mental' },
        { name: 'Culture', id: 'mental-culture', group: 'mental' },
        { name: 'History', id: 'mental-history', group: 'mental' },
        { name: 'Investigation', id: 'mental-investigation', group: 'mental' },
        { name: 'Language', id: 'mental-language', group: 'mental' },
        { name: 'Logistics', id: 'mental-logistics', group: 'mental' },
        { name: 'Medicine', id: 'mental-medicine', group: 'mental' },
        { name: 'Metaphysics', id: 'mental-metaphysics', group: 'mental' },
        { name: 'Nature', id: 'mental-nature', group: 'mental' },
        { name: 'Navigation', id: 'mental-navigation', group: 'mental' },
        { name: 'Nobility', id: 'mental-nobility', group: 'mental' },
        { name: 'Physics', id: 'mental-physics', group: 'mental' },
        { name: 'Religion', id: 'mental-religion', group: 'mental' },
        { name: 'Science', id: 'mental-science', group: 'mental' },
        { name: 'Survival', id: 'mental-survival', group: 'mental' },
        { name: 'Tactics', id: 'mental-tactics', group: 'mental' },
        { name: 'Technology', id: 'mental-technology', group: 'mental' },
        { name: 'Trade', id: 'mental-trade', group: 'mental' }
      ]
    },
    {
      title: 'Vocations',
      skills: [
        { name: 'Administrator', id: 'mental-administrator', group: 'mental' },
        { name: 'Alchemist', id: 'mental-alchemist', group: 'mental' },
        { name: 'Ambassador', id: 'mental-ambassador', group: 'mental' },
        { name: 'Architect', id: 'mental-architect', group: 'mental' },
        { name: 'Archivist', id: 'mental-archivist', group: 'mental' },
        { name: 'Armorer', id: 'mental-armorer', group: 'mental' },
        { name: 'Artist', id: 'mental-artist', group: 'mental' },
        { name: 'Artificer', id: 'mental-artificer', group: 'mental' },
        { name: 'Broker', id: 'mental-broker', group: 'mental' },
        { name: 'Celebrity', id: 'mental-celebrity', group: 'mental' },
        { name: 'Constable', id: 'mental-constable', group: 'mental' },
        { name: 'Courtesan', id: 'mental-courtesan', group: 'mental' },
        { name: 'Culinarian', id: 'mental-culinarian', group: 'mental' },
        { name: 'Demolitionist', id: 'mental-demolitionist', group: 'mental' },
        { name: 'Electrician', id: 'mental-electrician', group: 'mental' },
        { name: 'Engineer', id: 'mental-engineer', group: 'mental' },
        { name: 'Farmer', id: 'mental-farmer', group: 'mental' },
        { name: 'Groundskeeper', id: 'mental-groundskeeper', group: 'mental' },
        { name: 'Handler', id: 'mental-handler', group: 'mental' },
        { name: 'Laborer', id: 'mental-laborer', group: 'mental' },
        { name: 'Mechanic', id: 'mental-mechanic', group: 'mental' },
        { name: 'Researcher', id: 'mental-researcher', group: 'mental' },
        { name: 'Salvager', id: 'mental-salvager', group: 'mental' },
        { name: 'Soldier', id: 'mental-soldier', group: 'mental' },
        { name: 'Tailor', id: 'mental-tailor', group: 'mental' },
        { name: 'Transporter', id: 'mental-transporter', group: 'mental' },
        { name: 'Weaponsmith', id: 'mental-weaponsmith', group: 'mental' }
      ]
    }
  ],
  social: [
    {
      title: 'Expression',
      skills: [
        { name: 'Acting', id: 'social-acting', group: 'social' },
        { name: 'Comedy', id: 'social-comedy', group: 'social' },
        { name: 'Dancing', id: 'social-dancing', group: 'social' },
        { name: 'Disguise', id: 'social-disguise', group: 'social' },
        { name: 'Keyboard', id: 'social-keyboard', group: 'social' },
        { name: 'Legerdemain', id: 'social-legerdemain', group: 'social' },
        { name: 'Oratory', id: 'social-oratory', group: 'social' },
        { name: 'Percussion', id: 'social-percussion', group: 'social' },
        { name: 'Singing', id: 'social-singing', group: 'social' },
        { name: 'String', id: 'social-string', group: 'social' },
        { name: 'Style', id: 'social-style', group: 'social' },
        { name: 'Wind', id: 'social-wind', group: 'social' }
      ]
    },
    {
      title: 'Manipulation',
      skills: [
        { name: 'Barter', id: 'social-barter', group: 'social' },
        { name: 'Bluff', id: 'social-bluff', group: 'social' },
        { name: 'Diplomacy', id: 'social-diplomacy', group: 'social' },
        { name: 'Insight', id: 'social-insight', group: 'social' },
        { name: 'Intimidate', id: 'social-intimidate', group: 'social' },
        { name: 'Leadership', id: 'social-leadership', group: 'social' },
        { name: 'Streetwise', id: 'social-streetwise', group: 'social' }
      ]
    }
  ],
  combat: [
    {
      title: 'Archaic',
      skills: [
        { name: 'Defense', id: 'combat-defense', group: 'combat' },
        { name: 'Melee', id: 'combat-melee', group: 'combat' },
        { name: 'Ranged', id: 'combat-ranged', group: 'combat' },
        { name: 'Unarmed', id: 'combat-unarmed', group: 'combat' }
      ]
    },
    {
      title: 'Modern',
      skills: [
        { name: 'Ballistic', id: 'combat-ballistic', group: 'combat' },
        { name: 'Heavy Weapons', id: 'combat-heavy-weapons', group: 'combat' }
      ]
    },
    {
      title: 'Advanced',
      skills: [
        { name: 'Energy', id: 'combat-energy', group: 'combat' },
        { name: 'Heavy Energy', id: 'combat-heavy-energy', group: 'combat' }
      ]
    }
  ],
  meta: [
    {
      title: null,
      skills: [
        { name: 'Attune', id: 'meta-attune', group: 'meta' }
      ]
    },
    {
      title: 'Disciplines',
      skills: [
        { name: 'Dimension', id: 'meta-dimension', group: 'meta' },
        { name: 'Energy', id: 'meta-energy', group: 'meta' },
        { name: 'Entropy', id: 'meta-entropy', group: 'meta' },
        { name: 'Illusion', id: 'meta-illusion', group: 'meta' },
        { name: 'Matter', id: 'meta-matter', group: 'meta' },
        { name: 'Mental', id: 'meta-mental', group: 'meta' }
      ]
    }
  ]
};

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
    color: 'text-purple-400',
    border: 'border-purple-900/50',
    accentBorder: 'border-purple-500/60'
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
    color: 'text-cyan-400',
    border: 'border-cyan-900/50',
    accentBorder: 'border-cyan-500/60'
  }
];

const SkillsTab = ({ onOpenAddSkillModal }) => {
  const {
    characterData,
    updateField,
    handleDeleteSkill,
    handleUpdateSpecialization,
    handleDeleteSpecialization
  } = useFolio();
  const [searchQuery, setSearchQuery] = useState('');

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

  const renderSkillRow = (skill) => {
    const isCustom = !defaultSkillIds.has(skill.id);
    const isDisciplineSkill = (skill.group === 'meta' || skill.id.startsWith('meta-')) && skill.id !== 'meta-attune';
    const discKey = skill.name.toLowerCase();
    const isLocked = isDisciplineSkill && !unlockedDisciplines.has(discKey) && !unlockedDisciplines.has(skill.id.replace('meta-', ''));

    const rank = isLocked ? 0 : Math.min(20, Math.max(0, getNum(`skill-${skill.id}-rank`)));
    const mod = getNum(`skill-${skill.id}-mod`);
    const baseAttr = characterData[`skill-${skill.id}-base`] || '';
    const baseSkillTotal = isLocked ? 0 : getSkillTotal(skill.id);
    const linkedSpecs = specializationsByBaseSkill[skill.id] || [];

    return (
      <div key={skill.id} className="space-y-1.5">
        <div
          className={`grid grid-cols-12 items-center gap-2 py-1 px-2 rounded transition-colors text-xs border ${
            isLocked
              ? 'bg-slate-950/40 opacity-50 border-slate-800/60'
              : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/40'
          }`}
          title={isLocked ? `Requires purchasing 'Awakened: ${skill.name}' feature in Features tab` : undefined}
        >
          <div className="col-span-4 flex items-center justify-between pr-1 overflow-hidden">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`font-medium ${isLocked ? 'text-slate-500' : 'text-slate-200'} truncate`} title={skill.name}>
                {skill.name}
              </span>
              {isLocked && (
                <span
                  className="text-[9px] font-mono font-bold text-amber-400/90 bg-amber-950/70 border border-amber-900/60 px-1.5 py-0.2 rounded shrink-0"
                  title={`Purchased Awakened feature required to unlock ${skill.name}`}
                >
                  🔒 Locked
                </span>
              )}
            </div>
            {isCustom && !isLocked && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete custom skill "${skill.name}"?`)) {
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
            disabled={isLocked}
            value={rank}
            onChange={(e) => !isLocked && updateField(`skill-${skill.id}-rank`, Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0)))}
            className={`col-span-2 text-center bg-slate-950 border ${isLocked ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-slate-700 focus:border-cyan-400 text-slate-100'} rounded py-0.5 outline-none text-xs`}
          />

          {/* Base Attr Select */}
          <select
            value={baseAttr}
            disabled={isLocked}
            onChange={(e) => !isLocked && updateField(`skill-${skill.id}-base`, e.target.value)}
            className={`col-span-3 bg-slate-950 border ${isLocked ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-slate-700 focus:border-cyan-400 text-slate-300'} rounded py-0.5 text-center outline-none text-xs`}
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
              className={`ml-6 pl-2.5 border-l-2 ${isMetaSkill ? 'border-cyan-500/60 bg-cyan-950/20 hover:bg-cyan-900/30 border-cyan-900/30' : 'border-amber-500/60 bg-amber-950/20 hover:bg-amber-900/30 border-amber-900/30'} grid grid-cols-12 items-center gap-2 py-1 px-2 rounded transition-colors text-xs border`}
            >
              {/* Specialization Name & Base Skill Ref */}
              <div className="col-span-4 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center gap-1 truncate">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isMetaSkill ? 'text-cyan-400 font-mono' : 'text-amber-400/90'} shrink-0`}>
                    {isMetaSkill ? 'EVOCATION:' : 'SPEC:'}
                  </span>
                  <span className={`font-semibold ${isMetaSkill ? 'text-cyan-200' : 'text-amber-200'} truncate`} title={spec.name}>
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
                  value={specRank}
                  onChange={(e) => handleUpdateSpecialization(spec.id, 'rank', e.target.value)}
                  className={`w-full text-center bg-slate-950 border ${isMetaSkill ? 'border-cyan-800/60 focus:border-cyan-400 text-cyan-200' : 'border-amber-800/60 focus:border-amber-400 text-amber-200'} rounded py-0.5 outline-none text-xs font-bold`}
                />
              </div>

              {/* Linked Label / Indicator */}
              <span className={`col-span-3 text-center text-[10px] font-mono ${isMetaSkill ? 'text-cyan-400/80' : 'text-amber-400/80'} truncate`}>
                +{specRank} to Base
              </span>

              {/* Spec Mod Input */}
              <input
                type="number"
                value={specMod}
                onChange={(e) => handleUpdateSpecialization(spec.id, 'mod', e.target.value)}
                className={`col-span-1 text-center bg-slate-950 border ${isMetaSkill ? 'border-cyan-900/40 focus:border-cyan-400' : 'border-amber-900/40 focus:border-amber-400'} rounded py-0.5 text-slate-300 outline-none text-xs font-mono`}
              />

              {/* Specialization Total Score */}
              <div className="col-span-2 flex items-center justify-between pl-1">
                <span className={`font-mono font-bold ${isMetaSkill ? 'text-cyan-300' : 'text-amber-300'} text-center w-full`}>
                  {specTotal}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${spec.name}"?`)) {
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

  const renderSubcategoryBlock = (groupTitle, skillsList, colorClass, borderClass, key) => {
    if (skillsList.length === 0) return null;

    return (
      <div key={key} className={`bg-slate-900/60 border ${borderClass} rounded-lg p-4 space-y-3 shadow-lg backdrop-blur-sm`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h4 className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>
            {groupTitle || 'General'}
          </h4>
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

    if (q && totalSkillCount === 0) return null;

    const unmappedBlockTitle = cat.key === 'meta' ? 'Special Abilities' : `Custom ${cat.title}`;

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
        <div className="space-y-4">
          {filteredGroups.map((group, idx) =>
            renderSubcategoryBlock(group.title, group.skills, cat.color, cat.border, `${cat.key}-${idx}`)
          )}
          {unmappedCustomSkills.length > 0 &&
            renderSubcategoryBlock(unmappedBlockTitle, unmappedCustomSkills, 'text-amber-400', 'border-amber-900/50', `${cat.key}-custom`)
          }
        </div>
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-6">
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
            onClick={() => onOpenAddSkillModal('skill', allAvailableSkills)}
            className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0"
          >
            + Custom/Special
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
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
    </div>
  );
};

export default React.memo(SkillsTab);

