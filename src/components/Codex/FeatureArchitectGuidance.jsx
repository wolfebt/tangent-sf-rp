import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Plus, 
  X, 
  Compass, 
  Tag, 
  ShieldAlert, 
  Ban, 
  Layers, 
  Zap, 
  CheckCircle2,
  Award,
  Sliders,
  Repeat,
  TrendingUp,
  Shuffle,
  Target,
  ListFilter,
  Brain
} from 'lucide-react';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';
import { CANONICAL_SKILL_GROUPS } from '../DBM/widgets/UniversalModifiersWidget';

export const ACQUISITION_TYPE_OPTIONS = [
  {
    id: 'Basic',
    label: 'Basic',
    shortDesc: 'Single Purchase',
    description: 'Typical feature only needs one purchase for effect.',
    icon: CheckCircle2,
    badgeColor: 'border-slate-700 bg-slate-900/80 text-slate-300',
    activeColor: 'border-cyan-500 bg-cyan-950/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
  },
  {
    id: 'Multiple',
    label: 'Multiple',
    shortDesc: 'Different Asset Per Purchase',
    description: 'By taking the feature an additional time it can grant the effect to a different asset per additional purchase.',
    icon: Repeat,
    badgeColor: 'border-blue-700 bg-blue-950/60 text-blue-300',
    activeColor: 'border-blue-500 bg-blue-950/90 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
  },
  {
    id: 'Staged',
    label: 'Staged',
    shortDesc: 'Increases Effect Per Purchase',
    description: 'By taking the feature an additional time it will increase the effect to the asset per additional purchase.',
    icon: TrendingUp,
    badgeColor: 'border-amber-700 bg-amber-950/60 text-amber-300',
    activeColor: 'border-amber-500 bg-amber-950/90 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
  },
  {
    id: 'Multi/Staged',
    label: 'Multi/Staged',
    shortDesc: 'Both Asset Choice & Scaling',
    description: 'Both able to purchase for a different asset to effect OR increase the effect on the asset per additional purchases.',
    icon: Shuffle,
    badgeColor: 'border-purple-700 bg-purple-950/60 text-purple-300',
    activeColor: 'border-purple-500 bg-purple-950/90 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
  }
];

/**
 * Normalizes input list into an array of clean string labels.
 */
