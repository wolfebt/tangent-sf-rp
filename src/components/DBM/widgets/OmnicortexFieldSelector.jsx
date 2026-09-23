import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Brain, 
  Sparkles, 
  Plus, 
  X, 
  ExternalLink, 
  Shield, 
  Activity, 
  Compass, 
  Search, 
  Trash2,
  ChevronRight,
  Dna,
  Info
} from 'lucide-react';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';
import { DEFAULT_FEATURES } from '../../../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { SPECIES_MOVEMENT_MODES, SPECIES_MOVEMENT_GROUPS, resolveMovementId } from '../../../engines/tangentConstants';
import { DEFAULT_SPECIES_MOVEMENT, getMovementById } from '../../../data/speciesMovementData';
import { 
  OmnicortexTooltip, 
  TraitTooltipCard, 
  SkillSummaryCard, 
  FeatureSummaryCard, 
  AttributeModifierSummaryCard, 
  MovementModeSummaryCard, 
  SocialStigmaSummaryCard 
} from '../../Codex/SpeciesStudioTooltips';

export const CANONICAL_ATTRIBUTES = [
  'Strength',
  'Agility',
  'Stamina',
  'Intellect',
  'Wisdom',
  'Charisma',
  'Might',
  'Reflex',
  'Fortitude',
  'Logic',
  'Will',
  'Etiquette'
];

export const CANONICAL_STIGMAS = [
  'None',
  'Minor Xeno (-1)',
  'Xeno (-2)',
  'Severe Xeno (-4)',
  'Extreme Xeno (-6)',
  'Synthetic (-2)',
  'Severe Synthetic (-4)',
  'Feral (-4)',
  'Monstrous (-4)',
  'Monstrous Extreme (-6)',
  'Shifter (-2)',
  'Dragonkin (-4)',
  'Fey (-2)',
  'Seclusionist (-1)',
  'Synthetic (-2), Severe Xeno (-6)',
  'Shifter (-2), Xeno (-2)',
  'Dragonkin (-4), Xeno (-2)',
  'Synthetic (-2), Xeno (-2)',
  'Monstrous (-4), Xeno (-2)'
];

/**
 * 1. ATTRIBUTE MODIFIERS SELECTOR
 */
