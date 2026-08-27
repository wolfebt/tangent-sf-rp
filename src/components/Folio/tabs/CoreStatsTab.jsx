import React, { useState } from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';
import DiscreetFateOverrideModal from '../modals/DiscreetFateOverrideModal';
import PerceptionEssenceMovementModal from '../modals/PerceptionEssenceMovementModal';
import PerceptionRulesModal from '../modals/PerceptionRulesModal';
import MovementRulesModal from '../modals/MovementRulesModal';

const ATTRIBUTES = [
  { name: 'Strength', id: 'attr-strength', sub: false, desc: 'Physical power, melee strike damage, athletics, lifting' },
  { name: 'Might', id: 'attr-might', sub: true, primaryId: 'attr-strength', desc: 'Raw physical power check: lifting gates, bending bars, breaking objects' },
  { name: 'Agility', id: 'attr-agility', sub: false, desc: 'Balance, coordination, nimbleness, ranged accuracy' },
  { name: 'Reflex', id: 'attr-reflex', sub: true, primaryId: 'attr-agility', desc: 'Reaction check: dodging AOE/explosions, catching objects, acrobatic feats' },
  { name: 'Stamina', id: 'attr-stamina', sub: false, desc: 'Endurance, toughness, resisting fatigue/poison' },
  { name: 'Fortitude', id: 'attr-fortitude', sub: true, primaryId: 'attr-stamina', desc: 'Endurance save: resisting poisons/diseases, extreme environments, exhaustion' },
  { name: 'Intellect', id: 'attr-intellect', sub: false, desc: 'Reason, logic, wits, problem-solving, deduction' },
  { name: 'Reason', id: 'attr-logic', aliasId: 'attr-reason', sub: true, primaryId: 'attr-intellect', desc: 'Intellect check: puzzles, deduction, deciphering codes/languages, technical analysis' },
  { name: 'Wisdom', id: 'attr-wisdom', sub: false, desc: 'Insight, intuition, determination, sensing deception' },
  { name: 'Willpower', id: 'attr-will', aliasId: 'attr-willpower', sub: true, primaryId: 'attr-wisdom', desc: 'Mental save: resisting fear, mind control/psychic manipulation, focus under pressure' },
  { name: 'Charisma', id: 'attr-charisma', sub: false, desc: 'Confidence, assertiveness, personal magnetism, leadership' },
  { name: 'Etiquette', id: 'attr-etiquette', sub: true, primaryId: 'attr-charisma', desc: 'Social check: diplomacy, bartering, formal gatherings, de-escalating disputes' }
];

