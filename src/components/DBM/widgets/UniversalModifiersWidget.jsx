import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Zap, Brain, Shield, Coins, BookOpen, Star } from 'lucide-react';
import { ALL_CANONICAL_SKILLS, SKILL_CATEGORY_SECTIONS } from '../../../data/skillsData';
import { showToast } from '../../../context/ToastContext';

export const CANONICAL_ATTRIBUTES = [
  {
    group: 'Physical Attributes',
    icon: '🏃',
    pairs: [
      { primary: 'Strength', sub: ['Might'] },
      { primary: 'Agility', sub: ['Reflex'] },
      { primary: 'Stamina', sub: ['Fortitude'] }
    ]
  },
  {
    group: 'Mental Attributes',
    icon: '🧠',
    pairs: [
      { primary: 'Intellect', sub: ['Logic'] },
      { primary: 'Wisdom', sub: ['Will'] },
      { primary: 'Charisma', sub: ['Etiquette'] }
    ]
  }
];

export const CANONICAL_SKILL_GROUPS = [
  { key: 'mental_vocations', label: 'Vocations (Art/Craft/Engineering)', shortLabel: 'Vocations', icon: '🛠️', group: 'Mental' },
  { key: 'mental_knowledges', label: 'Knowledges (Sciences/Lore)', shortLabel: 'Knowledges', icon: '📚', group: 'Mental' },
  { key: 'social_expression', label: 'Expression (Arts/Speech/Charm)', shortLabel: 'Expression', icon: '🎭', group: 'Social' },
  { key: 'social_manipulation', label: 'Manipulation (Deception/Negotiation)', shortLabel: 'Manipulation', icon: '💬', group: 'Social' },
  { key: 'physical', label: 'Physical (Athletics/Stealth/Pilot)', shortLabel: 'Physical', icon: '🏃', group: 'Physical' },
  { key: 'mental_general', label: 'Mental General (Investigation/Survival)', shortLabel: 'Mental Gen', icon: '🧠', group: 'Mental' },
  { key: 'combat_archaic', label: 'Combat: Archaic (Melee/Blades/Archery)', shortLabel: 'Combat Archaic', icon: '⚔️', group: 'Combat' },
  { key: 'combat_modern', label: 'Combat: Modern (Firearms/Tactical)', shortLabel: 'Combat Modern', icon: '🔫', group: 'Combat' },
  { key: 'combat_advanced', label: 'Combat: Advanced (Energy/Heavy/Power)', shortLabel: 'Combat Adv', icon: '⚡', group: 'Combat' },
  { key: 'meta_general', label: 'Metafocus Disciplines', shortLabel: 'Metafocus', icon: '🔮', group: 'Meta' }
];