export const AttributeModifiersSelector = ({
  value = [],
  onChange = () => {},
  isEditMode = true
}) => {
  const [selectedAttr, setSelectedAttr] = useState('Agility');
  const [bonusValue, setBonusValue] = useState(1);

  // Normalize incoming values
  const list = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          attribute: item.attribute || item.target || item.name || 'Strength',
          bonus: Number(item.bonus ?? item.value ?? 1)
        };
      }
      const str = String(item).trim();
      const parts = str.split(/[:+ ]/);
      return {
        attribute: parts[0] || str,
        bonus: parseInt(str.replace(/[^0-9-]/g, ''), 10) || 1
      };
    });
  }, [value]);

  const handleAdd = () => {
    if (!selectedAttr) return;
    const existsIndex = list.findIndex(i => i.attribute.toLowerCase() === selectedAttr.toLowerCase());
    let next;
    if (existsIndex >= 0) {
      next = [...list];
      next[existsIndex] = { attribute: selectedAttr, bonus: Number(bonusValue) };
    } else {
      next = [...list, { attribute: selectedAttr, bonus: Number(bonusValue) }];
    }
    onChange(next);
  };

  const handleRemove = (index) => {
    const next = list.filter((_, idx) => idx !== index);
    onChange(next);
  };

  return (
    <div className="space-y-2 font-mono">
      {/* Active Modifier Chips */}
      <div className="flex flex-wrap gap-2 min-h-[34px] items-center p-2 bg-slate-900/80 border border-slate-700/80 rounded-xl">
        {list.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No attribute modifiers assigned</span>
        ) : (
          list.map((item, idx) => {
            const isPositive = item.bonus >= 0;
            return (
              <OmnicortexTooltip
                key={`${item.attribute}-${idx}`}
                content={<AttributeModifierSummaryCard attribute={item.attribute} bonus={item.bonus} />}
                color="#06b6d4"
              >
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-sm cursor-help hover:border-cyan-400 transition-colors"
                >
                  <Zap size={11} className="text-cyan-400" />
                  <span>{item.attribute}</span>
                  <span className={`px-1 rounded text-[10px] ${isPositive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-red-500/20 text-red-300'}`}>
                    {isPositive ? `+${item.bonus}` : item.bonus}
                  </span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      className="hover:text-red-400 p-0.5 ml-0.5 text-cyan-400 transition-colors cursor-pointer"
                      title="Remove modifier"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              </OmnicortexTooltip>
            );
          })
        )}
      </div>

      {/* Edit Controls */}
      {isEditMode && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <select
            value={selectedAttr}
            onChange={(e) => setSelectedAttr(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
          >
            {CANONICAL_ATTRIBUTES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 gap-1.5">
            <span className="text-slate-400 text-[11px]">Bonus:</span>
            <input
              type="number"
              min={-5}
              max={10}
              value={bonusValue}
              onChange={(e) => setBonusValue(parseInt(e.target.value, 10) || 0)}
              className="w-12 bg-transparent text-center font-bold text-cyan-300 focus:outline-none font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
          >
            <Plus size={13} />
            <span>Add Modifier</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 2. SKILL BONUSES SELECTOR
 */
export const SkillBonusesSelector = ({
  value = [],
  onChange = () => {},
  onOpenPicker = null,
  isEditMode = true,
  dbSkills = []
}) => {
  const [selectedSkill, setSelectedSkill] = useState('Knowledge (Arcane)');
  const [bonusValue, setBonusValue] = useState(1);

  const allSkills = useMemo(() => {
    const list = [...ALL_CANONICAL_SKILLS];
    const existing = new Set(list.map(s => (s.name || s.id).toLowerCase()));
    (dbSkills || []).forEach(s => {
      const name = s.name || s.id;
      if (name && !existing.has(name.toLowerCase())) {
        existing.add(name.toLowerCase());
        list.push(s);
      }
    });
    return list;
  }, [dbSkills]);

  const list = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          skill: item.skill || item.target || item.name || 'Athletics',
          bonus: Number(item.bonus ?? item.value ?? 1)
        };
      }
      const str = String(item).trim();
      return {
        skill: str.split(/[:+ ]/)[0] || str,
        bonus: parseInt(str.replace(/[^0-9-]/g, ''), 10) || 1
      };
    });
  }, [value]);

  const handleAdd = () => {
    if (!selectedSkill) return;
    const existsIndex = list.findIndex(i => i.skill.toLowerCase() === selectedSkill.toLowerCase());
    let next;
    if (existsIndex >= 0) {
      next = [...list];
      next[existsIndex] = { skill: selectedSkill, bonus: Number(bonusValue) };
    } else {
      next = [...list, { skill: selectedSkill, bonus: Number(bonusValue) }];
    }
    onChange(next);
  };

  const handleRemove = (index) => {
    const next = list.filter((_, idx) => idx !== index);
    onChange(next);
  };

  return (
    <div className="space-y-2 font-mono">
      <div className="flex flex-wrap gap-2 min-h-[34px] items-center p-2 bg-slate-900/80 border border-slate-700/80 rounded-xl">
        {list.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No specific skill bonuses assigned</span>
        ) : (
          list.map((item, idx) => (
            <OmnicortexTooltip
              key={`${item.skill}-${idx}`}
              content={<SkillSummaryCard skill={item.skill} bonus={item.bonus} customSkills={dbSkills} />}
              color="#f59e0b"
            >
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-sm cursor-help hover:border-amber-400 transition-colors"
              >
                <Brain size={11} className="text-amber-400" />
                <span>{item.skill}</span>
                <span className="px-1 rounded text-[10px] bg-amber-500/20 text-amber-200">
                  +{item.bonus}
                </span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="hover:text-red-400 p-0.5 ml-0.5 text-amber-400 transition-colors cursor-pointer"
                    title="Remove skill bonus"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            </OmnicortexTooltip>
          ))
        )}
      </div>

      {isEditMode && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:border-amber-400 focus:outline-none max-w-xs truncate"
          >
            {allSkills.map(s => {
              const sName = s.name || s.id;
              return <option key={sName} value={sName}>{sName}</option>;
            })}
          </select>

          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 gap-1.5">
            <span className="text-slate-400 text-[11px]">+</span>
            <input
              type="number"
              min={1}
              max={10}
              value={bonusValue}
              onChange={(e) => setBonusValue(parseInt(e.target.value, 10) || 1)}
              className="w-10 bg-transparent text-center font-bold text-amber-300 focus:outline-none font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-1.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
          >
            <Plus size={13} />
            <span>Add Skill</span>
          </button>

          {onOpenPicker && (
            <button
              type="button"
              onClick={() => onOpenPicker('skills')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer text-[11px]"
              title="Open full Omnicortex Skills browser"
            >
              <ExternalLink size={12} />
              <span>Browse Catalog</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 3. FEATURES SELECTOR (Inherent & Recommended Features)
 */
export const FeaturesSelector = ({
  value = [],
  onChange = () => {},
  onOpenPicker = null,
  isEditMode = true,
  dbFeatures = [],
  variant = 'emerald'
}) => {
  const [selectedFeature, setSelectedFeature] = useState('');

  // Index of all features
  const featureMap = useMemo(() => {
    const map = new Map();
    const addFeat = (f) => {
      const id = (f.id || '').toLowerCase();
      const name = (f.name || f.title || f.id || '').trim();
      const obj = {
        id: f.id || name,
        name,
        bp: f.bp || f.cp || f.cost_bp || f.costs?.bp || 1,
        category: f.category || f.type || 'General'
      };
      if (id) map.set(id, obj);
      if (name) map.set(name.toLowerCase(), obj);
    };

    DEFAULT_FEATURES.forEach(addFeat);
    (dbFeatures || []).forEach(addFeat);
    return map;
  }, [dbFeatures]);

  // Categorized feature options for quick select
  const categorizedFeatures = useMemo(() => {
    const list = [...DEFAULT_FEATURES];
    (dbFeatures || []).forEach(f => {
      const fName = f.name || f.title || f.id;
      if (!list.some(existing => (existing.name || existing.id) === fName)) {
        list.push(f);
      }
    });

    const groups = {};
    list.forEach(f => {
      const cat = f.category || f.type || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });

    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    });

    return groups;
  }, [dbFeatures]);

  const list = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map(item => {
      const idStr = typeof item === 'object' && item !== null ? (item.id || item.name || '') : String(item).trim();
      const match = featureMap.get(idStr.toLowerCase()) || featureMap.get(idStr.replace(/^feature-|^trait-/, '').toLowerCase());
      return {
        raw: idStr,
        name: match?.name || idStr.replace(/^feature-|^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        bp: match?.bp || 1,
        category: match?.category || 'Feature'
      };
    });
  }, [value, featureMap]);

  const handleRemove = (rawVal) => {
    const next = (Array.isArray(value) ? value : []).filter(item => {
      const idStr = typeof item === 'object' && item !== null ? (item.id || item.name || '') : String(item).trim();
      return idStr !== rawVal;
    });
    onChange(next);
  };

  const handleAdd = () => {
    if (!selectedFeature) return;
    const current = Array.isArray(value) ? value : [];
    if (!current.includes(selectedFeature)) {
      onChange([...current, selectedFeature]);
    }
    setSelectedFeature('');
  };

  const isPurple = variant === 'purple';
  const badgeClasses = isPurple
    ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
  const iconColor = isPurple ? 'text-purple-400' : 'text-emerald-400';
  const btnClasses = isPurple
    ? 'bg-purple-950/90 hover:bg-purple-900 border-purple-500/60 text-purple-300'
    : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300';

  return (
    <div className="space-y-2 font-mono">
      <div className="flex flex-wrap gap-2 min-h-[34px] items-center p-2 bg-slate-900/80 border border-slate-700/80 rounded-xl">
        {list.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No features assigned</span>
        ) : (
          list.map((item, idx) => (
            <OmnicortexTooltip
              key={`${item.raw}-${idx}`}
              content={<FeatureSummaryCard feature={item.raw || item} mode={isPurple ? 'recommended' : 'inherent'} customFeatures={dbFeatures} />}
              color={isPurple ? '#a855f7' : '#10b981'}
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm cursor-help hover:brightness-110 transition-all ${badgeClasses}`}
              >
                <Sparkles size={11} className={iconColor} />
                <span>{item.name}</span>
                <span className="px-1 rounded text-[10px] bg-slate-800/80 text-slate-300">
                  {item.bp} CP
                </span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.raw);
                    }}
                    className="hover:text-red-400 p-0.5 ml-0.5 transition-colors cursor-pointer"
                    title="Remove feature"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            </OmnicortexTooltip>
          ))
        )}
      </div>

      {isEditMode && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Categorized Quick Select Dropdown */}
          <div className="flex items-center min-w-[200px] flex-1 max-w-sm">
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const current = Array.isArray(value) ? value : [];
                  if (!current.includes(val)) {
                    onChange([...current, val]);
                  }
                }
              }}
              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:border-purple-400 focus:outline-none"
            >
              <option value="">+ Quick Add Feature ({DEFAULT_FEATURES.length} available)...</option>
              {Object.entries(categorizedFeatures).map(([cat, feats]) => (
                <optgroup key={cat} label={`── ${cat.toUpperCase()} FEATURES (${feats.length}) ──`}>
                  {feats.map(f => (
                    <option key={f.id || f.name} value={f.id || f.name}>
                      {f.name} ({f.cp || f.bp || 1} CP)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {onOpenPicker && (
            <button
              type="button"
              onClick={() => onOpenPicker('features')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow border ${btnClasses}`}
              title="Open full Omnicortex Features browser"
            >
              <ExternalLink size={12} />
              <span>Browse All Features</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Or type feature name..."
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="p-1.5 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-500 w-44"
            />
            {selectedFeature && (
              <button
                type="button"
                onClick={handleAdd}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 4. SPECIES TRAITS CHIPS & CATALOG LAUNCHER
 */
export const SpeciesTraitsChips = ({
  traits = [],
  onOpenCatalog = () => {},
  onRemoveTrait = () => {},
  isEditMode = true,
  dbTraits = []
}) => {
  const traitMap = useMemo(() => {
    const map = new Map();
    ALL_CANONICAL_TRAITS.forEach(t => map.set(t.id, t));
    (dbTraits || []).forEach(t => map.set(t.id, t));
    return map;
  }, [dbTraits]);

  const list = useMemo(() => {
    if (!Array.isArray(traits)) return [];
    return traits.map((t, idx) => {
      const isObj = typeof t === 'object' && t !== null;
      const id = isObj ? (t.id || t.name) : String(t);
      const match = traitMap.get(id);
      const choiceLabel = isObj ? (t.choiceLabel || (Array.isArray(t.choice) ? t.choice.join(', ') : t.choice)) : null;
      return {
        id,
        rawEntry: t,
        uniqueKey: isObj && t.choice ? `${id}-${choiceLabel}-${idx}` : `${id}-${idx}`,
        name: isObj && t.name ? t.name : (match?.name || id.replace(/^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
        choiceLabel,
        bp: isObj && t.bp !== undefined ? t.bp : (match?.bp || match?.costs?.bp || 1),
        type: match?.type || match?.classification || 'Species Trait'
      };
    });
  }, [traits, traitMap]);

  return (
    <div className="space-y-2 font-mono">
      <div className="flex flex-wrap gap-2 min-h-[34px] items-center p-2 bg-slate-900/80 border border-slate-700/80 rounded-xl">
        {list.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No species traits selected</span>
        ) : (
          list.map(t => (
            <OmnicortexTooltip
              key={t.uniqueKey}
              content={<TraitTooltipCard trait={t} customTraits={dbTraits} />}
              color="#c084fc"
            >
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-sm cursor-help hover:border-purple-400 transition-colors"
              >
                <Dna size={11} className="text-purple-400" />
                <span>{t.name}</span>
                {t.choiceLabel && (
                  <span className="px-1 rounded text-[9.5px] bg-purple-500/25 text-purple-200 border border-purple-400/30">
                    {t.choiceLabel}
                  </span>
                )}
                <span className="px-1 rounded text-[10px] bg-purple-500/20 text-purple-200">
                  {t.bp} CP
                </span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrait(t.rawEntry || t.id);
                    }}
                    className="hover:text-red-400 p-0.5 ml-0.5 text-purple-400 transition-colors cursor-pointer"
                    title="Remove trait"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            </OmnicortexTooltip>
          ))
        )}
      </div>

      {isEditMode && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenCatalog}
            className="px-3 py-1.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow text-xs"
          >
            <Sparkles size={13} className="text-purple-400" />
            <span>Open Full Traits Catalog ({list.length} Equipped)</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 5. MOVEMENT MODE SELECTOR
 */
export const MovementModeSelector = ({
  value,
  onChange = () => {},
  isEditMode = true
}) => {
  // Normalize incoming modes into array of strings
  const activeIds = useMemo(() => {
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'object' && v !== null ? (v.id || v.name) : String(v)).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return ['species_movement-bipedal'];
  }, [value]);

  const [selectedToAdd, setSelectedToAdd] = useState('');

  // Find canonical object for an ID
  const getModeObj = (idOrName) => {
    if (!idOrName) return null;
    const canonicalId = resolveMovementId(idOrName);
    const found = getMovementById(canonicalId);
    if (found) return found;
    const raw = String(idOrName).toLowerCase().trim();
    const clean = raw.replace(/^species_movement-/, '').replace(/^movement-/, '');
    return DEFAULT_SPECIES_MOVEMENT.find(m => 
      m.id === idOrName || 
      m.id.toLowerCase() === raw || 
      m.id.toLowerCase() === `species_movement-${clean}` || 
      m.id.toLowerCase() === `movement-${clean}` ||
      m.name.toLowerCase() === raw ||
      m.name.toLowerCase().startsWith(raw)
    ) || {
      id: canonicalId || idOrName,
      name: idOrName.replace(/^species_movement-/, '').replace(/^movement-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      speed: 30,
      bp: 0,
      target_mode: 'Ground'
    };
  };

  const handleAddMode = (modeId) => {
    if (!modeId) return;
    const canonicalId = resolveMovementId(modeId);
    const isAlreadyPresent = activeIds.some(id => resolveMovementId(id) === canonicalId);
    if (!isAlreadyPresent) {
      const next = [...activeIds, canonicalId];
      onChange(next);
    }
    setSelectedToAdd('');
  };

  const handleRemoveMode = (modeId) => {
    const canonicalId = resolveMovementId(modeId);
    let next = activeIds.filter(id => resolveMovementId(id) !== canonicalId);
    if (next.length === 0) next = ['species_movement-bipedal'];
    onChange(next);
  };

  if (!isEditMode) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
        {activeIds.map(id => {
          const modeObj = getModeObj(id);
          return (
            <OmnicortexTooltip key={id} content={<MovementModeSummaryCard mode={modeObj || id} />} color="#f59e0b">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono cursor-help">
                <span className="font-bold">{modeObj.name}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  {modeObj.base_speed || modeObj.speed || 30} ft
                </span>
                {modeObj.bp !== undefined && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    modeObj.bp > 0 ? 'bg-purple-500/20 text-purple-300' : (modeObj.bp < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {modeObj.bp > 0 ? `+${modeObj.bp} CP` : (modeObj.bp < 0 ? `${modeObj.bp} CP` : '0 CP')}
                  </span>
                )}
              </span>
            </OmnicortexTooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2 font-mono">
      {/* Active Mode Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
        {activeIds.map(id => {
          const modeObj = getModeObj(id);
          return (
            <OmnicortexTooltip key={id} content={<MovementModeSummaryCard mode={modeObj || id} />} color="#f59e0b">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 text-xs hover:border-amber-500/50 transition-colors">
                <span className="font-bold text-amber-300">{modeObj.name}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                  {modeObj.base_speed || modeObj.speed || 30} ft
                </span>
                {modeObj.bp !== undefined && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    modeObj.bp > 0 ? 'bg-purple-500/20 text-purple-300' : (modeObj.bp < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {modeObj.bp > 0 ? `+${modeObj.bp} CP` : (modeObj.bp < 0 ? `${modeObj.bp} CP` : '0 CP')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMode(id);
                  }}
                  className="hover:text-red-400 text-slate-500 p-0.5 rounded transition-colors ml-0.5 cursor-pointer"
                  title="Remove mode"
                >
                  <X size={12} />
                </button>
              </span>
            </OmnicortexTooltip>
          );
        })}
      </div>

      {/* Add Mode Selector Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={selectedToAdd}
          onChange={(e) => {
            if (e.target.value) {
              handleAddMode(e.target.value);
            }
          }}
          className="flex-1 p-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
        >
          <option value="">+ Add Canonical Locomotion Mode / Adjuster...</option>
          {Object.entries(SPECIES_MOVEMENT_GROUPS).map(([grpKey, grp]) => (
            <optgroup key={grpKey} label={grp.label}>
              {grp.modes.map(m => (
                <option key={m.id} value={m.id} disabled={activeIds.some(id => resolveMovementId(id) === m.id)}>
                  {m.name} ({m.base_speed || m.speed || 30} ft) • {m.bp > 0 ? `+${m.bp} CP` : '0 CP'}
                </option>
              ))}
              {grp.adjusters?.map(a => (
                <option key={a.id} value={a.id} disabled={activeIds.some(id => resolveMovementId(id) === a.id)}>
                  [Adjuster] {a.name} ({a.speed_modifier > 0 ? `+${a.speed_modifier} ft` : (a.speed_modifier ? `${a.speed_modifier} ft` : 'Utility')}) • {a.bp > 0 ? `+${a.bp} CP` : (a.bp < 0 ? `${a.bp} CP` : '0 CP')}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};

/**
 * 6. SOCIAL STIGMA SELECTOR
 */
export const SocialStigmaSelector = ({
  value = '',
  onChange = () => {},
  isEditMode = true
}) => {
  const currentVal = value || 'None';
  const [isCustom, setIsCustom] = useState(() => !CANONICAL_STIGMAS.includes(currentVal));

  // Extract penalty for quick badge
  const penaltyMatches = [...String(currentVal).matchAll(/\(-\s*(\d+)\)/g)];
  const totalPenalty = penaltyMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);

  if (!isEditMode) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 flex items-center justify-between">
          <span className="font-bold">{currentVal || 'None'}</span>
          {totalPenalty > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              +{totalPenalty} CP Refund
            </span>
          )}
        </div>
        <OmnicortexTooltip content={<SocialStigmaSummaryCard stigma={currentVal} />} color="#ef4444">
          <button type="button" className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-red-400 text-red-400 transition-colors cursor-help">
            <Info size={14} />
          </button>
        </OmnicortexTooltip>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-mono">
      {!isCustom ? (
        <div className="flex items-center gap-2">
          <select
            value={currentVal}
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setIsCustom(true);
              } else {
                onChange(e.target.value);
              }
            }}
            className="flex-1 p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
          >
            {CANONICAL_STIGMAS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="CUSTOM">Custom Write-In...</option>
          </select>
          {totalPenalty > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
              +{totalPenalty} CP
            </span>
          )}
          <OmnicortexTooltip content={<SocialStigmaSummaryCard stigma={currentVal} />} color="#ef4444">
            <button type="button" className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-red-400 text-red-400 transition-colors cursor-help shrink-0" title="Social stigma summary">
              <Info size={14} />
            </button>
          </OmnicortexTooltip>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Synthetic (-2), Severe Xeno (-4)..."
            className="flex-1 p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
          />
          {totalPenalty > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
              +{totalPenalty} CP
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange(CANONICAL_STIGMAS[0]);
            }}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs shrink-0 cursor-pointer"
            title="Switch back to presets"
          >
            Presets
          </button>
          <OmnicortexTooltip content={<SocialStigmaSummaryCard stigma={currentVal} />} color="#ef4444">
            <button type="button" className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-red-400 text-red-400 transition-colors cursor-help shrink-0" title="Social stigma summary">
              <Info size={14} />
            </button>
          </OmnicortexTooltip>
        </div>
      )}
    </div>
  );
};
