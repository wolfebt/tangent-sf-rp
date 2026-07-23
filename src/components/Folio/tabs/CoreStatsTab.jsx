import React from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';

const ATTRIBUTES = [
  { name: 'Strength', id: 'attr-strength', sub: false },
  { name: 'Might', id: 'attr-might', sub: true, primaryId: 'attr-strength' },
  { name: 'Agility', id: 'attr-agility', sub: false },
  { name: 'Reflex', id: 'attr-reflex', sub: true, primaryId: 'attr-agility' },
  { name: 'Stamina', id: 'attr-stamina', sub: false },
  { name: 'Fortitude', id: 'attr-fortitude', sub: true, primaryId: 'attr-stamina' },
  { name: 'Intellect', id: 'attr-intellect', sub: false },
  { name: 'Logic', id: 'attr-logic', sub: true, primaryId: 'attr-intellect' },
  { name: 'Wisdom', id: 'attr-wisdom', sub: false },
  { name: 'Will', id: 'attr-will', sub: true, primaryId: 'attr-wisdom' },
  { name: 'Charisma', id: 'attr-charisma', sub: false },
  { name: 'Etiquette', id: 'attr-etiquette', sub: true, primaryId: 'attr-charisma' }
];

const CoreStatsTab = () => {
  const { characterData, updateField } = useFolio();
  // Helper to safely get numeric field value
  const getNum = (id, defaultVal = 0) => parseInt(characterData[id] || defaultVal, 10);

  // Auto-calculated attribute totals
  const getAttrTotal = (id) => {
    const val = getNum(id);
    const mod = getNum(`${id}-mod`);
    return val + mod;
  };

  // Initiative Total
  const reflexTotal = getAttrTotal('attr-reflex');
  const initiativeMod = getNum('initiative-mod');
  const initiativeTotal = reflexTotal + initiativeMod;

  // Perception calculations
  const intellectTotal = getAttrTotal('attr-intellect');
  const wisdomTotal = getAttrTotal('attr-wisdom');
  const alertnessMod = getNum('skill-mental-alertness-mod');
  const alertnessRank = getNum('skill-mental-alertness-rank');
  const attuneRank = getNum('skill-meta-attune-rank');
  const insightRank = getNum('skill-social-insight-rank');
  const techRank = getNum('skill-mental-technology-rank');

  const basePerception = intellectTotal + wisdomTotal + alertnessMod + alertnessRank;
  const metaPerception = intellectTotal + wisdomTotal + alertnessMod + attuneRank;
  const socialPerception = intellectTotal + wisdomTotal + alertnessMod + insightRank;
  const techPerception = intellectTotal + wisdomTotal + alertnessMod + techRank;

  // Essence calculation: Primary Attributes total + Attune & Discipline skills
  const primaryAttrsTotal = 
    getAttrTotal('attr-strength') +
    getAttrTotal('attr-agility') +
    getAttrTotal('attr-stamina') +
    getAttrTotal('attr-intellect') +
    getAttrTotal('attr-wisdom') +
    getAttrTotal('attr-charisma');

  const defaultMetaSkills = [
    'meta-attune',
    'meta-dimension',
    'meta-energy',
    'meta-entropy',
    'meta-illusion',
    'meta-matter',
    'meta-mental'
  ];

  const customMetaKeys = Object.keys(characterData).filter(
    k => k.startsWith('skill-meta-') && k.endsWith('-rank')
  );

  const allMetaSkillIds = new Set([
    ...defaultMetaSkills,
    ...customMetaKeys.map(k => k.replace('skill-', '').replace('-rank', ''))
  ]);

  let metaSkillsTotal = 0;
  allMetaSkillIds.forEach(id => {
    const rank = getNum(`skill-${id}-rank`);
    const mod = getNum(`skill-${id}-mod`);
    metaSkillsTotal += (rank + mod);
  });

  const essenceTotal = primaryAttrsTotal + metaSkillsTotal;

  // Handler for primary attribute changes to auto-update sub-attribute base
  const handlePrimaryChange = (attrId, value) => {
    const val = parseInt(value, 10) || 0;
    updateField(attrId, val);
    
    // Find sub attribute and auto set baseline if sub-attr is unedited or lower
    const subAttr = ATTRIBUTES.find(a => a.primaryId === attrId);
    if (subAttr) {
      const defaultSubVal = (val * 2) + 2;
      const currentSubVal = getNum(subAttr.id);
      if (currentSubVal === 0 || currentSubVal <= defaultSubVal) {
        updateField(subAttr.id, defaultSubVal);
      }
    }
  };

  return (
    <div className="tab-panel active p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Attributes Table */}
        <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/60 pb-2">
            Attributes & Sub-Attributes
          </h3>

          <div className="grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            <span className="col-span-5">Attribute</span>
            <span className="col-span-3 text-center">Value</span>
            <span className="col-span-2 text-center">Mod</span>
            <span className="col-span-2 text-center">Total</span>
          </div>

          <div className="space-y-1">
            {ATTRIBUTES.map((attr) => {
              const total = getAttrTotal(attr.id);
              const val = getNum(attr.id);
              const mod = getNum(`${attr.id}-mod`);

              return (
                <div
                  key={attr.id}
                  className={`grid grid-cols-12 items-center px-2 py-1.5 rounded transition-colors ${
                    !attr.sub
                      ? 'bg-slate-800/80 border-l-4 border-cyan-500 font-bold'
                      : 'bg-slate-950/40 border-l border-slate-700 pl-4 text-slate-300'
                  }`}
                >
                  <label htmlFor={attr.id} className="col-span-5 text-xs tracking-wide">
                    {attr.name}
                  </label>

                  <div className="col-span-3 px-1">
                    <input
                      type="number"
                      id={attr.id}
                      value={val}
                      onChange={(e) =>
                        !attr.sub
                          ? handlePrimaryChange(attr.id, e.target.value)
                          : updateField(attr.id, parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full text-center bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-1 py-0.5 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div className="col-span-2 text-center text-xs font-semibold text-slate-400">
                    {mod > 0 ? `+${mod}` : mod}
                  </div>

                  <div className="col-span-2 text-center text-xs font-bold text-cyan-300">
                    {total}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Derived Stats, Perception, & Movement */}
        <div className="space-y-6">
          
          {/* Initiative & Status Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/60 pb-2">
              Combat & Vitals Status
            </h3>

            {/* Row 1: Initiative, Health, Vitality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col bg-slate-800/60 p-2.5 rounded border border-cyan-900/40 justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-0.5">
                  Initiative
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Ref ({reflexTotal}) + Mod ({initiativeMod})</span>
                  <span className="text-base font-bold text-amber-400 font-mono">{initiativeTotal}</span>
                </div>
              </div>

              <FolioInput
                id="health"
                label="Health"
                type="number"
                value={getNum('health', 30)}
                onChange={updateField}
                labelColor="text-slate-300"
                inputClassName="bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm font-mono"
              />

              <FolioInput
                id="vitality"
                label="Vitality"
                type="number"
                value={getNum('vitality', 30)}
                onChange={updateField}
                labelColor="text-slate-300"
                inputClassName="bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm font-mono"
              />
            </div>

            {/* Row 2: Tech Level, Meta Level, Essence */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FolioInput
                id="tech-level"
                label="Tech Level"
                type="number"
                value={getNum('tech-level', 3)}
                onChange={updateField}
                labelSize="text-[10px] tracking-widest"
                containerClassName="flex flex-col bg-slate-800/60 p-2.5 rounded border border-cyan-900/40"
                inputClassName="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center"
              />

              <FolioInput
                id="magic-level"
                label="Meta Level"
                type="number"
                value={getNum('magic-level', 1)}
                onChange={updateField}
                labelSize="text-[10px] tracking-widest"
                containerClassName="flex flex-col bg-slate-800/60 p-2.5 rounded border border-cyan-900/40"
                inputClassName="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center"
              />

              <div className="flex flex-col bg-slate-800/60 p-2.5 rounded border border-cyan-900/40 justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-0.5">
                  Essence
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Attrs ({primaryAttrsTotal}) + Meta ({metaSkillsTotal})</span>
                  <span className="text-base font-bold text-cyan-300 font-mono">{essenceTotal}</span>
                </div>
              </div>
            </div>

            {/* Row 3: Karma, Plot Points */}
            <div className="grid grid-cols-2 gap-4">
              <FolioInput
                id="karma"
                label="Karma"
                type="number"
                value={getNum('karma', 3)}
                onChange={updateField}
                labelColor="text-slate-300"
                inputClassName="bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm font-mono"
              />

              <FolioInput
                id="plot-points"
                label="Plot Points"
                type="number"
                value={getNum('plot-points', 0)}
                onChange={updateField}
                labelColor="text-slate-300"
                inputClassName="bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Perception Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/60 pb-2">
              Perception System
            </h3>

            <div className="flex items-center justify-between bg-cyan-950/40 p-3 rounded border border-cyan-500/40">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Base Perception</span>
              <span className="text-lg font-bold font-mono text-cyan-400">{basePerception}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Meta</span>
                <span className="text-sm font-bold font-mono text-amber-400">{metaPerception}</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Social</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{socialPerception}</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tech</span>
                <span className="text-sm font-bold font-mono text-blue-400">{techPerception}</span>
              </div>
            </div>
          </div>

          {/* Movement Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/60 pb-2">
              Movement Modes
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {['walk', 'swim', 'climb', 'fly', 'burrow', 'flicker'].map((mode) => (
                <FolioInput
                  key={mode}
                  id={`move-${mode}`}
                  label={mode}
                  type="number"
                  value={getNum(`move-${mode}`)}
                  onChange={updateField}
                  labelColor="text-slate-400"
                  labelSize="text-[10px]"
                  containerClassName="flex flex-col bg-slate-800/40 p-2 rounded border border-slate-700/80"
                  inputClassName="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center"
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default React.memo(CoreStatsTab);
