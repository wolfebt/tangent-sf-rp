import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Zap, Brain, Shield, Coins, BookOpen, Star } from 'lucide-react';
import { ALL_CANONICAL_SKILLS, SKILL_CATEGORY_SECTIONS } from '../../../data/skillsData';

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
  const [newModMode, setNewModMode] = useState('inherent'); // 'inherent' | 'bonus_pool' | 'choice_pool' | 'recommended'
  const [customTargetText, setCustomTargetText] = useState('');

  const handleAddModifier = () => {
    const target = (customTargetText.trim() || newModTarget.trim());
    if (!target) {
      alert('Please specify a modifier target.');
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
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
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
                  {mod.mode !== 'choice_pool' && mod.mode !== 'recommended' && (
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        isPositive
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isPositive ? `+${mod.value}` : mod.value}
                    </span>
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
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          + Add New Modifier Entry
        </div>
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
      </div>
    </div>
  );
};