const normalizeList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(item => (typeof item === 'object' && item !== null ? (item.name || item.title || item.id || `Level ${item.level}`) : String(item))).filter(Boolean);
  }
  if (typeof val === 'number') {
    return [`Level ${val}`];
  }
  if (typeof val === 'string') {
    return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const CANONICAL_TL_QUICK_OPTIONS = [
  { level: 0, label: 'TL 0', title: 'Stone Age / Primitive' },
  { level: 1, label: 'TL 1', title: 'Metal Age / Industrial' },
  { level: 2, label: 'TL 2', title: 'Data Age / Digital' },
  { level: 3, label: 'TL 3', title: 'Space Age / Stellar' },
  { level: 4, label: 'TL 4', title: 'Stellar Age / Galactic' },
  { level: 5, label: 'TL 5', title: 'Cosmological / Singularity' }
];

const CANONICAL_ML_QUICK_OPTIONS = [
  { level: 0, label: 'ML 0', title: 'Dormant / Mundane' },
  { level: 1, label: 'ML 1', title: 'Latent / Awakening' },
  { level: 2, label: 'ML 2', title: 'Manifested / Awakened' },
  { level: 3, label: 'ML 3', title: 'Adept / Resonant' },
  { level: 4, label: 'ML 4', title: 'Master / Conduit' },
  { level: 5, label: 'ML 5', title: 'Transcendent / Ascendant' }
];

/**
 * FeatureArchitectGuidance
 * Renders recommended Tech Level (TL) and Meta Level (ML) operational thresholds,
 * plus guidance keywords (+weight) and negative railguards (-weight / exclusions)
 * in Feature Studio / Relations page.
 */
export const FeatureArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newTlInput, setNewTlInput] = useState('');
  const [newMlInput, setNewMlInput] = useState('');

  const recommendedTl = useMemo(() => normalizeList(formData.recommended_tl), [formData.recommended_tl]);
  const recommendedMl = useMemo(() => normalizeList(formData.recommended_ml), [formData.recommended_ml]);

  // Tech Level handlers
  const handleToggleTlOption = (optionLabel) => {
    if (!isEditMode) return;
    const exists = recommendedTl.some(t => t.toLowerCase() === optionLabel.toLowerCase() || t === optionLabel.replace('TL ', ''));
    if (exists) {
      handleFieldChange('recommended_tl', recommendedTl.filter(t => t.toLowerCase() !== optionLabel.toLowerCase() && t !== optionLabel.replace('TL ', '')));
    } else {
      handleFieldChange('recommended_tl', [...recommendedTl, optionLabel]);
    }
  };

  const handleAddTl = (e) => {
    if (e) e.preventDefault();
    const parts = newTlInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedTl];
    for (const part of parts) {
      if (!next.some(t => t.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_tl', next);
    setNewTlInput('');
  };

  const handleRemoveTl = (val) => {
    handleFieldChange('recommended_tl', recommendedTl.filter(t => t !== val));
  };

  // Meta Level handlers
  const handleToggleMlOption = (optionLabel) => {
    if (!isEditMode) return;
    const exists = recommendedMl.some(m => m.toLowerCase() === optionLabel.toLowerCase() || m === optionLabel.replace('ML ', ''));
    if (exists) {
      handleFieldChange('recommended_ml', recommendedMl.filter(m => m.toLowerCase() !== optionLabel.toLowerCase() && m !== optionLabel.replace('ML ', '')));
    } else {
      handleFieldChange('recommended_ml', [...recommendedMl, optionLabel]);
    }
  };

  const handleAddMl = (e) => {
    if (e) e.preventDefault();
    const parts = newMlInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedMl];
    for (const part of parts) {
      if (!next.some(m => m.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_ml', next);
    setNewMlInput('');
  };

  const handleRemoveMl = (val) => {
    handleFieldChange('recommended_ml', recommendedMl.filter(m => m !== val));
  };

  // Keywords & Negative Keywords (Directives / Railguards)
  const keywordsList = useMemo(() => {
    if (!formData.keywords) return [];
    if (Array.isArray(formData.keywords)) return formData.keywords;
    return String(formData.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean);
  }, [formData.keywords]);

  const negativeKeywordsList = useMemo(() => {
    if (!formData.negative_keywords) return [];
    if (Array.isArray(formData.negative_keywords)) return formData.negative_keywords;
    return String(formData.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean);
  }, [formData.negative_keywords]);

  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newKeywordInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = keywordsList;
    const updated = [...current];
    for (const p of parts) {
      if (!updated.some(k => k.toLowerCase() === p.toLowerCase())) {
        updated.push(p);
      }
    }
    handleFieldChange('keywords', updated.join(', '));
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (tagToRemove) => {
    const updated = keywordsList.filter(k => k.toLowerCase() !== tagToRemove.toLowerCase());
    handleFieldChange('keywords', updated.join(', '));
  };

  const handleAddNegativeKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newNegativeInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = negativeKeywordsList;
    const updated = [...current];
    for (const p of parts) {
      if (!updated.some(k => k.toLowerCase() === p.toLowerCase())) {
        updated.push(p);
      }
    }
    handleFieldChange('negative_keywords', updated.join(', '));
    setNewNegativeInput('');
  };

  const handleRemoveNegativeKeyword = (tagToRemove) => {
    const updated = negativeKeywordsList.filter(k => k.toLowerCase() !== tagToRemove.toLowerCase());
    handleFieldChange('negative_keywords', updated.join(', '));
  };

  // ── Skill Modifier & Choice Options Configurator State & Handlers ──
  const modifierOptions = useMemo(() => {
    const raw = formData.modifier_options;
    if (raw && typeof raw === 'object') {
      return {
        enabled: Boolean(raw.enabled),
        mode: raw.mode === 'group_pool' ? 'group_pool' : (raw.mode === 'pair' ? 'pair' : 'single'),
        group_keys: Array.isArray(raw.group_keys) ? raw.group_keys : (raw.group_key ? [raw.group_key] : ['mental_vocations']),
        group_label: raw.group_label || 'Vocations & Expression',
        max_skills: typeof raw.max_skills === 'number' ? raw.max_skills : 2,
        value: typeof raw.value === 'number' ? raw.value : (parseInt(raw.value, 10) || 2),
        options: Array.isArray(raw.options) ? raw.options : []
      };
    }
    return {
      enabled: false,
      mode: 'single',
      group_keys: ['mental_vocations'],
      group_label: 'Mental - Vocations',
      max_skills: 2,
      value: 2,
      options: []
    };
  }, [formData.modifier_options]);

  const updateModifierOptions = (updater) => {
    if (!isEditMode) return;
    const next = typeof updater === 'function' ? updater(modifierOptions) : updater;
    handleFieldChange('modifier_options', next);

    // Keep formData.modifiers synchronized when group_pool is active
    if (next.enabled && next.mode === 'group_pool') {
      const currentMods = Array.isArray(formData.modifiers) ? [...formData.modifiers] : [];
      const otherMods = currentMods.filter(m => !(m.type === 'skill' && (m.mode === 'group_choice' || m.group_key || m.group_keys)));
      const groupLabel = next.group_label || next.group_keys.join(' & ');
      const newMod = {
        target: groupLabel,
        type: 'skill',
        mode: 'group_choice',
        group_keys: next.group_keys,
        group_key: next.group_keys[0] || 'mental_vocations',
        group_label: groupLabel,
        max_choices: next.max_skills || 2,
        value: next.value || 2,
        description: `Choose up to ${next.max_skills || 2} skills from ${groupLabel} (+${next.value || 2} each)`
      };
      handleFieldChange('modifiers', [...otherMods, newMod]);
    }
  };

  const handleToggleOptionsEnabled = () => {
    updateModifierOptions(prev => ({
      ...prev,
      enabled: !prev.enabled,
      // If enabling for first time and empty, supply initial default option
      options: (!prev.enabled && prev.options.length === 0)
        ? [{ id: `opt_${Date.now()}`, label: 'Stealth (+2)', skills: ['Stealth'], value: prev.value || 2 }]
        : prev.options
    }));
  };

  const handleSetOptionsMode = (mode) => {
    updateModifierOptions(prev => {
      const isPair = mode === 'pair';
      const updatedOpts = prev.options.map(opt => {
        const skills = Array.isArray(opt.skills) ? [...opt.skills] : (opt.skill ? [opt.skill] : []);
        if (isPair && skills.length < 2) {
          skills.push('Athletics');
        } else if (!isPair && skills.length > 1) {
          skills.splice(1);
        }
        const val = opt.value ?? prev.value ?? 2;
        const valStr = val >= 0 ? `+${val}` : `${val}`;
        return {
          ...opt,
          skills,
          label: `${skills.join(' & ')} (${valStr})`
        };
      });
      return {
        ...prev,
        mode,
        options: updatedOpts
      };
    });
  };

  const handleToggleGroupKey = (groupKey) => {
    updateModifierOptions(prev => {
      const current = prev.group_keys || ['mental_vocations'];
      const exists = current.includes(groupKey);
      let updated;
      if (exists) {
        if (current.length === 1) return prev; // keep at least 1
        updated = current.filter(k => k !== groupKey);
      } else {
        updated = [...current, groupKey];
      }
      const labels = updated.map(gk => {
        const f = CANONICAL_SKILL_GROUPS.find(g => g.key === gk);
        return f ? f.shortLabel : gk;
      });
      return {
        ...prev,
        group_keys: updated,
        group_label: labels.join(' & ')
      };
    });
  };

  const handleSetMaxSkills = (num) => {
    const clamped = Math.min(4, Math.max(1, parseInt(num, 10) || 2));
    updateModifierOptions(prev => ({
      ...prev,
      max_skills: clamped
    }));
  };

  const handleSetDefaultValue = (val) => {
    const num = Math.min(4, Math.max(1, parseInt(val, 10) || 2));
    updateModifierOptions(prev => ({
      ...prev,
      value: num,
      options: prev.options.map(o => ({
        ...o,
        value: num,
        label: `${(o.skills || []).join(' & ')} (${num >= 0 ? '+' : ''}${num})`
      }))
    }));
  };

  const handleAddOption = () => {
    updateModifierOptions(prev => {
      const isPair = prev.mode === 'pair';
      const defaultSkills = isPair ? ['Athletics', 'Acrobatics'] : ['Athletics'];
      const val = prev.value ?? 2;
      const valStr = val >= 0 ? `+${val}` : `${val}`;
      const newOpt = {
        id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        skills: defaultSkills,
        value: val,
        label: `${defaultSkills.join(' & ')} (${valStr})`
      };
      return {
        ...prev,
        options: [...prev.options, newOpt]
      };
    });
  };

  const handleRemoveOption = (optId) => {
    updateModifierOptions(prev => ({
      ...prev,
      options: prev.options.filter(o => o.id !== optId)
    }));
  };

  const handleUpdateOptionSkill = (optId, skillIndex, newSkillName) => {
    updateModifierOptions(prev => {
      const updatedOpts = prev.options.map(opt => {
        if (opt.id !== optId) return opt;
        const skills = Array.isArray(opt.skills) ? [...opt.skills] : (opt.skill ? [opt.skill] : []);
        skills[skillIndex] = newSkillName;
        const val = opt.value ?? prev.value ?? 2;
        const valStr = val >= 0 ? `+${val}` : `${val}`;
        return {
          ...opt,
          skills,
          label: `${skills.filter(Boolean).join(' & ')} (${valStr})`
        };
      });
      return {
        ...prev,
        options: updatedOpts
      };
    });
  };

  const handleUpdateOptionLabel = (optId, newLabel) => {
    updateModifierOptions(prev => ({
      ...prev,
      options: prev.options.map(opt => opt.id === optId ? { ...opt, label: newLabel } : opt)
    }));
  };

  return (
    <div className="space-y-6 pt-2 animate-fade-in">
      {/* ── Guidance Header Banner ── */}
      <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0 shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                BASTION v2.4
              </span>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">
                Feature Architect Relations
              </span>
            </div>
            <h3 className="text-sm font-mono font-bold text-white mt-0.5">
              Operational Calibrations & Thematic Guidance
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Define acquisition scaling models, compatible Tech Level (TL) and Meta Level (ML) operational eras, along with AI directives and negative railguards.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-purple-300/80 bg-purple-900/30 border border-purple-500/30 px-3 py-1.5 rounded-xl shrink-0">
          Cortex Dynamic Register
        </div>
      </div>

      {/* ── Feature Acquisition & Scaling Model (Basic / Multiple / Staged / Multi/Staged) ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Sliders size={14} className="text-cyan-400" />
            <span>Feature Acquisition & Scaling Model</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Rules Standard: Basic • Multiple • Staged • Multi/Staged
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ACQUISITION_TYPE_OPTIONS.map((opt) => {
            const OptionIcon = opt.icon;
            const currentAcq = formData.acquisition_type || (
              formData.multi && formData.staged ? 'Multi/Staged' :
              formData.staged ? 'Staged' :
              formData.multi ? 'Multiple' : 'Basic'
            );
            const isSelected = currentAcq === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={!isEditMode}
                onClick={() => {
                  if (!isEditMode) return;
                  const isMulti = opt.id === 'Multiple' || opt.id === 'Multi/Staged';
                  const isStaged = opt.id === 'Staged' || opt.id === 'Multi/Staged';
                  handleFieldChange('acquisition_type', opt.id);
                  handleFieldChange('multi', isMulti);
                  handleFieldChange('staged', isStaged);
                  handleFieldChange('is_multiple', isMulti);
                  handleFieldChange('is_ranked', isStaged);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  isSelected
                    ? `${opt.activeColor} ring-1 ring-white/20`
                    : isEditMode
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850 cursor-pointer text-slate-400'
                      : 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-default'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <OptionIcon size={15} className={isSelected ? 'text-white' : 'text-slate-400'} />
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-100">
                        {opt.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-0.5">
                        <CheckCircle2 size={12} />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 mb-1">
                    {opt.shortDesc}
                  </div>
                  <p className="text-[11px] font-sans text-slate-300 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Skill Modifier & Choice Options Configurator ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              Skill Modifier & Choice Options Configurator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500">
              Grant modifiers to a selectable skill or skill pair
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-mono font-bold text-slate-300">
                {modifierOptions.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <input
                type="checkbox"
                disabled={!isEditMode}
                checked={modifierOptions.enabled}
                onChange={handleToggleOptionsEnabled}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {modifierOptions.enabled ? (
          <div className="space-y-4 animate-fade-in">
            {/* Top configuration row: Mode (Single vs Pair) and Default Modifier Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              {/* Mode Selection */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <ListFilter size={12} className="text-amber-400" />
                  <span>Selection Scope Mode</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleSetOptionsMode('single')}
                    className={`flex-1 min-w-[100px] py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      modifierOptions.mode === 'single'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1 Skill (Single)
                  </button>
                  <button
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleSetOptionsMode('pair')}
                    className={`flex-1 min-w-[100px] py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      modifierOptions.mode === 'pair'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Skill Pair (2)
                  </button>
                  <button
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleSetOptionsMode('group_pool')}
                    className={`flex-1 min-w-[140px] py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      modifierOptions.mode === 'group_pool'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Skill Group Pool
                  </button>
                </div>
              </div>

              {/* Modifier Value */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Zap size={12} className="text-amber-400" />
                  <span>Skill Check Adjustment Value</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(v => (
                    <button
                      key={v}
                      type="button"
                      disabled={!isEditMode}
                      onClick={() => handleSetDefaultValue(v)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                        modifierOptions.value === v
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      +{v}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 ml-auto">
                    <span className="text-[10px] font-mono text-slate-500">Custom:</span>
                    <input
                      type="number"
                      disabled={!isEditMode}
                      value={modifierOptions.value}
                      onChange={(e) => handleSetDefaultValue(e.target.value)}
                      className="w-12 bg-transparent text-xs font-mono font-bold text-amber-300 outline-none text-right"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* If mode is group_pool: render Skill Group Pool builder */}
            {modifierOptions.mode === 'group_pool' ? (
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain size={14} className="text-amber-400" />
                    <span>Skill Group Selection (Operator Multi-Select)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Select 1 or more categories
                  </span>
                </div>

                {/* Group Selector Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {CANONICAL_SKILL_GROUPS.map(grp => {
                    const isSelected = (modifierOptions.group_keys || []).includes(grp.key);
                    return (
                      <button
                        key={grp.key}
                        type="button"
                        disabled={!isEditMode}
                        onClick={() => handleToggleGroupKey(grp.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span>{grp.icon}</span>
                        <span>{grp.shortLabel}</span>
                        {isSelected && <span className="text-amber-400 text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Max Skills Stepper & Group Display Label */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Operator Choice Limit (Max Skills: 1 to 4)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          disabled={!isEditMode}
                          onClick={() => handleSetMaxSkills(num)}
                          className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-all ${
                            (modifierOptions.max_skills || 2) === num
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {num} {num === 1 ? 'Skill' : 'Skills'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Display Group Title
                    </label>
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={modifierOptions.group_label || ''}
                      onChange={e => updateModifierOptions(prev => ({ ...prev, group_label: e.target.value }))}
                      placeholder="e.g. Vocations & Expression"
                      className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-white p-1.5 rounded outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Live Preview Info Banner */}
                <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-200/90 flex items-center gap-2">
                  <Target size={14} className="text-amber-400 shrink-0" />
                  <span>
                    Operator chooses up to <strong className="text-amber-300">{modifierOptions.max_skills || 2}</strong> skills from <strong className="text-white">{modifierOptions.group_label || 'Selected Groups'}</strong> to receive a <strong className="text-amber-300">+{modifierOptions.value || 2}</strong> bonus on skill checks.
                  </span>
                </div>
              </div>
            ) : (
              /* Configured Choice Options List (Single / Pair) */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Configured Choices ({modifierOptions.options.length})
                  </span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Choice Option</span>
                    </button>
                  )}
                </div>

                {modifierOptions.options.length === 0 ? (
                  <div className="p-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
                    No choice options configured yet. Click "+ Add Choice Option" to specify skills.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {modifierOptions.options.map((opt, optIdx) => {
                      const isPair = modifierOptions.mode === 'pair';
                      const skills = Array.isArray(opt.skills) ? opt.skills : (opt.skill ? [opt.skill] : []);
                      const skill1 = skills[0] || '';
                      const skill2 = skills[1] || '';

                      return (
                        <div
                          key={opt.id || optIdx}
                          className="p-2.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs transition-all"
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {optIdx + 1}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 shrink-0">
                              {opt.value >= 0 ? `+${opt.value}` : opt.value}
                            </span>
                          </div>

                          {/* Skill Selectors */}
                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <select
                              disabled={!isEditMode}
                              value={skill1}
                              onChange={(e) => handleUpdateOptionSkill(opt.id, 0, e.target.value)}
                              className="flex-1 min-w-[130px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-medium focus:border-amber-400 outline-none"
                            >
                              <option value="" disabled>Select Skill 1...</option>
                              {ALL_CANONICAL_SKILLS.map((sk) => (
                                <option key={sk.id || sk.name} value={sk.name}>
                                  {sk.name} ({sk.subcategory || sk.group})
                                </option>
                              ))}
                            </select>

                            {isPair && (
                              <>
                                <span className="text-[10px] font-mono text-slate-500 font-bold">&amp;</span>
                                <select
                                  disabled={!isEditMode}
                                  value={skill2}
                                  onChange={(e) => handleUpdateOptionSkill(opt.id, 1, e.target.value)}
                                  className="flex-1 min-w-[130px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-medium focus:border-amber-400 outline-none"
                                >
                                  <option value="" disabled>Select Skill 2...</option>
                                  {ALL_CANONICAL_SKILLS.map((sk) => (
                                    <option key={sk.id || sk.name} value={sk.name}>
                                      {sk.name} ({sk.subcategory || sk.group})
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}

                            {/* Editable Label */}
                            <input
                              type="text"
                              disabled={!isEditMode}
                              value={opt.label || ''}
                              onChange={(e) => handleUpdateOptionLabel(opt.id, e.target.value)}
                              placeholder="Display Label"
                              className="w-40 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:border-amber-400 outline-none"
                              title="Label shown to the operator in Folio"
                            />
                          </div>

                          {/* Actions */}
                          {isEditMode && (
                            <div className="flex items-center gap-1 shrink-0 justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(opt.id)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                title="Delete this choice option"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 font-sans">
            By default, features with static modifiers apply directly to their target attributes or skills without requiring player selection. Enable this configurator if this feature grants a bonus to an operator-chosen skill or skill pair.
          </p>
        )}
      </div>

      {/* ── Operational Era & Resonance Recommendations (TL & ML) ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            <Layers size={14} className="text-purple-400" />
            <span>Operational Era & Resonance Recommendations (TL & ML)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Pulls from Cortex Compendium
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Recommended Tech Level (TL) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-purple-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Recommended Tech Level (TL)
                </span>
              </div>

              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({
                    source: 'technology',
                    target: 'recommended_tl',
                    label: 'Recommended Tech Levels (TL)'
                  })}
                  className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                  title="Browse Cortex Technology database"
                >
                  <Compass size={12} />
                  <span>Browse Cortex</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Specifies the technological sophistication eras where this feature naturally functions (TL 0 Archaic to TL 5 Cosmological).
            </p>

            {/* Quick Toggle Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CANONICAL_TL_QUICK_OPTIONS.map((opt) => {
                const isSelected = recommendedTl.some(t => t.toLowerCase() === opt.label.toLowerCase() || t === String(opt.level) || t === `TL ${opt.level}`);
                return (
                  <button
                    key={opt.level}
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleToggleTlOption(opt.label)}
                    title={opt.title}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all border ${
                      isSelected
                        ? 'bg-purple-950 text-purple-200 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : isEditMode
                          ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
                          : 'bg-slate-950/40 text-slate-600 border-slate-850 cursor-default'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="ml-1 text-purple-400">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current Active Tags Display */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {recommendedTl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  Universal / Era Agnostic (No strict TL bounds)
                </span>
              ) : (
                recommendedTl.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/60 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-mono"
                  >
                    <span>{item}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTl(item)}
                        className="text-purple-400 hover:text-purple-100 cursor-pointer"
                        title={`Remove ${item}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Custom Input */}
            {isEditMode && (
              <form onSubmit={handleAddTl} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTlInput}
                  onChange={(e) => setNewTlInput(e.target.value)}
                  placeholder="Add custom TL (e.g. TL 3+, TL 4-5)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={!newTlInput.trim()}
                  className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>

          {/* 2. Recommended Meta Level (ML) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-purple-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Recommended Meta Level (ML)
                </span>
              </div>

              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({
                    source: 'meta_level',
                    target: 'recommended_ml',
                    label: 'Recommended Meta Levels (ML)'
                  })}
                  className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                  title="Browse Cortex Meta Level database"
                >
                  <Compass size={12} />
                  <span>Browse Cortex</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Specifies the arcane, psionic, or reality-warping frequency resonance (ML 0 Mundane to ML 5 Transcendent).
            </p>

            {/* Quick Toggle Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CANONICAL_ML_QUICK_OPTIONS.map((opt) => {
                const isSelected = recommendedMl.some(m => m.toLowerCase() === opt.label.toLowerCase() || m === String(opt.level) || m === `ML ${opt.level}`);
                return (
                  <button
                    key={opt.level}
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleToggleMlOption(opt.label)}
                    title={opt.title}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all border ${
                      isSelected
                        ? 'bg-purple-950 text-purple-200 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : isEditMode
                          ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
                          : 'bg-slate-950/40 text-slate-600 border-slate-850 cursor-default'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="ml-1 text-purple-400">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current Active Tags Display */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {recommendedMl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  Non-Resonant / Any ML (No strict Meta Level bounds)
                </span>
              ) : (
                recommendedMl.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/60 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-mono"
                  >
                    <span>{item}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMl(item)}
                        className="text-purple-400 hover:text-purple-100 cursor-pointer"
                        title={`Remove ${item}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Custom Input */}
            {isEditMode && (
              <form onSubmit={handleAddMl} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newMlInput}
                  onChange={(e) => setNewMlInput(e.target.value)}
                  placeholder="Add custom ML (e.g. ML 0-1, ML 2+)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={!newMlInput.trim()}
                  className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Directives & Negative Railguards ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            <Tag size={14} className="text-purple-400" />
            <span>AI Guidance Directives & Negative Railguards</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Open User Entry • Fully Searchable in Cortex & Vector RAG
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Keywords */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <Tag size={14} />
                <span>Search Keywords & Positive Directives</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                +Weight in BASTION AI & RAG
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Open terms that reinforce this feature in character generation, archetype matching, and semantic search.
            </p>

            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {keywordsList.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No keywords assigned. Enter open terms below.
                </span>
              ) : (
                keywordsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-lg text-xs font-mono"
                  >
                    <span>{tag}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(tag)}
                        className="text-emerald-400 hover:text-emerald-100 cursor-pointer"
                        title={`Remove ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {isEditMode && (
              <form onSubmit={handleAddKeyword} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Type keywords (e.g. reflex, combat, defensive, speed)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!newKeywordInput.trim()}
                  className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Negative Keywords & Railguards */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase">
                <Ban size={14} />
                <span>Negative Railguards & Disfavored Contexts</span>
              </label>
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950/80 border border-rose-500/30 px-2 py-0.5 rounded">
                -Weight / Strict Exclusions
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Railguards preventing the AI or operator from recommending this feature in contradictory concepts or settings.
            </p>

            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {negativeKeywordsList.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No negative railguards defined. Enter disfavored terms below.
                </span>
              ) : (
                negativeKeywordsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-lg text-xs font-mono"
                  >
                    <span>{tag}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNegativeKeyword(tag)}
                        className="text-rose-400 hover:text-rose-100 cursor-pointer"
                        title={`Remove ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {isEditMode && (
              <form onSubmit={handleAddNegativeKeyword} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newNegativeInput}
                  onChange={(e) => setNewNegativeInput(e.target.value)}
                  placeholder="Type railguards (e.g. primitive, magic, heavy armor, brute force)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  disabled={!newNegativeInput.trim()}
                  className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
