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
  const { characterData, updateField, derivedStats, getAttrMod, getAttrTotal, computedModifiers } = useFolio();
  // Helper to safely get numeric field value
  const getNum = (id, defaultVal = 0) => parseInt(characterData[id] || defaultVal, 10);

  // Initiative Total with active combat modifiers
  const reflexTotal = getAttrTotal('attr-reflex');
  const initiativeIdentityMod = computedModifiers?.combatMods?.['initiative-mod'] || 0;
  const initiativeMod = getNum('initiative-mod') + initiativeIdentityMod;
  const initiativeTotal = reflexTotal + initiativeMod;

  // Perception calculations
  const intellectTotal = getAttrTotal('attr-intellect');
  const wisdomTotal = getAttrTotal('attr-wisdom');
  const alertnessMod = getNum('skill-mental-alertness-mod') + (computedModifiers?.skillMods?.['alertness'] || 0);
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

  const handleStatChange = (id, val) => {
    let newVal = parseInt(val, 10) || 0;
    if (newVal > derivedStats.maxAllowed) {
      newVal = derivedStats.maxAllowed;
    }
    updateField(id, newVal);
  };

  // Collect any species/identity bonus attribute point pools or modifiers
  const identityAttrPools = [];
  if (computedModifiers?.identityPools) {
    Object.values(computedModifiers.identityPools).forEach(cat => {
      if (cat?.pools) {
        cat.pools.filter(p => p.type?.toLowerCase().includes('attr')).forEach(p => {
          identityAttrPools.push({ ...p, source: cat.title });
        });
      }
    });
  }

  return (
    <div className="tab-panel active p-4 space-y-6">
      {/* Identity Attribute Bonus Banner if any pools are granted */}
      {identityAttrPools.length > 0 && (
        <div className="bg-cyan-950/70 border border-cyan-500/50 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <span className="text-base">🧬</span>
            <span className="font-bold uppercase tracking-wider text-cyan-300">Identity Attribute Points Allotted:</span>
            <div className="flex flex-wrap gap-1.5">
              {identityAttrPools.map((pool, idx) => (
                <span key={idx} className="bg-slate-900/90 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                  +{pool.awarded} {pool.name} ({pool.source})
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-cyan-400/80 italic font-mono">
            Allocate freely into your base attributes above
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Attributes Table */}
        <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Attributes & Sub-Attributes
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Auto-Calculated with Species & Modifiers
            </span>
          </div>

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
              const totalMod = getAttrMod(attr.id);
              const identityBonusMod = computedModifiers?.attributeMods?.[attr.id] || 0;
              const hasIdentityBonus = identityBonusMod !== 0;

              return (
                <div
                  key={attr.id}
                  className={`grid grid-cols-12 items-center px-2 py-1.5 rounded transition-colors ${
                    !attr.sub
                      ? 'bg-slate-800/80 border-l-4 border-cyan-500 font-bold'
                      : 'bg-slate-950/40 border-l border-slate-700 pl-4 text-slate-300'
                  } ${hasIdentityBonus ? 'ring-1 ring-cyan-500/30' : ''}`}
                >
                  <label htmlFor={attr.id} className="col-span-5 text-xs tracking-wide flex items-center gap-1.5">
                    <span>{attr.name}</span>
                    {hasIdentityBonus && (
                      <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-1 rounded font-mono font-bold" title={`+${identityBonusMod} from Species/Identity Modifiers`}>
                        +{identityBonusMod}
                      </span>
                    )}
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

                  <div className="col-span-2 text-center text-xs font-semibold text-slate-400" title={hasIdentityBonus ? `Total Mod: ${totalMod} (Includes +${identityBonusMod} Identity Mod)` : undefined}>
                    {totalMod > 0 ? `+${totalMod}` : totalMod}
                  </div>

                  <div className="col-span-2 text-center text-xs font-bold text-cyan-300 font-mono">
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

              <div className="flex flex-col relative group">
                <FolioInput
                  id="health"
                  label="Health"
                  type="number"
                  value={getNum('health', 30)}
                  onChange={handleStatChange}
                  labelColor="text-slate-300"
                  inputClassName={`px-3 py-1.5 text-sm font-mono border ${derivedStats.purchasedHealth > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                />
                {derivedStats.purchasedHealth > 0 && (
                  <div className="absolute top-0 right-0 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1 py-0.5 rounded-bl">
                    +{derivedStats.purchasedHealth} (Purchased)
                  </div>
                )}
              </div>

              <div className="flex flex-col relative group">
                <FolioInput
                  id="vitality"
                  label="Vitality"
                  type="number"
                  value={getNum('vitality', 30)}
                  onChange={handleStatChange}
                  labelColor="text-slate-300"
                  inputClassName={`px-3 py-1.5 text-sm font-mono border ${derivedStats.purchasedVitality > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                />
                {derivedStats.purchasedVitality > 0 && (
                  <div className="absolute top-0 right-0 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1 py-0.5 rounded-bl">
                    +{derivedStats.purchasedVitality} (Purchased)
                  </div>
                )}
              </div>
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