export const UniversalModifiersWidget = ({
  modifiers = [],
  onChange = () => {},
  isEditMode = true,
  relationalData = {}
}) => {
  const currentList = Array.isArray(modifiers) ? modifiers : [];

  const [newModType, setNewModType] = useState('attribute'); // 'attribute' | 'skill' | 'feature' | 'wealth' | 'discipline' | 'stat'
  const [newModTarget, setNewModTarget] = useState('');
  const [newModValue, setNewModValue] = useState(1);
  const [newModMode, setNewModMode] = useState('inherent'); // 'inherent' | 'bonus_pool' | 'choice_pool' | 'recommended' | 'group_choice'
  const [customTargetText, setCustomTargetText] = useState('');

  // Extended Skill Modifier Builder State
  const [skillSubMode, setSkillSubMode] = useState('specific'); // 'specific' | 'group_choice' | 'choice_options'
  const [selectedSkillGroups, setSelectedSkillGroups] = useState(['mental_vocations']);
  const [maxSkillChoices, setMaxSkillChoices] = useState(2); // 1 to 4
  const [skillModifierValue, setSkillModifierValue] = useState(2); // 1 to 4
  const [optionsMode, setOptionsMode] = useState('pair'); // 'single' | 'pair'
  const [customSkillOptions, setCustomSkillOptions] = useState([
    { id: 'opt_1', skills: ['Athletics', 'Acrobatics'], label: 'Athletics & Acrobatics (+2)', value: 2 },
    { id: 'opt_2', skills: ['Stealth', 'Streetwise'], label: 'Stealth & Streetwise (+2)', value: 2 }
  ]);

  const handleToggleSkillGroup = (groupKey) => {
    setSelectedSkillGroups(prev => {
      const exists = prev.includes(groupKey);
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(k => k !== groupKey);
      }
      return [...prev, groupKey];
    });
  };

  const handleAddModifier = () => {
    // 1. Skill Group Choice Pool
    if (newModType === 'skill' && skillSubMode === 'group_choice') {
      const groupLabels = selectedSkillGroups.map(gk => {
        const found = CANONICAL_SKILL_GROUPS.find(g => g.key === gk) || SKILL_CATEGORY_SECTIONS.find(s => s.key === gk);
        return found ? (found.shortLabel || found.label || found.key).split('(')[0].replace(/^[^\w\s]+/, '').trim() : gk;
      });
      const finalTarget = customTargetText.trim() || groupLabels.join(' & ') || 'Skill Group Choice';
      const maxC = Math.min(4, Math.max(1, parseInt(maxSkillChoices, 10) || 2));
      const val = Math.min(4, Math.max(1, parseInt(skillModifierValue, 10) || 2));

      const newEntry = {
        target: finalTarget,
        type: 'skill',
        mode: 'group_choice',
        group_keys: [...selectedSkillGroups],
        group_key: selectedSkillGroups[0] || 'mental_vocations',
        group_label: finalTarget,
        max_choices: maxC,
        value: val,
        description: `Operator chooses up to ${maxC} skills from ${finalTarget} (+${val} each)`
      };

      const updated = [...currentList, newEntry];
      onChange(updated);
      setCustomTargetText('');
      return;
    }

    // 2. Skill Choice Options Pool
    if (newModType === 'skill' && skillSubMode === 'choice_options') {
      const val = Math.min(4, Math.max(1, parseInt(skillModifierValue, 10) || 2));
      const target = customTargetText.trim() || `Skill Choice Options (${customSkillOptions.length})`;
      const newEntry = {
        target,
        type: 'skill',
        mode: 'choice_pool',
        value: val,
        max_choices: 1,
        options: customSkillOptions.map(opt => ({
          ...opt,
          value: val,
          label: (opt.skills || []).join(' & ') + ` (${val >= 0 ? '+' : ''}${val})`
        })),
        description: `Choose from ${customSkillOptions.length} skill option packages`
      };

      const updated = [...currentList, newEntry];
      onChange(updated);
      setCustomTargetText('');
      return;
    }

    // 3. Standard Specific Modifier Entry
    const target = (customTargetText.trim() || newModTarget.trim());
    if (!target) {
      showToast({
        type: 'warn',
        title: 'Target Required',
        text: 'Please specify a modifier target.'
      });
      return;
    }

    const newEntry = {
      target,
      type: newModType,
      value: parseInt(newModValue, 10) || (typeof newModValue === 'number' ? newModValue : 1),
      mode: newModMode
    };

    // Check duplicate
    const existingIndex = currentList.findIndex(m => 
      m.type === newEntry.type && 
      (m.target || '').toLowerCase() === target.toLowerCase() && 
      m.mode === newEntry.mode
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...currentList];
      updated[existingIndex] = newEntry;
    } else {
      updated = [...currentList, newEntry];
    }

    onChange(updated);
    setNewModTarget('');
    setCustomTargetText('');
    setNewModValue(1);
  };

  const handleRemoveModifier = (index) => {
    const updated = currentList.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const getBadgeStyle = (mod) => {
    switch (mod.type) {
      case 'attribute':
        return 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300';
      case 'skill':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-300';
      case 'feature':
        return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
      case 'wealth':
        return 'bg-yellow-950/80 border-yellow-500/50 text-yellow-300';
      case 'discipline':
        return 'bg-purple-950/80 border-purple-500/50 text-purple-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'group_choice':
        return 'Group Choice';
      case 'bonus_pool':
        return 'Pool Points';
      case 'choice_pool':
        return 'Choice Pool';
      case 'recommended':
        return 'Recommended';
      default:
        return 'Inherent';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'attribute':
        return <Zap size={12} className="text-cyan-400" />;
      case 'skill':
        return <Brain size={12} className="text-amber-400" />;
      case 'feature':
        return <Sparkles size={12} className="text-emerald-400" />;
      case 'wealth':
        return <Coins size={12} className="text-yellow-400" />;
      case 'discipline':
        return <BookOpen size={12} className="text-purple-400" />;
      default:
        return <Star size={12} className="text-slate-400" />;
    }
  };

  if (!isEditMode) {
    if (currentList.length === 0) {
      return (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          No universal modifiers applied.
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        {currentList.map((mod, idx) => {
          const isPositive = Number(mod.value) >= 0;
          return (
            <div
              key={idx}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${getBadgeStyle(mod)}`}
            >
              {getIcon(mod.type)}
              <span className="font-bold">{mod.target}</span>
              {mod.mode === 'group_choice' ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-bold">
                  Pick {mod.max_choices || 2} at +{mod.value || 2}
                </span>
              ) : (
                <>
                  {mod.mode !== 'choice_pool' && mod.mode !== 'recommended' && (
                    <span className="font-extrabold px-1 rounded bg-black/40">
                      {isPositive ? `+${mod.value}` : mod.value}
                    </span>
                  )}
                  {mod.mode && mod.mode !== 'inherent' && (
                    <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-black/50 text-slate-400">
                      {getModeLabel(mod.mode)}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} />
          <span>Universal Modifiers Array</span>
        </span>
        <span className="text-[10px] text-slate-500">
          {currentList.length} Modifier{currentList.length === 1 ? '' : 's'} Configured
        </span>
      </div>

      {/* Existing Modifiers List */}
      <div className="space-y-1.5">
        {currentList.length === 0 ? (
          <p className="text-xs text-slate-600 italic py-2">No modifiers added yet.</p>
        ) : (
          currentList.map((mod, idx) => {
            const isPositive = Number(mod.value) >= 0;
            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {getIcon(mod.type)}
                  <span className="text-white font-bold">{mod.target}</span>
                  <span className="text-[10px] text-slate-500 uppercase">({mod.type})</span>
                  {mod.mode === 'group_choice' ? (
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[11px]">
                      Pick up to {mod.max_choices || 2} skills (+{mod.value || 2} each)
                    </span>
                  ) : (
                    mod.mode !== 'choice_pool' && mod.mode !== 'recommended' && (
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          isPositive
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {isPositive ? `+${mod.value}` : mod.value}
                      </span>
                    )
                  )}
                  {mod.mode && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {getModeLabel(mod.mode)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveModifier(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 font-bold cursor-pointer transition-colors"
                  title="Remove modifier"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Modifier Controls */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            + Add New Modifier Entry
          </div>
          {newModType === 'skill' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px]">
              <button
                type="button"
                onClick={() => setSkillSubMode('specific')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  skillSubMode === 'specific'
                    ? 'bg-amber-950 border border-amber-500/50 text-amber-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Specific Skill
              </button>
              <button
                type="button"
                onClick={() => setSkillSubMode('group_choice')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  skillSubMode === 'group_choice'
                    ? 'bg-amber-950 border border-amber-500/50 text-amber-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Skill Group Choice Pool
              </button>
              <button
                type="button"
                onClick={() => setSkillSubMode('choice_options')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  skillSubMode === 'choice_options'
                    ? 'bg-amber-950 border border-amber-500/50 text-amber-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Options Pool (Single/Pair)
              </button>
            </div>
          )}
        </div>

        {/* ── Sub-Mode A: Skill Group Choice Pool (e.g. Artistic: Vocations / Expression) ── */}
        {newModType === 'skill' && skillSubMode === 'group_choice' ? (
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={13} className="text-amber-400" />
                <span>Select Skill Group(s) for Operator Choice</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Multiple groups allowed
              </span>
            </div>

            {/* Group Toggle Pills */}
            <div className="flex flex-wrap gap-1.5">
              {CANONICAL_SKILL_GROUPS.map(grp => {
                const isSelected = selectedSkillGroups.includes(grp.key);
                return (
                  <button
                    key={grp.key}
                    type="button"
                    onClick={() => handleToggleSkillGroup(grp.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-amber-950 text-amber-100 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{grp.icon}</span>
                    <span>{grp.shortLabel}</span>
                    {isSelected && <span className="text-amber-400 text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Mechanics Controls: Max Skills (1 to 4) & Modifier Value (+1 to +4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-amber-500/20">
              {/* Max Selectable Skills */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Operator Select Limit (Max Skills: 1 to 4)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxSkillChoices(num)}
                      className={`flex-1 py-1 rounded text-xs font-bold transition-all border ${
                        maxSkillChoices === num
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {num} {num === 1 ? 'Skill' : 'Skills'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bonus Value Per Skill */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Skill Check Modifier (+1 to +4 each)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSkillModifierValue(val)}
                      className={`flex-1 py-1 rounded text-xs font-bold transition-all border ${
                        skillModifierValue === val
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Label & Add Button */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTargetText}
                onChange={e => setCustomTargetText(e.target.value)}
                placeholder="Optional custom label (e.g. Vocations & Expression)"
                className="flex-1 bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddModifier}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md"
              >
                <Plus size={13} />
                <span>Add Skill Group Choice</span>
              </button>
            </div>
          </div>
        ) : newModType === 'skill' && skillSubMode === 'choice_options' ? (
          /* ── Sub-Mode B: Skill Choice Options Pool (Single / Pair) ── */
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={13} className="text-amber-400" />
                <span>Preconfigured Skill Choices / Pairs</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Bonus:</span>
                {[1, 2, 3, 4].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSkillModifierValue(v)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      skillModifierValue === v
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {customSkillOptions.map((opt, optIdx) => (
                <div key={opt.id} className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold w-4">#{optIdx + 1}</span>
                  <select
                    value={opt.skills[0] || ''}
                    onChange={e => {
                      const updated = [...customSkillOptions];
                      const sks = [...(opt.skills || [])];
                      sks[0] = e.target.value;
                      updated[optIdx] = { ...opt, skills: sks, label: sks.join(' & ') + ` (+${skillModifierValue})` };
                      setCustomSkillOptions(updated);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white p-1.5 rounded text-xs outline-none focus:border-amber-500"
                  >
                    <option value="">-- Skill 1 --</option>
                    {ALL_CANONICAL_SKILLS.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  <span className="text-[10px] text-slate-500">&amp;</span>

                  <select
                    value={opt.skills[1] || ''}
                    onChange={e => {
                      const updated = [...customSkillOptions];
                      const sks = [...(opt.skills || [])];
                      sks[1] = e.target.value;
                      updated[optIdx] = { ...opt, skills: sks, label: sks.join(' & ') + ` (+${skillModifierValue})` };
                      setCustomSkillOptions(updated);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white p-1.5 rounded text-xs outline-none focus:border-amber-500"
                  >
                    <option value="">-- Skill 2 --</option>
                    {ALL_CANONICAL_SKILLS.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setCustomSkillOptions(prev => prev.filter(o => o.id !== opt.id))}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Remove option"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCustomSkillOptions(prev => [
                  ...prev,
                  {
                    id: `opt_${Date.now()}`,
                    skills: ['Athletics', 'Stealth'],
                    label: `Athletics & Stealth (+${skillModifierValue})`,
                    value: skillModifierValue
                  }
                ])}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus size={12} />
                <span>+ Add Choice Option Package</span>
              </button>

              <button
                type="button"
                onClick={handleAddModifier}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus size={13} />
                <span>Add Skill Options Modifier</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Standard Entry Row (Attributes, Specific Skill, Features, Wealth, Disciplines, Combat Stats) ── */
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            {/* Modifier Type */}
            <div className="sm:col-span-3">
              <select
                value={newModType}
                onChange={e => {
                  setNewModType(e.target.value);
                  setNewModTarget('');
                  setCustomTargetText('');
                }}
                className="w-full bg-slate-900 border border-slate-700 text-cyan-300 p-2 rounded text-xs outline-none focus:border-cyan-500 font-bold"
              >
                <option value="attribute">⚡ Attribute</option>
                <option value="skill">🧠 Skill</option>
                <option value="feature">✨ Feature</option>
                <option value="wealth">💰 Wealth</option>
                <option value="discipline">🔮 Discipline</option>
                <option value="stat">📊 Combat Stat</option>
              </select>
            </div>

            {/* Modifier Target Picker */}
            <div className="sm:col-span-4">
              {newModType === 'attribute' ? (
                <select
                  value={newModTarget}
                  onChange={e => setNewModTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-500"
                >
                  <option value="">-- Select Attribute --</option>
                  <option value="Any Attribute">Any Attribute (General)</option>
                  <option value="Any Primary Attribute">Any Primary Attribute</option>
                  <option value="Any Sub-Attribute">Any Sub-Attribute</option>
                  {CANONICAL_ATTRIBUTES.map(sec => (
                    <optgroup key={sec.group} label={`${sec.icon} ${sec.group}`}>
                      {sec.pairs.map(pair => (
                        <React.Fragment key={pair.primary}>
                          <option value={pair.primary}>{pair.primary} (Primary)</option>
                          {pair.sub.map(sub => (
                            <option key={sub} value={sub}>&nbsp;&nbsp;&nbsp;&nbsp;↳ {sub} (Sub-Attribute)</option>
                          ))}
                        </React.Fragment>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : newModType === 'skill' ? (
                <select
                  value={newModTarget}
                  onChange={e => setNewModTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                >
                  <option value="">-- Select Skill --</option>
                  <option value="General Skill Pool">General Skill Pool</option>
                  <option value="Any Mental Skill">Any Mental Skill</option>
                  <option value="Any Physical Skill">Any Physical Skill</option>
                  <option value="Any Social Skill">Any Social Skill</option>
                  <option value="Any Combat Skill">Any Combat Skill</option>
                  {SKILL_CATEGORY_SECTIONS.map(section => (
                    <optgroup key={section.key} label={section.label}>
                      {section.skills.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </optgroup>
                  ))}
                  {(relationalData['skills'] || []).map(s => {
                    const name = s.name || s.id;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              ) : newModType === 'feature' ? (
                <input
                  type="text"
                  placeholder="E.g. Awakened (Arcane), Acute Senses..."
                  value={customTargetText || newModTarget}
                  onChange={e => {
                    setCustomTargetText(e.target.value);
                    setNewModTarget(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-emerald-500"
                />
              ) : newModType === 'wealth' ? (
                <select
                  value={newModTarget || 'Wealth Score'}
                  onChange={e => setNewModTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-yellow-500"
                >
                  <option value="Wealth Score">Wealth Score</option>
                  <option value="Starting Credits">Starting Credits</option>
                  <option value="Monthly Stipend">Monthly Stipend</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Target Name..."
                  value={customTargetText || newModTarget}
                  onChange={e => {
                    setCustomTargetText(e.target.value);
                    setNewModTarget(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-500"
                />
              )}
            </div>

            {/* Mode */}
            <div className="sm:col-span-2">
              <select
                value={newModMode}
                onChange={e => setNewModMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-2 rounded text-xs outline-none focus:border-cyan-500"
              >
                <option value="inherent">Inherent</option>
                <option value="bonus_pool">Pool Points</option>
                <option value="choice_pool">Choice Pool</option>
                <option value="recommended">Recommended</option>
              </select>
            </div>

            {/* Value */}
            <div className="sm:col-span-1">
              <input
                type="number"
                min="-20"
                max="100"
                value={newModValue}
                onChange={e => setNewModValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-500 font-mono text-center"
                placeholder="1"
              />
            </div>

            {/* Add Button */}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddModifier}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
