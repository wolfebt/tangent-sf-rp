import React, { useState } from 'react';
import FolioInput from '../shared/FolioInput';
import FolioTooltip from '../shared/FolioTooltip';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { Dices } from 'lucide-react';
import DiscreetFateOverrideModal from '../modals/DiscreetFateOverrideModal';
import KarmaCodexModal from '../modals/KarmaCodexModal';
import ExperienceCodexModal from '../modals/ExperienceCodexModal';
import PerceptionEssenceMovementModal from '../modals/PerceptionEssenceMovementModal';
import PerceptionRulesModal from '../modals/PerceptionRulesModal';
import MovementRulesModal from '../modals/MovementRulesModal';

const ATTRIBUTES = [
  {
    name: 'Strength',
    code: 'STR',
    id: 'attr-strength',
    sub: false,
    badge: 'Primary Attribute',
    badgeColor: 'cyan',
    desc: 'Strength measures physical power, force, and stability. Crucial for lifting heavy gear, breaking objects, and melee combat damage.',
    formula: 'Roll / Save Mod: Score + Mod',
    cost: '5 CP / +1',
    tags: ['STR', 'Combat', 'Athletics']
  },
  {
    name: 'Might',
    code: 'Might (STR)',
    id: 'attr-might',
    sub: true,
    primaryId: 'attr-strength',
    badge: 'Attribute Check',
    badgeColor: 'amber',
    desc: 'Raw physical power check: lifting gates, bending bars, prying open bulkheads, breaking chains, and smashing structural obstacles.',
    formula: 'Base = 2 + (Strength × 2)',
    cost: '1 BP / +1',
    tags: ['Check', 'DC Roll', 'Brute Force']
  },
  {
    name: 'Agility',
    code: 'AGI',
    id: 'attr-agility',
    sub: false,
    badge: 'Primary Attribute',
    badgeColor: 'cyan',
    desc: 'Agility measures balance, coordination, nimbleness, and manual dexterity. Crucial for dodging attacks, acrobatics, and ranged accuracy.',
    formula: 'Roll / Save Mod: Score + Mod',
    cost: '5 CP / +1',
    tags: ['AGI', 'Ranged', 'Evasion']
  },
  {
    name: 'Reflex',
    code: 'Reflex (AGI)',
    id: 'attr-reflex',
    sub: true,
    primaryId: 'attr-agility',
    badge: 'Saving Throw / Check',
    badgeColor: 'amber',
    desc: 'Reaction check: dodging area-of-effect explosions, catching falling/thrown objects, rapid evasion, acrobatic feats, and initiative baseline.',
    formula: 'Base = 2 + (Agility × 2)',
    cost: '1 BP / +1',
    tags: ['Save', 'Initiative Base', 'Evasion']
  },
  {
    name: 'Stamina',
    code: 'STA',
    id: 'attr-stamina',
    sub: false,
    badge: 'Primary Attribute',
    badgeColor: 'cyan',
    desc: 'Stamina measures endurance, toughness, and physiological resistance. Determines base Toughness damage buffer and fatigue tolerance.',
    formula: 'Roll / Save Mod: Score + Mod',
    cost: '5 CP / +1',
    tags: ['STA', 'Toughness', 'Endurance']
  },
  {
    name: 'Fortitude',
    code: 'Fortitude (STA)',
    id: 'attr-fortitude',
    sub: true,
    primaryId: 'attr-stamina',
    badge: 'Saving Throw / Check',
    badgeColor: 'amber',
    desc: 'Endurance save: resisting toxins, alien pathogens, radiation, extreme atmospheric pressure/temperature, and physical exhaustion.',
    formula: 'Base = 2 + (Stamina × 2)',
    cost: '1 BP / +1',
    tags: ['Save', 'Biohazard', 'Endurance']
  },
  {
    name: 'Intellect',
    code: 'INT',
    id: 'attr-intellect',
    sub: false,
    badge: 'Primary Attribute',
    badgeColor: 'cyan',
    desc: 'Intellect measures reason, logic, wits, and memory. Crucial for problem-solving, deduction, tech operation, and decoding alien systems.',
    formula: 'Roll / Save Mod: Score + Mod',
    cost: '5 CP / +1',
    tags: ['INT', 'Logic', 'Engineering']
  },
  {
    name: 'Reason',
    code: 'Reason (INT)',
    id: 'attr-logic',
    aliasId: 'attr-reason',
    sub: true,
    primaryId: 'attr-intellect',
    badge: 'Attribute Check',
    badgeColor: 'amber',
    desc: 'Intellect check: cracking ciphers, deciphering alien scripts, solving ancient mechanical riddles, and comprehending technical blueprints.',
    formula: 'Base = 2 + (Intellect × 2)',
    cost: '1 BP / +1',
    tags: ['Check', 'Cryptography', 'Deduction']
  },
  {
    name: 'Wisdom',
    code: 'WIS',
    id: 'attr-wisdom',
    sub: false,
    badge: 'Primary Attribute',
    badgeColor: 'cyan',
    desc: 'Wisdom measures insight, intuition, mental focus, and empathy. Crucial for detecting deception, resisting panic, and metaphysical discipline.',
    formula: 'Roll / Save Mod: Score + Mod',
    cost: '5 CP / +1',
    tags: ['WIS', 'Insight', 'Metaphysics']
  },
  {
    name: 'Willpower',
    code: 'Willpower (WIS)',
    id: 'attr-will',
    aliasId: 'attr-willpower',
    sub: true,
    primaryId: 'attr-wisdom',
    badge: 'Saving Throw / Check',
    badgeColor: 'amber',
    desc: 'Mental save: resisting terror/fear, breaking free from mind control or psychic manipulation, and maintaining deep focus under extreme stress.',
    formula: 'Base = 2 + (Wisdom × 2)',
    cost: '1 BP / +1',
    tags: ['Save', 'Mental Screen', 'Focus']
  },
  {
    name: 'Charisma',
    code: 'CHA',
    id: 'attr-charisma',
    sub: false,
    badge: 'Primary Attribute',
    badgeColor: 'cyan',
    desc: 'Charisma measures confidence, assertiveness, personal magnetism, and presence. Key for persuasion, commanding allies, and social leadership.',
    formula: 'Roll / Save Mod: Score + Mod',
    cost: '5 CP / +1',
    tags: ['CHA', 'Leadership', 'Presence']
  },
  {
    name: 'Etiquette',
    code: 'Etiquette (CHA)',
    id: 'attr-etiquette',
    sub: true,
    primaryId: 'attr-charisma',
    badge: 'Attribute Check',
    badgeColor: 'amber',
    desc: 'Social check: diplomacy, bartering treaties, navigating aristocratic courts or underworld cantinas, and de-escalating tense confrontations.',
    formula: 'Base = 2 + (Charisma × 2)',
    cost: '1 BP / +1',
    tags: ['Check', 'Diplomacy', 'Barter']
  }
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
    deathAndDyingRules,
    isInActiveGame,
    isGMConfirmed,
    updateCharacterVitality
  } = useFolio();

  const { openDiceRoller } = useDice();

  const isStatsLocked = isInActiveGame && !isGMConfirmed;

  const [isFateOverrideOpen, setIsFateOverrideOpen] = useState(false);
  const [isKarmaCodexOpen, setIsKarmaCodexOpen] = useState(false);
  const [isExperienceCodexOpen, setIsExperienceCodexOpen] = useState(false);
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
    const minVal = id === 'health' ? (derivedStats?.health || 30) : id === 'vitality' ? (derivedStats?.vitality || 30) : 0;
    if (newVal < minVal) {
      newVal = minVal;
    }
    if (newVal > (derivedStats?.maxAllowed || 120)) {
      newVal = derivedStats?.maxAllowed || 120;
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
                          <FolioTooltip
                            title={attr.code ? `${attr.name} (${attr.code})` : attr.name}
                            badge={attr.badge}
                            badgeColor={attr.badgeColor}
                            description={attr.desc}
                            formula={attr.formula}
                            cost={attr.cost}
                            tags={attr.tags}
                            showInfoIcon={true}
                          >
                            <div className="flex items-center gap-1.5 font-sans">
                              {isSub && <span className="text-slate-600 text-xs pl-1.5">↳</span>}
                              <span className={isSub ? 'text-slate-300 text-xs hover:text-cyan-300 transition-colors' : 'text-cyan-400 font-bold text-xs hover:text-cyan-200 transition-colors'}>
                                {attr.name}
                              </span>
                              {!isSub && (
                                <span className="text-[9px] font-mono text-slate-500 font-normal">
                                  {rawBase > 4 ? (
                                    <span className="text-amber-400 font-bold" title="Exceeds standard creation cap (+4); requires species or augmentation modifiers">
                                      (+{rawBase} &gt; +4 Cap)
                                    </span>
                                  ) : (
                                    '(Cap +4)'
                                  )}
                                </span>
                              )}
                            </div>
                          </FolioTooltip>
                        </td>
                        <td className="py-0.5 px-1.5 text-center">
                          <input
                            type="number"
                            value={isNaN(rawBase) ? 0 : rawBase}
                            onChange={(e) => isSub ? handleSubAttrChange(attr.id, e.target.value) : handlePrimaryChange(attr.id, e.target.value)}
                            disabled={isStatsLocked}
                            title={isStatsLocked ? 'Attribute locked during active game session. Request GM update.' : ''}
                            className={`w-11 text-center bg-slate-900 border rounded px-1 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 ${
                              isStatsLocked
                                ? 'opacity-60 cursor-not-allowed border-slate-800 text-slate-400'
                                : isSub ? 'border-slate-800 text-slate-300' : 'border-slate-700 font-bold'
                            }`}
                          />
                        </td>
                        <td className="py-0.5 px-1.5 text-center">
                          <span className={`text-xs font-mono ${mod > 0 ? 'text-emerald-400' : mod < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                            {mod > 0 ? `+${mod}` : mod === 0 ? '0' : mod}
                          </span>
                        </td>
                        <td className="py-0.5 px-1.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`text-xs font-bold font-mono ${isSub ? 'text-amber-300' : 'text-cyan-300'}`}>
                              {total > 0 && !isSub ? `+${total}` : total}
                            </span>
                            {isSub ? (
                              <button
                                type="button"
                                onClick={() => openDiceRoller({
                                  label: `${attr.name} Check (${attr.code})`,
                                  baseModifier: total,
                                  expression: `2d10${total !== 0 ? (total > 0 ? `+${total}` : `${total}`) : ''}`,
                                  rollMode: 'normal',
                                  characterName: characterData['char-name'] || 'Operative',
                                  autoRoll: true
                                })}
                                className="px-1.5 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-0.5 shrink-0"
                                title={`Roll ${attr.name} Check (2d10 + ${total})`}
                              >
                                <Dices size={11} className="text-amber-400" />
                                <span>Roll</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openDiceRoller({
                                  label: `${attr.name} Check (${attr.code})`,
                                  baseModifier: total,
                                  expression: `2d10${total !== 0 ? (total > 0 ? `+${total}` : `${total}`) : ''}`,
                                  rollMode: 'normal',
                                  characterName: characterData['char-name'] || 'Operative',
                                  autoRoll: true
                                })}
                                className="p-1 rounded bg-slate-900/60 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
                                title={`Roll ${attr.name} Check (2d10 + ${total})`}
                              >
                                <Dices size={10} />
                              </button>
                            )}
                          </div>
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
                <FolioTooltip
                  title="Perception Sub-Ability"
                  badge="Sensory Acuity"
                  badgeColor="cyan"
                  description="Reflects overall awareness and sensory discernment. Combined with specialized skills for all detection checks."
                  formula="Base Perception = Intellect + Wisdom"
                  tags={['Intellect', 'Wisdom', 'Detection']}
                  showInfoIcon={true}
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
                    Perception
                  </h3>
                </FolioTooltip>
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
              <FolioTooltip
                title="Base Perception"
                badge="Innate Acuity"
                badgeColor="slate"
                description="The core sensory acuity and mental focus score derived from Intellect and Wisdom."
                formula="Base = Intellect + Wisdom"
                tags={['INT', 'WIS']}
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center w-full hover:border-cyan-500/50 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Base</span>
                  <span className="text-sm font-bold font-mono text-cyan-300">{basePerception}</span>
                  <span className="text-[8.5px] text-slate-500 font-mono">INT+WIS</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="Default Detection Check"
                badge="General Detection"
                badgeColor="cyan"
                description="Noticing concealed objects, spotting ambushes, hearing approaching footsteps, and environmental awareness."
                formula="Detection = Base Perception + Alertness (Rank + Mod)"
                tags={['Alertness', 'Hazards', 'Stealth Contests']}
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-cyan-700/60 text-center w-full hover:border-cyan-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-cyan-300">Default</span>
                  <span className="text-sm font-bold font-mono text-cyan-200">{alertPerception}</span>
                  <span className="text-[8.5px] text-cyan-400/80 font-mono">+{alertnessRank + alertnessMod} Alert</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: 'Perception Check (Alertness)',
                        baseModifier: alertPerception,
                        expression: `2d10${alertPerception !== 0 ? (alertPerception > 0 ? `+${alertPerception}` : `${alertPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: true
                      });
                    }}
                    className="mt-1 py-0.5 px-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[9px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Roll Default Perception Check (2d10 + ${alertPerception})`}
                  >
                    <Dices size={10} /> Roll
                  </button>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="Metaphysical Perception"
                badge="Etheric Detection"
                badgeColor="amber"
                description="Sensing active psionic energy, spatial distortions, dimensional rifts, invisible spirits, and metaphysical resonance."
                formula="Meta = Base Perception + Attune (Rank + Mod)"
                tags={['Attune', 'Psionics', 'Magic']}
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-amber-700/60 text-center w-full hover:border-amber-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Meta</span>
                  <span className="text-sm font-bold font-mono text-amber-300">{metaPerception}</span>
                  <span className="text-[8.5px] text-amber-400/80 font-mono">+{attuneRank + attuneMod} Attune</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: 'Metaphysical Perception Check (Attune)',
                        baseModifier: metaPerception,
                        expression: `2d10${metaPerception !== 0 ? (metaPerception > 0 ? `+${metaPerception}` : `${metaPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: true
                      });
                    }}
                    className="mt-1 py-0.5 px-1 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded text-[9px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Roll Metaphysical Perception Check (2d10 + ${metaPerception})`}
                  >
                    <Dices size={10} /> Roll
                  </button>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="Social Perception"
                badge="Empathy & Motives"
                badgeColor="emerald"
                description="Reading body language, pupil dilation, vocal stress tremors, identifying lies, and discerning true intentions."
                formula="Social = Base Perception + Insight (Rank + Mod)"
                tags={['Insight', 'Deception', 'Empathy']}
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-emerald-700/60 text-center w-full hover:border-emerald-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Social</span>
                  <span className="text-sm font-bold font-mono text-emerald-300">{socialPerception}</span>
                  <span className="text-[8.5px] text-emerald-400/80 font-mono">+{insightRank + insightMod} Insight</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: 'Social Perception Check (Insight)',
                        baseModifier: socialPerception,
                        expression: `2d10${socialPerception !== 0 ? (socialPerception > 0 ? `+${socialPerception}` : `${socialPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: true
                      });
                    }}
                    className="mt-1 py-0.5 px-1 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded text-[9px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Roll Social Perception Check (2d10 + ${socialPerception})`}
                  >
                    <Dices size={10} /> Roll
                  </button>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="Technical Perception"
                badge="Hardware & Scans"
                badgeColor="blue"
                description="Scanning sensor arrays, identifying electronic bugs, detecting electromagnetic interference, and deciphering telemetry."
                formula="Tech = Base Perception + Technology (Rank + Mod)"
                tags={['Technology', 'Sensors', 'Scanners']}
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-blue-700/60 text-center col-span-2 sm:col-span-1 w-full hover:border-blue-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Tech</span>
                  <span className="text-sm font-bold font-mono text-blue-300">{techPerception}</span>
                  <span className="text-[8.5px] text-blue-400/80 font-mono">+{techRank + techMod} Tech</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: 'Technical Perception Check (Technology)',
                        baseModifier: techPerception,
                        expression: `2d10${techPerception !== 0 ? (techPerception > 0 ? `+${techPerception}` : `${techPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: true
                      });
                    }}
                    className="mt-1 py-0.5 px-1 bg-blue-950/90 hover:bg-blue-900 border border-blue-500/50 text-blue-300 rounded text-[9px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Roll Technical Perception Check (2d10 + ${techPerception})`}
                  >
                    <Dices size={10} /> Roll
                  </button>
                </div>
              </FolioTooltip>
            </div>
          </div>

          {/* Fate Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <FolioTooltip
                  title="Fate Reserve (Karma & Plot Points)"
                  badge="Heroic Destiny"
                  badgeColor="cyan"
                  description="A hero's supernatural destiny pool used to seize tactical advantage, reroll failed checks, or alter narrative circumstances."
                  tags={['Karma', 'Plot Points', 'Advantage']}
                  showInfoIcon={true}
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
                    Fate
                  </h3>
                </FolioTooltip>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  (Karma &amp; Plot Points)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsKarmaCodexOpen(true)}
                  className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-[10px] font-bold text-purple-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Karma Codex & Ledger"
                >
                  <span>☸️</span> Karma Codex
                </button>

                <button
                  type="button"
                  onClick={() => openRulesModal('karma')}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open canonical Karma & Fate Rules Codex"
                >
                  <span>📖</span> Rules
                </button>

                <button
                  type="button"
                  onClick={() => setIsFateOverrideOpen(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/60 text-[10px] font-bold text-slate-300 hover:text-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open discreet override modal for Karma, Plot Points, and Advancement Points"
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
                  <FolioTooltip
                    title="Karma Pool"
                    badge="Metaphysical Destiny"
                    badgeColor="cyan"
                    description="Spend 1 Karma to roll with Advantage, reroll any d20 check, or survive fatal damage at 0 Health. Negative values indicate Karmic Debt."
                    formula={`Current: ${currentKarma} / Max: ${maxKarma}`}
                    tags={['Reroll', 'Advantage', 'Survival']}
                  >
                    <div className={`p-2.5 rounded border flex flex-col justify-between w-full ${
                      isDebt 
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-300' 
                        : 'bg-slate-800/50 border-cyan-700/60 text-cyan-300 hover:border-cyan-400 transition-colors'
                    }`}>
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
                      <button
                        type="button"
                        onClick={() => {
                          if (currentKarma <= 0) return;
                          spendKarma(1);
                          const maxVit = parseInt(characterData.vitality || 30, 10);
                          const curVit = parseInt(characterData.current_vitality ?? characterData.vitality ?? 30, 10);
                          const restoreAmount = Math.round(maxVit * 0.5);
                          const nextVit = Math.min(maxVit, curVit + restoreAmount);
                          updateCharacterVitality(characterData['character-doc-id'] || characterData.id, nextVit);
                        }}
                        disabled={currentKarma <= 0}
                        className="mt-1 py-0.5 px-1.5 bg-cyan-950/90 hover:bg-cyan-900 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-500/50 text-cyan-200 rounded text-[9.5px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                        title="Spend 1 Karma to invoke Second Wind: Instantly restore 50% max Vitality"
                      >
                        <span>💨</span> Second Wind (+50% Vit)
                      </button>
                    </div>
                  </FolioTooltip>
                );
              })()}

              {/* Plot Points Card */}
              {(() => {
                const plotPoints = getNum('plot-points', 0);
                return (
                  <FolioTooltip
                    title="Plot Points"
                    badge="Narrative Influence"
                    badgeColor="purple"
                    description="Heroic tokens awarded for dramatic roleplay and character milestones. Spend to introduce creative plot elements, serendipitous items, or ally interventions."
                    formula={`Tokens: ${plotPoints}`}
                    tags={['Narrative', 'Twists', 'Story']}
                  >
                    <div className="p-2.5 rounded border bg-slate-800/50 border-fuchsia-700/60 text-fuchsia-300 flex flex-col justify-between w-full hover:border-fuchsia-400 transition-colors">
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
                  </FolioTooltip>
                );
              })()}
            </div>
          </div>

          {/* Essence Block (Positioned Under Fate) */}
          <div className="bg-slate-900/60 border border-purple-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-purple-900/60 pb-2 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <FolioTooltip
                  title="Essence Capacity"
                  badge="Metaphysical Energy"
                  badgeColor="purple"
                  description="The total etheric energy an operative can safely channel without suffering physical or psychological burn."
                  formula="Essence = 6 Primary Attributes + Meta Skills Total"
                  tags={['Metaphysics', 'Mana', 'Energy']}
                  showInfoIcon={true}
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
                    Essence
                  </h3>
                </FolioTooltip>
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
              <FolioTooltip
                title="Total Essence Capacity"
                badge="Total Pool"
                badgeColor="purple"
                description="Total metaphysical energy reserve of the character."
                formula="Essence = Primary Attributes + Meta Skills Total"
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-purple-700/60 text-center w-full hover:border-purple-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-purple-300">Total Essence</span>
                  <span className="text-sm font-bold font-mono text-purple-200">{essenceTotal}</span>
                  <span className="text-[8.5px] text-purple-400/80 font-mono">Pool Capacity</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="Ability Substrate"
                badge="Containment Vessel"
                badgeColor="cyan"
                description="The physiological and cognitive vessel housing metaphysical Code. Formed by the sum of all 6 core attributes."
                formula="Substrate = STR + AGI + STA + INT + WIS + CHA"
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center w-full hover:border-cyan-500/50 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Substrate</span>
                  <span className="text-sm font-bold font-mono text-cyan-300">+{primaryAttrsTotal}</span>
                  <span className="text-[8.5px] text-slate-500 font-mono">6 Primary Attrs</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="The Conduit (Attune)"
                badge="Resonance Bandwidth"
                badgeColor="amber"
                description="Your operational resonance with the Void. Determines bandwidth for channeling metaphysical code safely."
                formula="Conduit = Attune Rank + Attune Mod"
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-amber-700/60 text-center w-full hover:border-amber-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Conduit</span>
                  <span className="text-sm font-bold font-mono text-amber-300">+{attuneRank + attuneMod}</span>
                  <span className="text-[8.5px] text-amber-400/80 font-mono">Attune Skill</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="The Breadth (Disciplines)"
                badge="Disciplines Total"
                badgeColor="purple"
                description="Total ranks and modifiers across Dimension, Energy, Entropy, Illusion, Matter, and Mental skills."
                formula="Breadth = Sum of all Discipline Skills"
              >
                <div className="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700 text-center w-full hover:border-purple-400 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Disciplines</span>
                  <span className="text-sm font-bold font-mono text-cyan-300">+{Math.max(0, metaSkillsTotal - (attuneRank + attuneMod))}</span>
                  <span className="text-[8.5px] text-slate-500 font-mono">Meta Skills</span>
                </div>
              </FolioTooltip>
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
                <FolioTooltip
                  title="Initiative"
                  badge="Turn Priority"
                  badgeColor="amber"
                  description="Determines combat reaction speed and positioning in tactical combat rounds. Uses Reflex Check + modifiers."
                  formula={`Initiative = Reflex (${reflexTotal}) + Mod (${initiativeMod}) = ${initiativeTotal}`}
                  tags={['Reflex', 'Combat Round', 'Turn Order']}
                >
                  <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2.5 rounded border border-cyan-900/40 min-h-[52px] w-full hover:border-cyan-400 transition-colors">
                    <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Initiative
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-amber-400 font-mono">{initiativeTotal}</span>
                      <button
                        type="button"
                        onClick={() => openDiceRoller({
                          label: 'Initiative Check',
                          baseModifier: initiativeTotal,
                          expression: `2d10${initiativeTotal !== 0 ? (initiativeTotal > 0 ? `+${initiativeTotal}` : `${initiativeTotal}`) : ''}`,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Operative',
                          autoRoll: true
                        })}
                        className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 shrink-0"
                        title={`Roll Initiative Check (2d10 + ${initiativeTotal})`}
                      >
                        <Dices size={12} className="text-amber-400" />
                        <span>Roll</span>
                      </button>
                    </div>
                  </div>
                </FolioTooltip>

                <FolioTooltip
                  title="Natural DR (Toughness)"
                  badge="Stamina DR"
                  badgeColor="emerald"
                  description="All character Stamina is a natural damage reduction (DR) and automatically reduces all incoming damage which penetrates the character's defenses, minimum of 1 point."
                  formula={`Natural DR = Stamina Total (${derivedStats?.stamina ?? derivedStats?.toughness ?? 0})`}
                  tags={['Stamina', 'Natural DR', 'Min 1 Point']}
                >
                  <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2.5 rounded border border-emerald-900/40 min-h-[52px] w-full hover:border-emerald-400 transition-colors" title="All character Stamina is a natural damage reduction (DR) and automatically reduces all incoming damage which penetrates defenses, minimum of 1 point.">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Natural DR (STA)
                    </label>
                    <span className="text-lg font-bold text-emerald-300 font-mono">+{derivedStats?.stamina ?? derivedStats?.toughness ?? 0}</span>
                  </div>
                </FolioTooltip>
              </div>

              {/* Right Column: Vitality over Health */}
              <div className="space-y-2.5">
                <FolioTooltip
                  title="Vitality (Non-Lethal)"
                  badge="Non-Lethal Capacity"
                  badgeColor="cyan"
                  description="Combat poise, dodging stamina, and non-lethal stress buffer. Absorbs non-lethal damage directly. When non-lethal damage exceeds Vitality, excess spills into Health as lethal damage."
                  formula={`Base: 30 + Purchased: ${derivedStats?.purchasedVitality || 0} (Max Increase: ${derivedStats?.maxStatIncrease ?? ((derivedStats?.stamina || 0) * 5)})`}
                  cost="1 CP = +5 Vitality (Max: 5 × STA)"
                  tags={['Non-Lethal', 'Vitality Buffer', 'Base 30']}
                >
                  <div className="flex flex-col relative group w-full">
                    <FolioInput
                      id="vitality"
                      label="Vitality (Non-Lethal)"
                      type="number"
                      value={getNum('vitality', derivedStats?.vitality || 30)}
                      onChange={handleStatChange}
                      labelColor="text-slate-300"
                      inputClassName={`px-3 py-1.5 text-sm font-mono border ${derivedStats?.purchasedVitality > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                    />
                    {derivedStats?.purchasedVitality > 0 && (
                      <div className="absolute top-0 right-0 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1.5 py-0.5 rounded-bl">
                        +{derivedStats.purchasedVitality} (Purchased)
                      </div>
                    )}
                  </div>
                </FolioTooltip>

                <FolioTooltip
                  title="Health (Lethal)"
                  badge="Physical Integrity"
                  badgeColor="rose"
                  description="Core bodily tissue and organ integrity. Depleted directly by lethal strikes or when non-lethal damage overflows depleted Vitality. Falling to 0 results in Incapacitation or Dying."
                  formula={`Base: 30 + Purchased: ${derivedStats?.purchasedHealth || 0} (Max Increase: ${derivedStats?.maxStatIncrease ?? ((derivedStats?.stamina || 0) * 5)})`}
                  cost="1 CP = +5 Health (Max: 5 × STA)"
                  tags={['Lethal', 'Physical Integrity', 'Base 30']}
                >
                  <div className="flex flex-col relative group w-full">
                    <FolioInput
                      id="health"
                      label="Health (Lethal)"
                      type="number"
                      value={getNum('health', derivedStats?.health || 30)}
                      onChange={handleStatChange}
                      labelColor="text-slate-300"
                      inputClassName={`px-3 py-1.5 text-sm font-mono border ${derivedStats?.purchasedHealth > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                    />
                    {derivedStats?.purchasedHealth > 0 && (
                      <div className="absolute top-0 right-0 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1.5 py-0.5 rounded-bl">
                        +{derivedStats.purchasedHealth} (Purchased)
                      </div>
                    )}
                  </div>
                </FolioTooltip>
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

                const moveDescriptions = {
                  walk: {
                    title: 'Walk / Ground Speed',
                    badge: 'Overland Speed',
                    badgeColor: 'cyan',
                    desc: 'Standard tactical overland ground movement speed (1 combat round = 6 seconds).',
                    formula: `Current: ${speedVal} ft (${Math.round(speedVal * 0.3)} m/turn)`
                  },
                  swim: {
                    title: 'Swim Speed',
                    badge: 'Aquatic Speed',
                    badgeColor: 'blue',
                    desc: 'Aquatic travel speed without requiring Athletics checks in calm water.',
                    formula: `Current: ${speedVal} ft (${Math.round(speedVal * 0.3)} m/turn)`
                  },
                  climb: {
                    title: 'Climb Speed',
                    badge: 'Vertical Speed',
                    badgeColor: 'emerald',
                    desc: 'Vertical scaling speed across walls, ladders, scaffolding, and mountainous cliffs.',
                    formula: `Current: ${speedVal} ft (${Math.round(speedVal * 0.3)} m/turn)`
                  },
                  fly: {
                    title: 'Flight Speed',
                    badge: 'Aerial Speed',
                    badgeColor: 'purple',
                    desc: '3D aerial flight mobility across atmospheric and zero-g zones via thrusters, wings, or metaphysics.',
                    formula: `Current: ${speedVal} ft (${Math.round(speedVal * 0.3)} m/turn)`
                  },
                  burrow: {
                    title: 'Burrow Speed',
                    badge: 'Subterranean Speed',
                    badgeColor: 'amber',
                    desc: 'Subterranean excavation and traversal speed through loose earth, sand, or soft stone.',
                    formula: `Current: ${speedVal} ft (${Math.round(speedVal * 0.3)} m/turn)`
                  },
                  teleport: {
                    title: 'Teleport Range',
                    badge: 'Spatial Blink',
                    badgeColor: 'purple',
                    desc: 'Instantaneous spatial relocation distance without provoking opportunity attacks.',
                    formula: `Current: ${speedVal} ft (${Math.round(speedVal * 0.3)} m/turn)`
                  }
                };

                const toolData = moveDescriptions[mode] || {
                  title: `${config.label} Speed`,
                  badge: 'Movement Mode',
                  badgeColor: 'cyan',
                  desc: `Movement speed for ${config.label} operations.`,
                  formula: `${speedVal} ft/turn`
                };

                return (
                  <FolioTooltip
                    key={mode}
                    title={toolData.title}
                    badge={toolData.badge}
                    badgeColor={toolData.badgeColor}
                    description={toolData.desc}
                    formula={toolData.formula}
                    tags={['Movement', config.label]}
                  >
                    <div className="flex flex-col bg-slate-800/40 p-2.5 rounded border border-slate-700/80 relative group w-full hover:border-cyan-500/50 transition-colors">
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
                  </FolioTooltip>
                );
              })}
            </div>
          </div>

          {/* Advancement Points (AP) Block */}
          <div className="bg-slate-900/60 border border-emerald-900/50 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-emerald-900/60 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎖️</span>
                <FolioTooltip
                  title="Advancement Points (AP)"
                  badge="Heroic Advancement"
                  badgeColor="emerald"
                  description="System of character progression. Advancement Points (AP) are converted 1:1 into Character Points (CP) to buy attribute points, skills, and features."
                  formula="1 AP = 1 CP"
                  tags={['Advancement', 'AP', 'CP']}
                  showInfoIcon={true}
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors">
                    Advancement Points
                  </h3>
                </FolioTooltip>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  (1 AP = 1 CP)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsExperienceCodexOpen(true)}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Advancement Points (AP) Codex & Progression Ledger"
                >
                  <span>✨</span> AP Codex
                </button>

                <button
                  type="button"
                  onClick={() => openRulesModal('experience')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-[10px] font-bold text-slate-300 hover:text-emerald-200 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open canonical Advancement Rules Codex"
                >
                  <span>📖</span> Rules
                </button>

                <button
                  type="button"
                  onClick={() => setIsFateOverrideOpen(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-[10px] font-bold text-slate-300 hover:text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open discreet override modal for Karma, Plot Points, and Advancement Points"
                >
                  <span>⚙️</span> Overrides
                </button>
              </div>
            </div>

            {/* Advancement Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              {(() => {
                const earnedAP = Number(characterData?.earned_ap || 0);
                const availableAP = economyBreakdown?.availableAP ?? earnedAP;
                const spentAP = Number(characterData?.spent_ap || 0);
                const debt = Number(characterData?.experience_debt || 0);

                return (
                  <>
                    <FolioTooltip
                      title="Earned Advancement Points"
                      badge="Lifetime Total"
                      badgeColor="emerald"
                      description="Total career Advancement Points awarded by the GM for session attendance, roleplay, and mission completions."
                      formula={`Total: +${earnedAP} AP`}
                    >
                      <div className="p-2 rounded border bg-slate-800/50 border-emerald-700/60 text-center flex flex-col justify-between w-full hover:border-emerald-400 transition-colors">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Earned AP</span>
                        <span className="text-base font-black text-emerald-300">+{earnedAP}</span>
                        <span className="text-[8.5px] text-slate-500">Lifetime Total</span>
                      </div>
                    </FolioTooltip>

                    <FolioTooltip
                      title="Available Advancement Points"
                      badge="Advancement Capital"
                      badgeColor="cyan"
                      description="Unspent Advancement Points ready to be invested into attributes (5 AP), skills (1 AP), or features (3 AP)."
                      formula={`Available: ${availableAP} AP`}
                    >
                      <div className="p-2 rounded border bg-slate-800/50 border-cyan-700/60 text-center flex flex-col justify-between w-full hover:border-cyan-400 transition-colors">
                        <span className="text-[10px] uppercase font-bold text-cyan-300">Available</span>
                        <span className="text-base font-black text-cyan-200">{availableAP}</span>
                        <span className="text-[8.5px] text-slate-500">Unspent AP</span>
                      </div>
                    </FolioTooltip>

                    <FolioTooltip
                      title="Spent Advancement Points"
                      badge="Invested Progression"
                      badgeColor="slate"
                      description="Total Advancement Points allocated towards character growth across attributes, skills, and traits."
                      formula={`Invested: ${spentAP} AP`}
                    >
                      <div className="p-2 rounded border bg-slate-800/50 border-slate-700 text-center flex flex-col justify-between w-full hover:border-slate-500 transition-colors">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Spent AP</span>
                        <span className="text-base font-bold text-slate-200">{spentAP}</span>
                        <span className="text-[8.5px] text-slate-500">Invested AP</span>
                      </div>
                    </FolioTooltip>

                    <FolioTooltip
                      title="Advancement Debt"
                      badge="Mortality Penalty"
                      badgeColor="rose"
                      description="Debt incurred when an operative undergoes emergency Revivification from death. Future earned AP will automatically repay debt first."
                      formula={debt > 0 ? `Debt: -${debt} AP` : 'Clear (No Debt)'}
                    >
                      <div className={`p-2 rounded border text-center flex flex-col justify-between w-full transition-colors ${
                        debt > 0 
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 hover:border-rose-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}>
                        <span className="text-[10px] uppercase font-bold text-slate-400">AP Debt</span>
                        <span className={`text-base font-black ${debt > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                          {debt > 0 ? `-${debt}` : '0'}
                        </span>
                        <span className="text-[8.5px] text-slate-500">
                          {debt > 0 ? 'High Cost of Dying' : 'Clear'}
                        </span>
                      </div>
                    </FolioTooltip>
                  </>
                );
              })()}
            </div>

            {/* Advancement Debt Action Banner if Debt > 0 */}
            {(characterData?.experience_debt || 0) > 0 && (
              <div className="p-2 rounded bg-rose-950/30 border border-rose-800/40 flex items-center justify-between gap-2 text-xs">
                <span className="text-rose-300 text-[11px]">
                  ⚠️ <strong>AP Debt Active (-{characterData.experience_debt}):</strong> Future earned AP automatically settles debt before converting to available AP.
                </span>
                {(economyBreakdown?.availableAP ?? characterData?.earned_ap ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => payExperienceDebt(1)}
                    className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-100 rounded text-[10px] font-bold border border-rose-600 transition-colors shrink-0 cursor-pointer"
                    title="Pay 1 AP towards AP Debt"
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

      {/* Consolidated Karma Codex Modal */}
      <KarmaCodexModal
        isOpen={isKarmaCodexOpen}
        onClose={() => setIsKarmaCodexOpen(false)}
        charismaScore={getAttrTotal('attr-charisma')}
        currentKarma={getNum('karma', derivedStats?.maxKarma ?? 3)}
        maxKarma={derivedStats?.maxKarma ?? 3}
        plotPoints={getNum('plot-points', 0)}
      />

      {/* Consolidated Advancement Points (AP) Codex Modal */}
      <ExperienceCodexModal
        isOpen={isExperienceCodexOpen}
        onClose={() => setIsExperienceCodexOpen(false)}
        earnedAP={Number(characterData?.earned_ap || 0)}
        availableAP={economyBreakdown?.availableAP ?? Number(characterData?.earned_ap || 0)}
        experienceDebt={Number(characterData?.experience_debt || 0)}
      />

    </div>
  );
};

export default React.memo(CoreStatsTab);