const CoreStatsTab = () => {
  const {
    characterData,
    updateField,
    derivedStats,
    getAttrMod,
    getAttrTotal,
    getSubAttrBase,
    enabledMovementModes,
    computedModifiers,
    spendKarma,
    gainKarma,
    resetKarmaToMax,
    spendPlotPoint,
    gainPlotPoint,
    takeCharacterRest,
    resetDailyCharacterRests,
    stabilizeCharacter,
    advanceCharacterDeathTurn,
    revivifyCharacter,
    payExperienceDebt,
    economyBreakdown,
    deathAndDyingRules
  } = useFolio();

  const [isFateOverrideOpen, setIsFateOverrideOpen] = useState(false);
  const [isCoreRulesModalOpen, setIsCoreRulesModalOpen] = useState(false);
  const [isPerceptionRulesOpen, setIsPerceptionRulesOpen] = useState(false);
  const [isMovementRulesOpen, setIsMovementRulesOpen] = useState(false);
  const [coreRulesInitialTab, setCoreRulesInitialTab] = useState('attributes');

  const openRulesModal = (tab = 'attributes') => {
    setCoreRulesInitialTab(tab);
    setIsCoreRulesModalOpen(true);
  };

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
  const attuneMod = getNum('skill-meta-attune-mod') + (computedModifiers?.skillMods?.['attune'] || 0);
  const attuneRank = getNum('skill-meta-attune-rank');
  const insightMod = getNum('skill-social-insight-mod') + (computedModifiers?.skillMods?.['insight'] || 0);
  const insightRank = getNum('skill-social-insight-rank');
  const techMod = getNum('skill-mental-technology-mod') + (computedModifiers?.skillMods?.['technology'] || 0);
  const techRank = getNum('skill-mental-technology-rank');

  const basePerception = intellectTotal + wisdomTotal;
  const alertPerception = basePerception + alertnessRank + alertnessMod;
  const metaPerception = basePerception + attuneRank + attuneMod;
  const socialPerception = basePerception + insightRank + insightMod;
  const techPerception = basePerception + techRank + techMod;

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

  // Handler for primary attribute changes (FolioContext automatically shifts sub-attribute base while preserving delta)
  const handlePrimaryChange = (attrId, value) => {
    const val = parseInt(value, 10) || 0;
    updateField(attrId, val);
  };

  const handleSubAttrChange = (subAttrId, value) => {
    const val = parseInt(value, 10) || 0;
    updateField(subAttrId, val);
  };

  const handleStatChange = (id, val) => {
    let newVal = parseInt(val, 10) || 0;
    if (newVal > derivedStats.maxAllowed) {
      newVal = derivedStats.maxAllowed;
    }
    updateField(id, newVal);
  };

  // Movement options
  const allPossibleMoveModes = [
    { id: 'walk', label: 'Walk', defaultSpeed: 30 },
    { id: 'swim', label: 'Swim', defaultSpeed: 15 },
    { id: 'climb', label: 'Climb', defaultSpeed: 15 },
    { id: 'fly', label: 'Fly', defaultSpeed: 30 },
    { id: 'burrow', label: 'Burrow', defaultSpeed: 10 },
    { id: 'teleport', label: 'Teleport', defaultSpeed: 30 }
  ];

  const handleAddMovementMode = (modeId) => {
    if (!modeId) return;
    const modeConfig = allPossibleMoveModes.find(m => m.id === modeId);
    const speed = modeConfig ? modeConfig.defaultSpeed : 30;
    updateField(`move-${modeId}`, speed);
  };

  const activeMoveModes = allPossibleMoveModes
    .map(m => m.id)
    .filter(mode => {
      if (mode === 'walk') return true;
      if (enabledMovementModes && enabledMovementModes[mode]) return true;
      const val = characterData[`move-${mode}`];
      return val !== undefined && val !== null && val !== '' && val !== 0 && val !== '0';
    });

  const unenabledModes = allPossibleMoveModes.filter(m => !activeMoveModes.includes(m.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Core Attributes & Perception / Essence */}
        <div className="space-y-6">
          {/* Attributes & Checks Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Attributes &amp; Checks
                </h3>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  (Base = 2 + Attr × 2)
                </span>
              </div>
              <button
                type="button"
                onClick={() => openRulesModal('attributes')}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                title="Open Attribute Checks & Saves Guide"
              >
                <span>🛡️</span> Checks &amp; Saves Guide
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="py-1.5 px-2 font-bold">Attribute / Check</th>
                    <th className="py-1.5 px-1.5 text-center font-bold">Base</th>
                    <th className="py-1.5 px-1.5 text-center font-bold">Mod</th>
                    <th className="py-1.5 px-1.5 text-center font-bold text-cyan-300">Total</th>
                    <th className="py-1.5 px-2 text-slate-400 hidden sm:table-cell">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {ATTRIBUTES.map((attr) => {
                    const isSub = attr.sub;
                    const rawBase = isSub 
                      ? (characterData[attr.id] !== undefined ? parseInt(characterData[attr.id], 10) : getSubAttrBase(attr.id))
                      : getNum(attr.id);
                    const mod = getAttrMod(attr.id);
                    const total = getAttrTotal(attr.id);

                    return (
                      <tr 
                        key={attr.id} 
                        className={`transition-colors ${isSub ? 'bg-slate-950/30 text-slate-300' : 'bg-slate-900/40 font-semibold text-slate-100 hover:bg-slate-850'}`}
                      >
                        <td className="py-1 px-2">
                          <div className="flex items-center gap-1.5 font-sans">
                            {isSub && <span className="text-slate-600 text-xs pl-1.5">↳</span>}
                            <span className={isSub ? 'text-slate-300 text-xs' : 'text-cyan-400 font-bold text-xs'}>
                              {attr.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-0.5 px-1.5 text-center">
                          <input
                            type="number"
                            value={isNaN(rawBase) ? 0 : rawBase}
                            onChange={(e) => isSub ? handleSubAttrChange(attr.id, e.target.value) : handlePrimaryChange(attr.id, e.target.value)}
                            className={`w-11 text-center bg-slate-900 border rounded px-1 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 ${
                              isSub ? 'border-slate-800 text-slate-300' : 'border-slate-700 font-bold'
                            }`}
                          />
                        </td>
                        <td className="py-0.5 px-1.5 text-center">
                          <span className={`text-xs font-mono ${mod > 0 ? 'text-emerald-400' : mod < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                            {mod > 0 ? `+${mod}` : mod === 0 ? '0' : mod}
                          </span>
                        </td>
                        <td className="py-0.5 px-1.5 text-center">
                          <span className={`text-xs font-bold font-mono ${isSub ? 'text-amber-300' : 'text-cyan-300'}`}>
                            {total > 0 && !isSub ? `+${total}` : total}
                          </span>
                        </td>
                        <td className="py-1 px-2 text-[10px] text-slate-400 font-sans hidden sm:table-cell max-w-[180px] truncate" title={attr.desc}>
                          {attr.desc}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Perception Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-2 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Perception
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  (Base: INT {intellectTotal} + WIS {wisdomTotal} = {basePerception})
                </span>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsPerceptionRulesOpen(true)}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Perception Rules & Detection Codex"
                >
                  <span>👁️</span> Perception Rules
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center" title="Base Perception = Intellect + Wisdom (Innate sensory acuity & mental focus)">
                <span className="text-[10px] uppercase font-bold text-slate-400">Base</span>
                <span className="text-sm font-bold font-mono text-cyan-300">{basePerception}</span>
                <span className="text-[8.5px] text-slate-500 font-mono">INT+WIS</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-cyan-700/60 text-center" title="Default Detection Check = Base + Alertness (General awareness, spotting hazards/traps)">
                <span className="text-[10px] uppercase font-bold text-cyan-300">Default</span>
                <span className="text-sm font-bold font-mono text-cyan-200">{alertPerception}</span>
                <span className="text-[8.5px] text-cyan-400/80 font-mono">+{alertnessRank + alertnessMod} Alert</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-amber-700/60 text-center" title="Meta Perception = Base + Attune (Supernatural, psionic, and magical energy detection)">
                <span className="text-[10px] uppercase font-bold text-amber-400">Meta</span>
                <span className="text-sm font-bold font-mono text-amber-300">{metaPerception}</span>
                <span className="text-[8.5px] text-amber-400/80 font-mono">+{attuneRank + attuneMod} Attune</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-emerald-700/60 text-center" title="Social Perception = Base + Insight (Reading body language, vocal cues, lie detection)">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Social</span>
                <span className="text-sm font-bold font-mono text-emerald-300">{socialPerception}</span>
                <span className="text-[8.5px] text-emerald-400/80 font-mono">+{insightRank + insightMod} Insight</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-blue-700/60 text-center col-span-2 sm:col-span-1" title="Technical Perception = Base + Technology (Knowledge) (Electronic analysis, sensor arrays, hardware scans)">
                <span className="text-[10px] uppercase font-bold text-blue-400">Tech</span>
                <span className="text-sm font-bold font-mono text-blue-300">{techPerception}</span>
                <span className="text-[8.5px] text-blue-400/80 font-mono">+{techRank + techMod} Tech</span>
              </div>
            </div>
          </div>

          {/* Essence Block */}
          <div className="bg-slate-900/60 border border-purple-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-purple-900/60 pb-2 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                  Essence
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  (Attrs: {primaryAttrsTotal} + Meta: {metaSkillsTotal} = {essenceTotal})
                </span>
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded border border-purple-500/40">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">Capacity:</span>
                  <span className="text-xs font-mono font-bold text-purple-200">{essenceTotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => openRulesModal('essence')}
                  className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-[10px] font-bold text-purple-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Essence Pool & Metaphysical Strain Rules Codex"
                >
                  <span>🔮</span> Essence Rules
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-purple-700/60 text-center" title="Total Metaphysical Essence Capacity = Primary Attributes + Attune & Discipline Skills">
                <span className="text-[10px] uppercase font-bold text-purple-300">Total Essence</span>
                <span className="text-sm font-bold font-mono text-purple-200">{essenceTotal}</span>
                <span className="text-[8.5px] text-purple-400/80 font-mono">Pool Capacity</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center" title="Ability Substrate (Containment): Sum of all 6 Primary Attributes">
                <span className="text-[10px] uppercase font-bold text-slate-400">Substrate</span>
                <span className="text-sm font-bold font-mono text-cyan-300">+{primaryAttrsTotal}</span>
                <span className="text-[8.5px] text-slate-500 font-mono">6 Primary Attrs</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-amber-700/60 text-center" title="The Conduit: Attune skill rank + modifier for channeling Code">
                <span className="text-[10px] uppercase font-bold text-amber-400">Conduit</span>
                <span className="text-sm font-bold font-mono text-amber-300">+{attuneRank + attuneMod}</span>
                <span className="text-[8.5px] text-amber-400/80 font-mono">Attune Skill</span>
              </div>
              <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center" title="The Breadth: Total ranks across all known Metaphysical disciplines">
                <span className="text-[10px] uppercase font-bold text-slate-400">Disciplines</span>
                <span className="text-sm font-bold font-mono text-cyan-300">+{Math.max(0, metaSkillsTotal - (attuneRank + attuneMod))}</span>
                <span className="text-[8.5px] text-slate-500 font-mono">Meta Skills</span>
              </div>
            </div>
          </div>

          {/* Fate Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Fate
                </h3>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  (Karma &amp; Plot Points)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => openRulesModal('karma')}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open canonical Karma & Fate Rules Codex"
                >
                  <span>📖</span> Karma Rules
                </button>

                <button
                  type="button"
                  onClick={() => setIsFateOverrideOpen(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/60 text-[10px] font-bold text-slate-300 hover:text-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open discreet override modal for Karma, Plot Points, and Experience"
                >
                  <span>⚙️</span> Overrides
                </button>
              </div>
            </div>

            {/* Fate Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-center font-mono">
              {/* Karma Pool Card */}
              {(() => {
                const currentKarma = getNum('karma', derivedStats?.maxKarma ?? 3);
                const maxKarma = derivedStats?.maxKarma ?? 3;
                const isDebt = currentKarma < 0;
                return (
                  <div className={`p-2.5 rounded border flex flex-col justify-between ${
                    isDebt 
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-300' 
                      : 'bg-slate-800/50 border-cyan-700/60 text-cyan-300'
                  }`} title={isDebt ? "In Karmic Debt!" : "Current Karma Pool"}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Karma Pool</span>
                      <span className="text-[9px] text-slate-500 font-mono">Max: {maxKarma}{isDebt ? ' (Debt)' : ''}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 my-1">
                      <button
                        type="button"
                        onClick={() => spendKarma(1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-sm font-bold border border-slate-700 cursor-pointer"
                        title="Spend 1 Karma"
                      >
                        -
                      </button>
                      <span className={`text-lg font-black ${isDebt ? 'text-rose-400' : 'text-cyan-200'}`}>
                        {currentKarma}
                      </span>
                      <button
                        type="button"
                        onClick={() => gainKarma(1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-sm font-bold border border-slate-700 cursor-pointer"
                        title="Gain 1 Karma"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 font-sans">d20 Advantage / Reroll Reserve</span>
                  </div>
                );
              })()}

              {/* Plot Points Card */}
              {(() => {
                const plotPoints = getNum('plot-points', 0);
                return (
                  <div className="p-2.5 rounded border bg-slate-800/50 border-fuchsia-700/60 text-fuchsia-300 flex flex-col justify-between" title="Plot Points (Narrative Influence tokens)">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-fuchsia-400">Plot Points</span>
                      <span className="text-[9px] text-fuchsia-400/70 font-mono">Narrative Tokens</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 my-1">
                      <button
                        type="button"
                        onClick={() => spendPlotPoint(1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-sm font-bold border border-slate-700 cursor-pointer"
                        title="Spend 1 Plot Point"
                      >
                        -
                      </button>
                      <span className="text-lg font-black text-fuchsia-200">{plotPoints}</span>
                      <button
                        type="button"
                        onClick={() => gainPlotPoint(1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-sm font-bold border border-slate-700 cursor-pointer"
                        title="Gain 1 Plot Point"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 font-sans">Story Complications &amp; Creative Twists</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Column 2: Setting Tiers, Combat & Vitals Status, Movement, Experience */}
        <div className="space-y-6">
          
          {/* Tech & Meta Level Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Tech Level &amp; Meta Level
                </h3>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  (Setting Parameters)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-slate-800/40 px-2.5 py-1 rounded border border-slate-700/80 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <label htmlFor="tech-level" className="text-xs font-bold uppercase tracking-wider text-cyan-300 cursor-pointer shrink-0">
                    Tech Level
                  </label>
                  <span className="text-[9px] text-slate-400 font-sans hidden sm:inline truncate">(TL 0–5)</span>
                </div>
                <input
                  id="tech-level"
                  type="number"
                  value={getNum('tech-level', 3)}
                  onChange={(e) => updateField('tech-level', parseInt(e.target.value, 10) || 0)}
                  className="w-12 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-1.5 py-0.5 text-xs font-mono text-center font-bold text-slate-100 outline-none transition-colors shrink-0"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-800/40 px-2.5 py-1 rounded border border-slate-700/80 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <label htmlFor="magic-level" className="text-xs font-bold uppercase tracking-wider text-purple-300 cursor-pointer shrink-0">
                    Meta Level
                  </label>
                  <span className="text-[9px] text-slate-400 font-sans hidden sm:inline truncate">(ML 0–3)</span>
                </div>
                <input
                  id="magic-level"
                  type="number"
                  value={getNum('magic-level', 1)}
                  onChange={(e) => updateField('magic-level', parseInt(e.target.value, 10) || 0)}
                  className="w-12 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded px-1.5 py-0.5 text-xs font-mono text-center font-bold text-slate-100 outline-none transition-colors shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Initiative & Status Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Combat &amp; Vitals Status
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold hidden sm:inline" title="Toughness reduces incoming wound damage point-for-point">
                  🛡️ Toughness: {derivedStats?.toughness ?? 0}
                </span>
                {derivedStats?.isSynthetic && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold hidden sm:inline" title="Non-standard physiology: Vitality and Health combined into Structure">
                    ⚙️ Structure: {derivedStats?.structure ?? 60} SP
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openRulesModal('vitals')}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                title="Open Vitality, Health, Structure & Dying Rules Codex"
              >
                <span>⚡</span> Vitals &amp; Dying Rules
              </button>
            </div>

            {/* Row 1: Combat Readiness & Vitals (2 Columns: Initiative/Toughness and Vitality/Health) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Column: Initiative over Toughness */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2.5 rounded border border-cyan-900/40 min-h-[52px]">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Initiative
                  </label>
                  <span className="text-lg font-bold text-amber-400 font-mono">{initiativeTotal}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2.5 rounded border border-emerald-900/40 min-h-[52px]" title="Stamina Ability Score determines base Toughness, reducing wound damage point-for-point">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Toughness
                  </label>
                  <span className="text-lg font-bold text-emerald-300 font-mono">+{derivedStats?.toughness ?? 0}</span>
                </div>
              </div>

              {/* Right Column: Vitality over Health */}
              <div className="space-y-2.5">
                <div className="flex flex-col relative group">
                  <FolioInput
                    id="vitality"
                    label="Vitality (Non-Lethal)"
                    type="number"
                    value={getNum('vitality', 30)}
                    onChange={handleStatChange}
                    labelColor="text-slate-300"
                    inputClassName={`px-3 py-1.5 text-sm font-mono border ${derivedStats.purchasedVitality > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                  />
                  {derivedStats.purchasedVitality > 0 && (
                    <div className="absolute top-0 right-0 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1.5 py-0.5 rounded-bl">
                      +{derivedStats.purchasedVitality} (Purchased)
                    </div>
                  )}
                </div>

                <div className="flex flex-col relative group">
                  <FolioInput
                    id="health"
                    label="Health (Lethal)"
                    type="number"
                    value={getNum('health', 30)}
                    onChange={handleStatChange}
                    labelColor="text-slate-300"
                    inputClassName={`px-3 py-1.5 text-sm font-mono border ${derivedStats.purchasedHealth > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                  />
                  {derivedStats.purchasedHealth > 0 && (
                    <div className="absolute top-0 right-0 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1.5 py-0.5 rounded-bl">
                      +{derivedStats.purchasedHealth} (Purchased)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Synthetic Structure Notice if applicable */}
            {derivedStats?.isSynthetic && (
              <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <span>⚙️</span> <strong>Synthetic Structure Pool:</strong> Combined Vitality ({getNum('vitality', 30)}) + Health ({getNum('health', 30)})
                </span>
                <span className="text-sm font-bold text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-600/40">
                  {derivedStats.structure} SP
                </span>
              </div>
            )}

            {/* Death & Dying / Mortality Status Banner */}
            {(() => {
              const curH = getNum('health', 30);
              const curV = getNum('vitality', 30);
              const isDead = characterData?.is_dead || false;
              const atDeathsDoor = !isDead && (characterData?.is_at_deaths_door || (curH <= 0 && curV <= 0));
              const isIncapacitated = !isDead && !atDeathsDoor && curH <= 0;
              const isStabilized = characterData?.is_stabilized || false;
              const deathClock = characterData?.death_clock ?? Math.max(1, getAttrTotal('attr-stamina') || 1);

              if (isDead) {
                return (
                  <div className="p-3 rounded-lg bg-slate-950/95 border border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚰️</span>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-red-400">
                          Status: Permanently Deceased
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Character has succumbed to death. May be revived via high-level Metaphysics or TL5 Tech.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Perform Revivification? 'The High Cost of Dying' applies: Character loses ALL remaining Karma Points and suffers a -5 Experience Debt.")) {
                          revivifyCharacter();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-100 border border-red-500 rounded text-xs font-bold tracking-wide uppercase transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                      title="Revivify character (High Cost of Dying: -All Karma, -5 Experience Debt)"
                    >
                      <span>⚡</span> Revivify Character (-5 XP Debt)
                    </button>
                  </div>
                );
              }

              if (atDeathsDoor) {
                return (
                  <div className="p-3 rounded-lg bg-rose-950/90 border border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)] flex flex-wrap items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💀</span>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <span>DEATH'S DOOR</span>
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-rose-900 border border-rose-500 text-rose-100">
                            {isStabilized ? 'STABILIZED (Clock Stopped)' : `Clock: ${deathClock} Round${deathClock === 1 ? '' : 's'} Remaining`}
                          </span>
                        </div>
                        <div className="text-[10px] text-rose-300/80">
                          {isStabilized
                            ? 'Character is unconscious and severely wounded, but no longer actively dying.'
                            : 'Character is Comatose. Medical aid (Medicine DC 15) or healing tech/magic must be applied before the clock expires!'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isStabilized && (
                        <>
                          <button
                            type="button"
                            onClick={() => stabilizeCharacter({ hasHealingEffect: true })}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold uppercase tracking-wider border border-emerald-400 shadow-sm transition-colors cursor-pointer"
                            title="Apply Medicine (DC 15) or healing to stop the death clock"
                          >
                            🩹 Stabilize (DC 15)
                          </button>
                          <button
                            type="button"
                            onClick={() => advanceCharacterDeathTurn()}
                            className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[11px] font-mono font-bold uppercase tracking-wider border border-rose-700 transition-colors cursor-pointer"
                            title="Advance combat round without medical aid (-1 round from death clock)"
                          >
                            ⏳ -1 Round
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              }

              if (isIncapacitated) {
                return (
                  <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-600/70 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛌</span>
                      <div>
                        <strong className="uppercase tracking-wide font-bold">Incapacitated (0 Health):</strong>
                        <span className="text-slate-300 text-[11px] ml-1.5">Unconscious and Prone. Drops held items. Still has Vitality buffer ({curV} Vit).</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {/* Rest & Recovery Bar */}
            <div className="bg-slate-950/60 border border-cyan-900/50 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">☕</span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Rest &amp; Recovery
                </span>
              </div>

              <button
                type="button"
                onClick={() => openRulesModal('rest')}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Open Rest & Recovery Manager (Full Rest & Light Rest Tiers)"
              >
                <span>☕</span> Take Rest / Rules
              </button>
            </div>

          </div>

          {/* Movement Block (Displays only enabled modes with quick add option) */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Movement Modes
                </h3>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  (1 Turn = 6s • Ground Base: {characterData['move-walk'] || 30} ft)
                </span>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsMovementRulesOpen(true)}
                  className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-[10px] font-bold text-amber-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Movement Paces & Fatigue Rules Codex"
                >
                  <span>🏃</span> Movement Rules
                </button>

                {unenabledModes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddMovementMode(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded px-2 py-0.5 text-[10px] text-cyan-300 font-bold uppercase outline-none cursor-pointer"
                    >
                      <option value="" disabled>+ Enable Mode...</option>
                      {unenabledModes.map(m => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">{m.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeMoveModes.map((mode) => {
                const config = allPossibleMoveModes.find(m => m.id === mode) || { id: mode, label: mode, defaultSpeed: 30 };
                const speedVal = getNum(`move-${mode}`, config.defaultSpeed);

                return (
                  <div key={mode} className="flex flex-col bg-slate-800/40 p-2.5 rounded border border-slate-700/80 relative group">
                    <FolioInput
                      id={`move-${mode}`}
                      label={`${config.label} (ft)`}
                      type="number"
                      value={speedVal}
                      onChange={updateField}
                      labelColor="text-cyan-400"
                      labelSize="text-[10px]"
                      containerClassName="flex flex-col"
                      inputClassName="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center"
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-1">
                      <span>{Math.round(speedVal * 0.3)} m/turn</span>
                      {mode !== 'walk' && (
                        <button
                          type="button"
                          onClick={() => updateField(`move-${mode}`, 0)}
                          className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Disable movement mode"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Block */}
          <div className="bg-slate-900/60 border border-emerald-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-emerald-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎖️</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  Experience
                </h3>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  (1 AP = 1 BP)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => openRulesModal('experience')}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open canonical Experience, AP & Advancement Rules Codex"
                >
                  <span>📖</span> XP Rules
                </button>

                <button
                  type="button"
                  onClick={() => setIsFateOverrideOpen(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-[10px] font-bold text-slate-300 hover:text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open discreet override modal for Karma, Plot Points, and Experience"
                >
                  <span>⚙️</span> Overrides
                </button>
              </div>
            </div>

            {/* Experience Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              {(() => {
                const earnedAP = Number(characterData?.earned_ap || 0);
                const availableAP = economyBreakdown?.availableAP ?? earnedAP;
                const spentAP = Number(characterData?.spent_ap || 0);
                const debt = Number(characterData?.experience_debt || 0);

                return (
                  <>
                    <div className="p-2 rounded border bg-slate-800/50 border-emerald-700/60 text-center flex flex-col justify-between" title="Earned Award Points (Lifetime Campaign Total)">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">Earned AP</span>
                      <span className="text-base font-black text-emerald-300">+{earnedAP}</span>
                      <span className="text-[8.5px] text-slate-500">Lifetime Total</span>
                    </div>

                    <div className="p-2 rounded border bg-slate-800/50 border-cyan-700/60 text-center flex flex-col justify-between" title="Available Award Points ready to spend on advancement">
                      <span className="text-[10px] uppercase font-bold text-cyan-300">Available</span>
                      <span className="text-base font-black text-cyan-200">{availableAP}</span>
                      <span className="text-[8.5px] text-slate-500">Unspent AP</span>
                    </div>

                    <div className="p-2 rounded border bg-slate-800/50 border-slate-700 text-center flex flex-col justify-between" title="Award Points spent on attributes, skills, and traits">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Spent AP</span>
                      <span className="text-base font-bold text-slate-200">{spentAP}</span>
                      <span className="text-[8.5px] text-slate-500">Invested AP</span>
                    </div>

                    <div className={`p-2 rounded border text-center flex flex-col justify-between ${
                      debt > 0 
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-300' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`} title={debt > 0 ? "Active Experience Debt from Revivification" : "No Experience Debt"}>
                      <span className="text-[10px] uppercase font-bold text-slate-400">XP Debt</span>
                      <span className={`text-base font-black ${debt > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {debt > 0 ? `-${debt}` : '0'}
                      </span>
                      <span className="text-[8.5px] text-slate-500">
                        {debt > 0 ? 'High Cost of Dying' : 'Clear'}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Experience Debt Action Banner if Debt > 0 */}
            {(characterData?.experience_debt || 0) > 0 && (
              <div className="p-2 rounded bg-rose-950/30 border border-rose-800/40 flex items-center justify-between gap-2 text-xs">
                <span className="text-rose-300 text-[11px]">
                  ⚠️ <strong>XP Debt Active (-{characterData.experience_debt}):</strong> Future earned AP automatically settles debt before converting to available AP.
                </span>
                {(economyBreakdown?.availableAP ?? characterData?.earned_ap ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => payExperienceDebt(1)}
                    className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-100 rounded text-[10px] font-bold border border-rose-600 transition-colors shrink-0 cursor-pointer"
                    title="Pay 1 AP towards Experience Debt"
                  >
                    Pay 1 AP
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
      {/* Discreet Fate & Experience Override Modal */}
      <DiscreetFateOverrideModal
        isOpen={isFateOverrideOpen}
        onClose={() => setIsFateOverrideOpen(false)}
        characterData={characterData}
        updateField={updateField}
        economyBreakdown={economyBreakdown}
        derivedStats={derivedStats}
        charismaScore={getAttrTotal('attr-charisma')}
      />

      {/* Consolidated Core Stats Rules Codex Modal */}
      <PerceptionEssenceMovementModal
        isOpen={isCoreRulesModalOpen}
        onClose={() => setIsCoreRulesModalOpen(false)}
        initialTab={coreRulesInitialTab}
        characterData={characterData}
        getAttrTotal={getAttrTotal}
        derivedStats={derivedStats}
      />

      {/* Dedicated Perception Rules Modal */}
      <PerceptionRulesModal
        isOpen={isPerceptionRulesOpen}
        onClose={() => setIsPerceptionRulesOpen(false)}
        characterData={characterData}
        getAttrTotal={getAttrTotal}
        derivedStats={derivedStats}
      />

      {/* Dedicated Movement Rules Modal */}
      <MovementRulesModal
        isOpen={isMovementRulesOpen}
        onClose={() => setIsMovementRulesOpen(false)}
        characterData={characterData}
        getAttrTotal={getAttrTotal}
        derivedStats={derivedStats}
      />

    </div>
  );
};

export default React.memo(CoreStatsTab);
