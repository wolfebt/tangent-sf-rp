import React, { useState, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';

const DEFAULT_SKILLS = {
  physical: [
    {
      title: null,
      skills: [
        { name: 'Acrobatics', id: 'physical-acrobatics' },
        { name: 'Athletics', id: 'physical-athletics' },
        { name: 'Piloting', id: 'physical-piloting' },
        { name: 'Stealth', id: 'physical-stealth' }
      ]
    }
  ],
  mental: [
    {
      title: 'General',
      skills: [
        { name: 'Alertness', id: 'mental-alertness' },
        { name: 'Academics', id: 'mental-academics' }
      ]
    },
    {
      title: 'Knowledge Skills',
      skills: [
        { name: 'Appraisal', id: 'mental-appraisal' },
        { name: 'Business', id: 'mental-business' },
        { name: 'Computers', id: 'mental-computers' },
        { name: 'Culture', id: 'mental-culture' },
        { name: 'History', id: 'mental-history' },
        { name: 'Investigation', id: 'mental-investigation' },
        { name: 'Language', id: 'mental-language' },
        { name: 'Logistics', id: 'mental-logistics' },
        { name: 'Medicine', id: 'mental-medicine' },
        { name: 'Metaphysics', id: 'mental-metaphysics' },
        { name: 'Nature', id: 'mental-nature' },
        { name: 'Navigation', id: 'mental-navigation' },
        { name: 'Nobility', id: 'mental-nobility' },
        { name: 'Physics', id: 'mental-physics' },
        { name: 'Religion', id: 'mental-religion' },
        { name: 'Science', id: 'mental-science' },
        { name: 'Survival', id: 'mental-survival' },
        { name: 'Tactics', id: 'mental-tactics' },
        { name: 'Technology', id: 'mental-technology' },
        { name: 'Trade', id: 'mental-trade' }
      ]
    },
    {
      title: 'Vocation Skills',
      skills: [
        { name: 'Administrator', id: 'mental-administrator' },
        { name: 'Alchemist', id: 'mental-alchemist' },
        { name: 'Ambassador', id: 'mental-ambassador' },
        { name: 'Architect', id: 'mental-architect' },
        { name: 'Archivist', id: 'mental-archivist' },
        { name: 'Armorer', id: 'mental-armorer' },
        { name: 'Artist', id: 'mental-artist' },
        { name: 'Artificer', id: 'mental-artificer' },
        { name: 'Broker', id: 'mental-broker' },
        { name: 'Celebrity', id: 'mental-celebrity' },
        { name: 'Constable', id: 'mental-constable' },
        { name: 'Courtesan', id: 'mental-courtesan' },
        { name: 'Culinarian', id: 'mental-culinarian' },
        { name: 'Demolitionist', id: 'mental-demolitionist' },
        { name: 'Electrician', id: 'mental-electrician' },
        { name: 'Engineer', id: 'mental-engineer' },
        { name: 'Farmer', id: 'mental-farmer' },
        { name: 'Groundskeeper', id: 'mental-groundskeeper' },
        { name: 'Handler', id: 'mental-handler' },
        { name: 'Laborer', id: 'mental-laborer' },
        { name: 'Mechanic', id: 'mental-mechanic' },
        { name: 'Researcher', id: 'mental-researcher' },
        { name: 'Salvager', id: 'mental-salvager' },
        { name: 'Soldier', id: 'mental-soldier' },
        { name: 'Tailor', id: 'mental-tailor' },
        { name: 'Transporter', id: 'mental-transporter' },
        { name: 'Weaponsmith', id: 'mental-weaponsmith' }
      ]
    }
  ],
  social: [
    {
      title: 'Manipulation',
      skills: [
        { name: 'Barter', id: 'social-barter' },
        { name: 'Bluff', id: 'social-bluff' },
        { name: 'Diplomacy', id: 'social-diplomacy' },
        { name: 'Insight', id: 'social-insight' },
        { name: 'Intimidate', id: 'social-intimidate' },
        { name: 'Leadership', id: 'social-leadership' },
        { name: 'Streetwise', id: 'social-streetwise' }
      ]
    },
    {
      title: 'Expression',
      skills: [
        { name: 'Acting', id: 'social-acting' },
        { name: 'Comedy', id: 'social-comedy' },
        { name: 'Dancing', id: 'social-dancing' },
        { name: 'Disguise', id: 'social-disguise' },
        { name: 'Keyboard', id: 'social-keyboard' },
        { name: 'Legerdemain', id: 'social-legerdemain' },
        { name: 'Oratory', id: 'social-oratory' },
        { name: 'Percussion', id: 'social-percussion' },
        { name: 'Singing', id: 'social-singing' },
        { name: 'String', id: 'social-string' },
        { name: 'Style', id: 'social-style' },
        { name: 'Wind', id: 'social-wind' }
      ]
    }
  ],
  combat: [
    {
      title: 'Archaic',
      skills: [
        { name: 'Defense', id: 'combat-defense' },
        { name: 'Melee', id: 'combat-melee' },
        { name: 'Ranged', id: 'combat-ranged' },
        { name: 'Unarmed', id: 'combat-unarmed' }
      ]
    },
    {
      title: 'Modern',
      skills: [
        { name: 'Ballistic', id: 'combat-ballistic' },
        { name: 'Heavy Weapons', id: 'combat-heavy-weapons' }
      ]
    },
    {
      title: 'Advanced',
      skills: [
        { name: 'Energy', id: 'combat-energy' },
        { name: 'Heavy Energy', id: 'combat-heavy-energy' }
      ]
    }
  ],
  meta: [
    {
      title: null,
      skills: [
        { name: 'Attune', id: 'meta-attune' }
      ]
    },
    {
      title: 'Disciplines',
      skills: [
        { name: 'Dimension', id: 'meta-dimension' },
        { name: 'Energy', id: 'meta-energy' },
        { name: 'Entropy', id: 'meta-entropy' },
        { name: 'Illusion', id: 'meta-illusion' },
        { name: 'Matter', id: 'meta-matter' },
        { name: 'Mental', id: 'meta-mental' }
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

const SkillsTab = ({ onOpenAddSkillModal }) => {
  const { characterData, updateField } = useFolio();
  const [searchQuery, setSearchQuery] = useState('');

  const getNum = (id) => parseInt(characterData[id] || 0, 10);

  // Helper to calculate total for a skill
  const getSkillTotal = (skillId) => {
    const rank = getNum(`skill-${skillId}-rank`);
    const mod = getNum(`skill-${skillId}-mod`);
    const baseAttrKey = characterData[`skill-${skillId}-base`] || '';

    let baseAttrVal = 0;
    if (baseAttrKey) {
      const attrVal = getNum(baseAttrKey);
      const attrMod = getNum(`${baseAttrKey}-mod`);
      baseAttrVal = attrVal + attrMod;
    }

    return rank + baseAttrVal + mod;
  };

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

  // Dynamically map custom skills added by user
  const customSkillsByGroup = useMemo(() => {
    const result = { physical: [], mental: [], social: [], combat: [], meta: [] };
    Object.keys(characterData).forEach((key) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const id = key.replace('skill-', '').replace('-rank', '');
        if (!defaultSkillIds.has(id)) {
          const parts = id.split('-');
          const group = ['physical', 'mental', 'social', 'combat', 'meta'].includes(parts[0]) ? parts[0] : 'mental';
          const storedName = characterData[`skill-${id}-name`];
          const name = storedName || parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || id;
          result[group].push({ name, id });
        }
      }
    });
    return result;
  }, [characterData, defaultSkillIds]);

  const renderSkillRow = (skill) => {
    const rank = getNum(`skill-${skill.id}-rank`);
    const mod = getNum(`skill-${skill.id}-mod`);
    const baseAttr = characterData[`skill-${skill.id}-base`] || '';
    const total = getSkillTotal(skill.id);

    return (
      <div key={skill.id} className="grid grid-cols-12 items-center gap-2 py-1 px-2 bg-slate-900/50 hover:bg-slate-800/60 rounded transition-colors text-xs border border-slate-800/40">
        <span className="col-span-4 font-medium text-slate-200 truncate" title={skill.name}>
          {skill.name}
        </span>

        {/* Rank Input */}
        <input
          type="number"
          min="0"
          value={rank}
          onChange={(e) => updateField(`skill-${skill.id}-rank`, parseInt(e.target.value, 10) || 0)}
          className="col-span-2 text-center bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded py-0.5 text-slate-100 outline-none text-xs"
        />

        {/* Base Attr Select */}
        <select
          value={baseAttr}
          onChange={(e) => updateField(`skill-${skill.id}-base`, e.target.value)}
          className="col-span-3 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded py-0.5 text-slate-300 text-center outline-none text-xs"
        >
          <option value="">--</option>
          {ATTRIBUTE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Mod */}
        <span className="col-span-1 text-center font-mono text-slate-400">
          {mod}
        </span>

        {/* Total */}
        <span className="col-span-2 text-center font-mono font-bold text-cyan-300">
          {total}
        </span>
      </div>
    );
  };

  const renderCategoryCard = (key, title, colorClass, borderClass) => {
    const groupList = DEFAULT_SKILLS[key] || [];
    const customList = customSkillsByGroup[key] || [];
    const q = searchQuery.trim().toLowerCase();

    // Filter groups and skills by search query
    const filteredGroups = groupList.map((g) => {
      const matchingSkills = g.skills.filter((s) => {
        if (!q) return true;
        return s.name.toLowerCase().includes(q) || (g.title && g.title.toLowerCase().includes(q));
      });
      return { ...g, skills: matchingSkills };
    }).filter((g) => g.skills.length > 0);

    const matchingCustom = customList.filter((s) => !q || s.name.toLowerCase().includes(q));

    const totalSkillCount = filteredGroups.reduce((acc, g) => acc + g.skills.length, 0) + matchingCustom.length;

    if (q && totalSkillCount === 0) return null;

    return (
      <div key={key} className={`bg-slate-900/60 border ${borderClass} rounded-lg p-4 space-y-3 shadow-lg backdrop-blur-sm`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h4 className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>
            {title}
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
            {totalSkillCount} {totalSkillCount === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {/* Column Table Header */}
        <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 border-b border-slate-800/60 pb-1">
          <span className="col-span-4">Skill</span>
          <span className="col-span-2 text-center">Rank</span>
          <span className="col-span-3 text-center">Attr</span>
          <span className="col-span-1 text-center">Mod</span>
          <span className="col-span-2 text-center">Total</span>
        </div>

        {/* Groups */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              {group.title && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80 bg-cyan-950/40 border-l-2 border-cyan-500/60 px-2 py-0.5 rounded-r">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.skills.map(renderSkillRow)}
              </div>
            </div>
          ))}

          {/* Custom Skills Section */}
          {matchingCustom.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80 bg-amber-950/40 border-l-2 border-amber-500/60 px-2 py-0.5 rounded-r">
                Custom {title}
              </div>
              <div className="space-y-1">
                {matchingCustom.map(renderSkillRow)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-5">
      {/* Header Toolbar & Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-900/60 pb-3 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Skill Categories & Proficiency Ranks
          </h3>
          <p className="text-[11px] text-slate-400">
            Manage ranks, attribute linkages, and modifiers across all 88 skill categories.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
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
          <button
            type="button"
            onClick={onOpenAddSkillModal}
            className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0"
          >
            + Custom Skill
          </button>
        </div>
      </div>

      {/* Grid Layout for Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Physical & Mental */}
        <div className="space-y-6">
          {renderCategoryCard('physical', 'Physical Skills', 'text-emerald-400', 'border-emerald-900/50')}
          {renderCategoryCard('mental', 'Mental Skills', 'text-blue-400', 'border-blue-900/50')}
        </div>

        {/* Column 2: Social, Combat, & Meta */}
        <div className="space-y-6">
          {renderCategoryCard('social', 'Social Skills', 'text-purple-400', 'border-purple-900/50')}
          {renderCategoryCard('combat', 'Combat Skills', 'text-amber-400', 'border-amber-900/50')}
          {renderCategoryCard('meta', 'Metafocus Skills', 'text-cyan-400', 'border-cyan-900/50')}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SkillsTab);
