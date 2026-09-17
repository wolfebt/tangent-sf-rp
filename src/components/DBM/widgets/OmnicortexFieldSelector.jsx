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
  Dna
} from 'lucide-react';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';
import { DEFAULT_FEATURES } from '../../../data/featuresData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { SPECIES_MOVEMENT_MODES, SPECIES_MOVEMENT_GROUPS } from '../../../engines/tangentConstants';

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
  'None (Standard)',
  'Minor Xeno (-1)',
  'Major Xeno (-2)',
  'Extreme Stigma / Pariah (-3)',
  'Outsider / Unknown (-1)',
  'Cybernetic Abomination (-2)',
  'Sub-Human / Servant Caste (-2)'
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
              <span
                key={`${item.attribute}-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-sm"
              >
                <Zap size={11} className="text-cyan-400" />
                <span>{item.attribute}</span>
                <span className={`px-1 rounded text-[10px] ${isPositive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-red-500/20 text-red-300'}`}>
                  {isPositive ? `+${item.bonus}` : item.bonus}
                </span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="hover:text-red-400 p-0.5 ml-0.5 text-cyan-400 transition-colors cursor-pointer"
                    title="Remove modifier"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
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
            <span
              key={`${item.skill}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-sm"
            >
              <Brain size={11} className="text-amber-400" />
              <span>{item.skill}</span>
              <span className="px-1 rounded text-[10px] bg-amber-500/20 text-amber-200">
                +{item.bonus}
              </span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="hover:text-red-400 p-0.5 ml-0.5 text-amber-400 transition-colors cursor-pointer"
                  title="Remove skill bonus"
                >
                  <X size={12} />
                </button>
              )}
            </span>
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
    ALL_CANONICAL_TRAITS.forEach(addFeat);
    (dbFeatures || []).forEach(addFeat);
    return map;
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
            <span
              key={`${item.raw}-${idx}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${badgeClasses}`}
            >
              <Sparkles size={11} className={iconColor} />
              <span>{item.name}</span>
              <span className="px-1 rounded text-[10px] bg-slate-800/80 text-slate-300">
                {item.bp} CP
              </span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemove(item.raw)}
                  className="hover:text-red-400 p-0.5 ml-0.5 transition-colors cursor-pointer"
                  title="Remove feature"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {isEditMode && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {onOpenPicker && (
            <button
              type="button"
              onClick={() => onOpenPicker('features')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow border ${btnClasses}`}
            >
              <ExternalLink size={12} />
              <span>Browse Omnicortex Features</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Or quick add feature name..."
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="p-1.5 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-500 min-w-[200px]"
            />
            {selectedFeature && (
              <button
                type="button"
                onClick={handleAdd}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold"
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
    return traits.map(t => {
      const id = typeof t === 'object' && t !== null ? (t.id || t.name) : String(t);
      const match = traitMap.get(id);
      return {
        id,
        name: match?.name || id.replace(/^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        bp: match?.bp || match?.costs?.bp || 1,
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
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-sm"
            >
              <Dna size={11} className="text-purple-400" />
              <span>{t.name}</span>
              <span className="px-1 rounded text-[10px] bg-purple-500/20 text-purple-200">
                {t.bp} CP
              </span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => onRemoveTrait(t.id)}
                  className="hover:text-red-400 p-0.5 ml-0.5 text-purple-400 transition-colors cursor-pointer"
                  title="Remove trait"
                >
                  <X size={12} />
                </button>
              )}
            </span>
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
  const currentVal = Array.isArray(value) ? value[0] : (value || 'normal');

  const options = [
    { id: 'normal', label: 'Ground 30 ft (Standard Bipedal)', speed: 30 },
    { id: 'fast', label: 'Ground 40 ft (Fast Bipedal, +2 CP)', speed: 40 },
    { id: 'very_fast', label: 'Ground 50 ft (Very Fast, +4 CP)', speed: 50 },
    { id: 'slow', label: 'Ground 20 ft (Slow / Ponderous, -2 CP)', speed: 20 },
    { id: 'flight', label: 'Flight 60 ft (Winged / Levitation, +6 CP)', speed: 60 },
    { id: 'aquatic', label: 'Aquatic / Swimming 30 ft (+2 CP)', speed: 30 },
    { id: 'burrowing', label: 'Burrowing 15 ft (+4 CP)', speed: 15 },
    { id: 'zero_g', label: 'Zero-G Thruster / Void 30 ft (+2 CP)', speed: 30 }
  ];

  if (!isEditMode) {
    const match = options.find(o => o.id === currentVal);
    return (
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200">
        {match ? match.label : currentVal}
      </div>
    );
  }

  return (
    <select
      value={currentVal}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
    >
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.label}</option>
      ))}
    </select>
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
  const currentVal = value || 'Minor Xeno (-1)';
  const [isCustom, setIsCustom] = useState(() => !CANONICAL_STIGMAS.includes(currentVal));

  if (!isEditMode) {
    return (
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200">
        {currentVal || 'None'}
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
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom social stigma..."
            className="flex-1 p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange(CANONICAL_STIGMAS[0]);
            }}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            title="Switch back to presets"
          >
            Presets
          </button>
        </div>
      )}
    </div>
  );
};
