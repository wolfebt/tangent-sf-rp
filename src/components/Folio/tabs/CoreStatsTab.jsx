import React, { useState } from 'react';
import FolioInput from '../shared/FolioInput';
import FolioTooltip from '../shared/FolioTooltip';
import { useFolio } from '../../../context/FolioContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { useDice } from '../../../context/DiceContext';
import { Dices, ChevronDown, ChevronRight, Plus, Trash2, Coins, Receipt } from 'lucide-react';

// Lazy Loaded Rules & Codex Modals
const DiscreetFateOverrideModal = React.lazy(() => import('../modals/DiscreetFateOverrideModal'));
const KarmaCodexModal = React.lazy(() => import('../modals/KarmaCodexModal'));
const ExperienceCodexModal = React.lazy(() => import('../modals/ExperienceCodexModal'));
const PerceptionEssenceMovementModal = React.lazy(() => import('../modals/PerceptionEssenceMovementModal'));
const PerceptionRulesModal = React.lazy(() => import('../modals/PerceptionRulesModal'));

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
    isLocked,
    isPlayerOverride,
    updateCharacterVitality
  } = useFolio();
  const confirm = useConfirm();

  const { openDiceRoller } = useDice();

  const isStatsLocked = isInActiveGame && !isGMConfirmed;
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);

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
    const attrConfig = ATTRIBUTES.find(a => a.id === subAttrId);
    if (attrConfig?.aliasId) {
      updateField(attrConfig.aliasId, val);
    }
  };

  const handleStatChange = (id, val) => {
    let newVal = parseInt(val, 10) || 0;
    const minVal = id === 'health' ? (derivedStats?.health || 30) : id === 'vitality' ? (derivedStats?.vitality || 30) : id === 'structure' ? 60 : 0;
    if (newVal < minVal) {
      newVal = minVal;
    }
    const maxVal = id === 'structure' ? (derivedStats?.maxAllowed ? derivedStats.maxAllowed * 2 : 240) : (derivedStats?.maxAllowed || 120);
    if (newVal > maxVal) {
      newVal = maxVal;
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

  // Wealth: Credits & Debits Accordions State & Handlers
  const [isCreditsAccordionOpen, setIsCreditsAccordionOpen] = useState(false);
  const [isDebitsAccordionOpen, setIsDebitsAccordionOpen] = useState(false);

  const getArrayFromData = (key, altKey) => {
    let val = characterData[key];
    if (!val && altKey) val = characterData[altKey];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleAddTradeGood = () => {
    const current = getArrayFromData('trade-goods', 'wealth-trade-goods');
    const newItem = {
      id: `good-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      goods: 'material',
      name: '',
      amount: 1,
      creditValue: 0
    };
    const updated = [...current, newItem];
    updateField('trade-goods', updated);
    updateField('wealth-trade-goods', updated);
  };

  const handleUpdateTradeGood = (index, field, value) => {
    const current = getArrayFromData('trade-goods', 'wealth-trade-goods');
    const updated = current.map((item, i) => i === index ? { ...item, [field]: value } : item);
    updateField('trade-goods', updated);
    updateField('wealth-trade-goods', updated);
  };

  const handleDeleteTradeGood = (index) => {
    const current = getArrayFromData('trade-goods', 'wealth-trade-goods');
    const updated = current.filter((_, i) => i !== index);
    updateField('trade-goods', updated);
    updateField('wealth-trade-goods', updated);
  };

  const handleAddDebit = () => {
    const current = getArrayFromData('debits', 'wealth-debits');
    const newDebit = {
      id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amount: 0,
      debtor: '',
      notes: ''
    };
    const updated = [...current, newDebit];
    updateField('debits', updated);
    updateField('wealth-debits', updated);
  };

  const handleUpdateDebit = (index, field, value) => {
    const current = getArrayFromData('debits', 'wealth-debits');
    const updated = current.map((item, i) => i === index ? { ...item, [field]: value } : item);
    updateField('debits', updated);
    updateField('wealth-debits', updated);
  };

  const handleDeleteDebit = (index) => {
    const current = getArrayFromData('debits', 'wealth-debits');
    const updated = current.filter((_, i) => i !== index);
    updateField('debits', updated);
    updateField('wealth-debits', updated);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Column 1: Core Attributes & Perception / Essence */}
        <div className="space-y-3">
          {/* Attributes & Checks Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1.5 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Attributes &amp; Checks
                </h3>
                <span className="text-[9.5px] text-slate-400 font-mono hidden sm:inline">
                  (Base = 2 + Attr × 2)
                </span>
              </div>
              <button
                type="button"
                onClick={() => openRulesModal('attributes')}
                className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[9.5px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer ml-auto"
                title="Open Attribute Checks & Saves Guide"
              >
                <span>🛡️</span> Checks &amp; Saves Guide
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[9.5px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="py-1 px-2 font-bold">Attribute / Check</th>
                    <th className="py-1 px-1.5 text-center font-bold">Base</th>
                    <th className="py-1 px-1.5 text-center font-bold">Mod</th>
                    <th className="py-1 px-1.5 text-center font-bold text-cyan-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {ATTRIBUTES.map((attr) => {
                    const isSub = attr.sub;
                    const calculatedSubBase = isSub ? getSubAttrBase(attr.id) : 0;
                    const explicitVal = isSub
                      ? (characterData[attr.id] !== undefined && characterData[attr.id] !== null && characterData[attr.id] !== ''
                          ? parseInt(characterData[attr.id], 10)
                          : (attr.aliasId && characterData[attr.aliasId] !== undefined && characterData[attr.aliasId] !== null && characterData[attr.aliasId] !== ''
                              ? parseInt(characterData[attr.aliasId], 10)
                              : null))
                      : null;
                    const rawBase = isSub 
                      ? ((explicitVal !== null && !isNaN(explicitVal) && explicitVal > calculatedSubBase) ? explicitVal : calculatedSubBase)
                      : getNum(attr.id);
                    const mod = getAttrMod(attr.id);
                    const total = getAttrTotal(attr.id);

                    // Calculate detailed breakdown sources for the tooltip
                    const attrSources = [];
                    if (!isSub) {
                      const userMod = parseInt(characterData[`${attr.id}-mod`] || 0, 10);
                      if (userMod !== 0) {
                        attrSources.push({ name: 'Direct Modifier Input', val: userMod });
                      }
                      const speciesAlloc = characterData.speciesAllocations?.attributes?.[attr.id] || 0;
                      if (speciesAlloc !== 0) {
                        attrSources.push({ name: 'Species Lineage Bonus', val: speciesAlloc });
                      }
                      const identityMod = computedModifiers?.attributeMods?.[attr.id] || 0;
                      const remainingIdentityMod = identityMod - speciesAlloc;
                      if (remainingIdentityMod !== 0) {
                        attrSources.push({ name: 'Features, Traits & Cybernetics', val: remainingIdentityMod });
                      }
                    } else {
                      let saveMod = 0;
                      if (attr.id === 'attr-fortitude') saveMod = computedModifiers?.saveMods?.Fortitude || 0;
                      else if (attr.id === 'attr-reflex') saveMod = computedModifiers?.saveMods?.Reflex || 0;
                      else if (attr.id === 'attr-will' || attr.id === 'attr-willpower') saveMod = computedModifiers?.saveMods?.Will || 0;
                      if (saveMod !== 0) {
                        attrSources.push({ name: 'Save Specialization Bonus', val: saveMod });
                      }
                      const userMod = parseInt(characterData[`${attr.id}-mod`] || 0, 10);
                      if (userMod !== 0) {
                        attrSources.push({ name: 'Direct Modifier Input', val: userMod });
                      }
                    }

                    const attrBreakdown = {
                      isSub,
                      base: rawBase,
                      purchased: !isSub ? rawBase : 0,
                      purchasedBonus: isSub ? Math.max(0, rawBase - calculatedSubBase) : 0,
                      governingBase: isSub ? calculatedSubBase : null,
                      mod,
                      total,
                      sources: attrSources
                    };

                    return (
                      <tr 
                        key={attr.id} 
                        className={`transition-colors ${isSub ? 'bg-slate-950/30 text-slate-300' : 'bg-slate-900/40 font-semibold text-slate-100 hover:bg-slate-850'}`}
                      >
                        <td className="py-0.5 px-2">
                          <FolioTooltip
                            title={attr.code ? `${attr.name} (${attr.code})` : attr.name}
                            badge={attr.badge}
                            badgeColor={attr.badgeColor}
                            description={attr.desc}
                            formula={attr.formula}
                            cost={attr.cost}
                            tags={attr.tags}
                            showInfoIcon={true}
                            attrBreakdown={attrBreakdown}
                          >
                            <div className="flex items-center gap-1.5 font-sans">
                              {isSub && <span className="text-slate-600 text-xs pl-1.5">↳</span>}
                              <span className={isSub ? 'text-slate-300 text-xs hover:text-cyan-300 transition-colors' : 'text-cyan-400 font-bold text-xs hover:text-cyan-200 transition-colors'}>
                                {attr.name}
                              </span>
                              {!isSub && (
                                <span className="text-[8.5px] font-mono text-slate-500 font-normal">
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
                          {isSheetLocked ? (
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {isNaN(rawBase) ? 0 : rawBase}
                            </span>
                          ) : (
                            <input
                              type="number"
                              value={isNaN(rawBase) ? 0 : rawBase}
                              onChange={(e) => isSub ? handleSubAttrChange(attr.id, e.target.value) : handlePrimaryChange(attr.id, e.target.value)}
                              disabled={isStatsLocked}
                              title={isStatsLocked ? 'Attribute locked during active game session. Request GM update.' : ''}
                              className={`w-10 text-center bg-slate-900 border rounded px-1 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 ${
                                isStatsLocked
                                  ? 'opacity-60 cursor-not-allowed border-slate-800 text-slate-400'
                                  : isSub ? 'border-slate-800 text-slate-300' : 'border-slate-700 font-bold'
                              }`}
                            />
                          )}
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
                                onClick={(e) => openDiceRoller({
                                  label: `${attr.name} ${total >= 0 ? `+${total}` : total}`,
                                  baseModifier: total,
                                  expression: `2d10${total !== 0 ? (total > 0 ? `+${total}` : `${total}`) : ''}`,
                                  rollMode: 'normal',
                                  characterName: characterData['char-name'] || 'Operative',
                                  personaId: characterData['character-doc-id'] || characterData.id,
                                  autoRoll: e?.shiftKey || false
                                })}
                                className="px-1.5 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-[9.5px] font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-0.5 shrink-0"
                                title={`Check ${attr.name} (2d10 + ${total}). Shift-click to quick-roll.`}
                              >
                                <Dices size={11} className="text-amber-400" />
                                <span>Check</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => openDiceRoller({
                                  label: `${attr.name} ${total >= 0 ? `+${total}` : total}`,
                                  baseModifier: total,
                                  expression: `2d10${total !== 0 ? (total > 0 ? `+${total}` : `${total}`) : ''}`,
                                  rollMode: 'normal',
                                  characterName: characterData['char-name'] || 'Operative',
                                  personaId: characterData['character-doc-id'] || characterData.id,
                                  autoRoll: e?.shiftKey || false
                                })}
                                className="p-0.5 rounded bg-slate-900/60 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
                                title={`Check ${attr.name} (2d10 + ${total}). Shift-click to quick-roll.`}
                              >
                                <Dices size={10} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Perception Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1.5 gap-2">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
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
                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[9.5px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Perception Rules & Detection Codex"
                >
                  <span>👁️</span> Perception Rules
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <FolioTooltip
                title="Base Perception"
                badge="Innate Acuity"
                badgeColor="slate"
                description="The core sensory acuity and mental focus score derived from Intellect and Wisdom."
                formula="Base = Intellect + Wisdom"
                tags={['INT', 'WIS']}
              >
                <div className="flex flex-col justify-between bg-slate-800/50 p-1.5 rounded border border-slate-700 text-center w-full hover:border-cyan-500/50 transition-colors">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block leading-tight">Base</span>
                    <span className="text-sm font-bold font-mono text-cyan-300 block leading-tight">{basePerception}</span>
                    <span className="text-[8px] text-slate-500 font-mono block leading-tight">INT+WIS</span>
                  </div>
                  <span className="text-[8px] text-slate-600 font-mono py-0.5 mt-0.5 block opacity-0 select-none pointer-events-none">—</span>
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
                <div className="flex flex-col justify-between bg-slate-800/50 p-1.5 rounded border border-cyan-700/60 text-center w-full hover:border-cyan-400 transition-colors">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-cyan-300 block leading-tight">Default</span>
                    <span className="text-sm font-bold font-mono text-cyan-200 block leading-tight">{alertPerception}</span>
                    <span className="text-[8px] text-cyan-400/80 font-mono block leading-tight">+{alertnessRank + alertnessMod} Alert</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: `Perception ${alertPerception >= 0 ? `+${alertPerception}` : alertPerception}`,
                        baseModifier: alertPerception,
                        expression: `2d10${alertPerception !== 0 ? (alertPerception > 0 ? `+${alertPerception}` : `${alertPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: e?.shiftKey || false
                      });
                    }}
                    className="mt-0.5 py-0.5 px-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[8.5px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Check Default Perception (2d10 + ${alertPerception}). Shift-click to quick-roll.`}
                  >
                    <Dices size={9} /> Check
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
                <div className="flex flex-col justify-between bg-slate-800/50 p-1.5 rounded border border-amber-700/60 text-center w-full hover:border-amber-400 transition-colors">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-amber-400 block leading-tight">Meta</span>
                    <span className="text-sm font-bold font-mono text-amber-300 block leading-tight">{metaPerception}</span>
                    <span className="text-[8px] text-amber-400/80 font-mono block leading-tight">+{attuneRank + attuneMod} Attune</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: `Meta Perception ${metaPerception >= 0 ? `+${metaPerception}` : metaPerception}`,
                        baseModifier: metaPerception,
                        expression: `2d10${metaPerception !== 0 ? (metaPerception > 0 ? `+${metaPerception}` : `${metaPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: e?.shiftKey || false
                      });
                    }}
                    className="mt-0.5 py-0.5 px-1 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded text-[8.5px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Check Metaphysical Perception (2d10 + ${metaPerception}). Shift-click to quick-roll.`}
                  >
                    <Dices size={9} /> Check
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
                <div className="flex flex-col justify-between bg-slate-800/50 p-1.5 rounded border border-emerald-700/60 text-center w-full hover:border-emerald-400 transition-colors">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-emerald-400 block leading-tight">Social</span>
                    <span className="text-sm font-bold font-mono text-emerald-300 block leading-tight">{socialPerception}</span>
                    <span className="text-[8px] text-emerald-400/80 font-mono block leading-tight">+{insightRank + insightMod} Insight</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: `Social Perception ${socialPerception >= 0 ? `+${socialPerception}` : socialPerception}`,
                        baseModifier: socialPerception,
                        expression: `2d10${socialPerception !== 0 ? (socialPerception > 0 ? `+${socialPerception}` : `${socialPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: e?.shiftKey || false
                      });
                    }}
                    className="mt-0.5 py-0.5 px-1 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded text-[8.5px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Check Social Perception (2d10 + ${socialPerception}). Shift-click to quick-roll.`}
                  >
                    <Dices size={9} /> Check
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
                <div className="flex flex-col justify-between bg-slate-800/50 p-1.5 rounded border border-blue-700/60 text-center col-span-2 sm:col-span-1 w-full hover:border-blue-400 transition-colors">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-blue-400 block leading-tight">Tech</span>
                    <span className="text-sm font-bold font-mono text-blue-300 block leading-tight">{techPerception}</span>
                    <span className="text-[8px] text-blue-400/80 font-mono block leading-tight">+{techRank + techMod} Tech</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDiceRoller({
                        label: `Tech Perception ${techPerception >= 0 ? `+${techPerception}` : techPerception}`,
                        baseModifier: techPerception,
                        expression: `2d10${techPerception !== 0 ? (techPerception > 0 ? `+${techPerception}` : `${techPerception}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative',
                        autoRoll: e?.shiftKey || false
                      });
                    }}
                    className="mt-0.5 py-0.5 px-1 bg-blue-950/90 hover:bg-blue-900 border border-blue-500/50 text-blue-300 rounded text-[8.5px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title={`Check Technical Perception (2d10 + ${techPerception}). Shift-click to quick-roll.`}
                  >
                    <Dices size={9} /> Check
                  </button>
                </div>
              </FolioTooltip>
            </div>
          </div>

          {/* Fate Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">✨</span>
                <FolioTooltip
                  title="Fate Reserve (Karma & Plot Points)"
                  badge="Heroic Destiny"
                  badgeColor="cyan"
                  description="A hero's supernatural destiny pool used to seize tactical advantage, reroll failed checks, or alter narrative circumstances."
                  tags={['Karma', 'Plot Points', 'Advantage']}
                  showInfoIcon={true}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">
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
                  className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-[9.5px] font-bold text-purple-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Karma Codex & Ledger"
                >
                  <span>☸️</span> Karma Codex
                </button>

                <button
                  type="button"
                  onClick={() => openRulesModal('karma')}
                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[9.5px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open canonical Karma & Fate Rules Codex"
                >
                  <span>📖</span> Rules
                </button>

                <button
                  type="button"
                  onClick={() => setIsFateOverrideOpen(true)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/60 text-[9.5px] font-bold text-slate-300 hover:text-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open discreet override modal for Karma, Plot Points, and Advancement Points"
                >
                  <span>⚙️</span> Overrides
                </button>
              </div>
            </div>

            {/* Fate Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center font-mono">
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
                    description="Spend 1 Karma to roll with Advantage, Reroll any 2d10 check, or survive fatal damage at 0 Health. Negative values indicate Karmic Debt."
                    formula={`Current: ${currentKarma} / Max: ${maxKarma}`}
                    tags={['Reroll', 'Advantage', 'Survival']}
                  >
                    <div className={`p-1.5 py-1 rounded border flex flex-col justify-between w-full ${
                      isDebt 
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-300' 
                        : 'bg-slate-800/50 border-cyan-700/60 text-cyan-300 hover:border-cyan-400 transition-colors'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400">Karma Pool</span>
                        <span className="text-[8.5px] text-slate-500 font-mono">Max: {maxKarma}{isDebt ? ' (Debt)' : ''}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 my-0.5">
                        <div className="flex items-center gap-1.5">
                          {!isSheetLocked && (
                            <button
                              type="button"
                              onClick={() => spendKarma(1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                              title="Spend 1 Karma"
                            >
                              -
                            </button>
                          )}
                          <span className={`text-base font-black ${isDebt ? 'text-rose-400' : 'text-cyan-200'}`}>
                            {currentKarma}
                          </span>
                          {!isSheetLocked && (
                            <button
                              type="button"
                              onClick={() => gainKarma(1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                              title="Gain 1 Karma"
                            >
                              +
                            </button>
                          )}
                        </div>
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
                          className="py-0.5 px-2 bg-cyan-950/90 hover:bg-cyan-900 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-500/50 text-cyan-200 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                          title="Spend 1 Karma to invoke Second Wind: Instantly restore 50% max Vitality"
                        >
                          <span>💨</span> Second Wind (+50% Vit)
                        </button>
                      </div>
                      <span className="text-[8.5px] text-slate-400 font-sans text-left truncate">d20 Advantage / Reroll Reserve</span>
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
                    <div className="p-1.5 py-1 rounded border bg-slate-800/50 border-fuchsia-700/60 text-fuchsia-300 flex flex-col justify-between w-full hover:border-fuchsia-400 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] uppercase font-bold text-fuchsia-400">Plot Points</span>
                        <span className="text-[8.5px] text-fuchsia-400/70 font-mono">Tokens: {plotPoints}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 my-0.5">
                        <div className="flex items-center gap-1.5">
                          {!isSheetLocked && (
                            <button
                              type="button"
                              onClick={() => spendPlotPoint(1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                              title="Spend 1 Plot Point"
                            >
                              -
                            </button>
                          )}
                          <span className="text-base font-black text-fuchsia-200">{plotPoints}</span>
                          {!isSheetLocked && (
                            <button
                              type="button"
                              onClick={() => gainPlotPoint(1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-slate-900/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                              title="Gain 1 Plot Point"
                            >
                              +
                            </button>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-fuchsia-300/80 px-1.5 py-0.5 bg-fuchsia-950/40 rounded border border-fuchsia-800/40">Narrative Token</span>
                      </div>
                      <span className="text-[8.5px] text-slate-400 font-sans text-left truncate">Story Complications &amp; Creative Twists</span>
                    </div>
                  </FolioTooltip>
                );
              })()}
            </div>
          </div>

          {/* Essence Block (Positioned Under Fate) */}
          <div className="bg-slate-900/60 border border-purple-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-purple-900/60 pb-1.5 gap-2">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
                    Essence
                  </h3>
                </FolioTooltip>
                <span className="text-[10px] font-mono text-slate-400">
                  (Attrs: {primaryAttrsTotal} + Meta: {metaSkillsTotal} = {essenceTotal})
                </span>
                <div className="flex items-center gap-1.5 bg-slate-800 px-1.5 py-0.5 rounded border border-purple-500/40">
                  <span className="text-[9px] font-bold text-purple-300 uppercase">Capacity:</span>
                  <span className="text-xs font-mono font-bold text-purple-200">{essenceTotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => openRulesModal('essence')}
                  className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-[9.5px] font-bold text-purple-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Essence Pool & Metaphysical Strain Rules Codex"
                >
                  <span>🔮</span> Essence Rules
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <FolioTooltip
                title="Total Essence Capacity"
                badge="Total Pool"
                badgeColor="purple"
                description="Total metaphysical energy reserve of the character."
                formula="Essence = Primary Attributes + Meta Skills Total"
              >
                <div className="flex flex-col bg-slate-800/50 p-1.5 py-1 rounded border border-purple-700/60 text-center w-full hover:border-purple-400 transition-colors">
                  <span className="text-[9.5px] uppercase font-bold text-purple-300 leading-tight">Total Essence</span>
                  <span className="text-sm font-bold font-mono text-purple-200 leading-tight my-0.5">{essenceTotal}</span>
                  <span className="text-[8px] text-purple-400/80 font-mono leading-tight">Pool Capacity</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="Ability Substrate"
                badge="Containment Vessel"
                badgeColor="cyan"
                description="The physiological and cognitive vessel housing metaphysical Code. Formed by the sum of all 6 core attributes."
                formula="Substrate = STR + AGI + STA + INT + WIS + CHA"
              >
                <div className="flex flex-col bg-slate-800/50 p-1.5 py-1 rounded border border-slate-700 text-center w-full hover:border-cyan-500/50 transition-colors">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-tight">Substrate</span>
                  <span className="text-sm font-bold font-mono text-cyan-300 leading-tight my-0.5">+{primaryAttrsTotal}</span>
                  <span className="text-[8px] text-slate-500 font-mono leading-tight">6 Primary Attrs</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="The Conduit (Attune)"
                badge="Resonance Bandwidth"
                badgeColor="amber"
                description="Your operational resonance with the Void. Determines bandwidth for channeling metaphysical code safely."
                formula="Conduit = Attune Rank + Attune Mod"
              >
                <div className="flex flex-col bg-slate-800/50 p-1.5 py-1 rounded border border-amber-700/60 text-center w-full hover:border-amber-400 transition-colors">
                  <span className="text-[9.5px] uppercase font-bold text-amber-400 leading-tight">Conduit</span>
                  <span className="text-sm font-bold font-mono text-amber-300 leading-tight my-0.5">+{attuneRank + attuneMod}</span>
                  <span className="text-[8px] text-amber-400/80 font-mono leading-tight">Attune Skill</span>
                </div>
              </FolioTooltip>

              <FolioTooltip
                title="The Breadth (Disciplines)"
                badge="Disciplines Total"
                badgeColor="purple"
                description="Total ranks and modifiers across Dimension, Energy, Entropy, Illusion, Matter, and Mental skills."
                formula="Breadth = Sum of all Discipline Skills"
              >
                <div className="flex flex-col bg-slate-800/50 p-1.5 py-1 rounded border border-slate-700 text-center w-full hover:border-purple-400 transition-colors">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-tight">Disciplines</span>
                  <span className="text-sm font-bold font-mono text-cyan-300 leading-tight my-0.5">+{Math.max(0, metaSkillsTotal - (attuneRank + attuneMod))}</span>
                  <span className="text-[8px] text-slate-500 font-mono leading-tight">Meta Skills</span>
                </div>
              </FolioTooltip>
            </div>
          </div>
        </div>

        {/* Column 2: Combat & Vitals Status, Movement, Setting Tiers, Wealth, Experience */}
        <div className="space-y-3">

          {/* Initiative & Status Block */}

          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1.5 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Combat &amp; Vitals Status
                </h3>
                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold hidden sm:inline" title="Toughness reduces incoming wound damage point-for-point">
                  🛡️ Toughness: {derivedStats?.toughness ?? 0}
                </span>
                {derivedStats?.isSynthetic && (
                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold hidden sm:inline" title="Non-standard physiology: Vitality and Health combined into Structure">
                    ⚙️ Structure: {derivedStats?.structure ?? 60} SP
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openRulesModal('vitals')}
                className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[9.5px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer ml-auto"
                title="Open Vitality, Health, Structure & Dying Rules Codex"
              >
                <span>⚡</span> Vitals &amp; Dying Rules
              </button>
            </div>

            {/* Row 1: Combat Readiness & Vitals (2 Columns: Initiative/Toughness and Vitality/Health) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Left Column: Initiative over Toughness */}
              <div className="space-y-1.5">
                <FolioTooltip
                  title="Initiative"
                  badge="Turn Priority"
                  badgeColor="amber"
                  description="Determines combat reaction speed and positioning in tactical combat rounds. Uses Reflex Check + modifiers."
                  formula={`Initiative = Reflex (${reflexTotal}) + Mod (${initiativeMod}) = ${initiativeTotal}`}
                  tags={['Reflex', 'Combat Round', 'Turn Order']}
                  className="w-full block"
                >
                  <div className="flex items-center justify-between bg-slate-800/60 px-2.5 py-1 rounded border border-cyan-900/40 w-full hover:border-cyan-400 transition-colors gap-2 min-h-[34px]">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 shrink-0">
                      Initiative
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-bold text-amber-400 font-mono px-1">{initiativeTotal}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDiceRoller({
                            label: `Initiative ${initiativeTotal >= 0 ? `+${initiativeTotal}` : initiativeTotal}`,
                            baseModifier: initiativeTotal,
                            expression: `2d10${initiativeTotal !== 0 ? (initiativeTotal > 0 ? `+${initiativeTotal}` : `${initiativeTotal}`) : ''}`,
                            rollMode: 'normal',
                            characterName: characterData['char-name'] || 'Operative',
                            autoRoll: e?.shiftKey || false
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-[9.5px] font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 shrink-0"
                        title={`Check Initiative (2d10 + ${initiativeTotal}). Shift-click to quick-roll.`}
                      >
                        <Dices size={10} className="text-amber-400" />
                        <span>Check</span>
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
                  className="w-full block"
                >
                  <div className="flex items-center justify-between bg-slate-800/60 px-2.5 py-1 rounded border border-emerald-900/40 w-full hover:border-emerald-400 transition-colors gap-2 min-h-[34px]" title="All character Stamina is a natural damage reduction (DR) and automatically reduces all incoming damage which penetrates defenses, minimum of 1 point.">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                      Natural DR (STA)
                    </label>
                    <span className="text-base font-bold text-emerald-300 font-mono shrink-0 px-1">+{derivedStats?.stamina ?? derivedStats?.toughness ?? 0}</span>
                  </div>
                </FolioTooltip>
              </div>

              {/* Right Column: Vitality over Health */}
              <div className="space-y-1.5">
                <FolioTooltip
                  title="Vitality (Non-Lethal)"
                  badge="Non-Lethal Capacity"
                  badgeColor="cyan"
                  description="Combat poise, dodging stamina, and non-lethal stress buffer. Absorbs non-lethal damage directly. When non-lethal damage exceeds Vitality, excess spills into Health as lethal damage. Starting pool is 30 points; additional points cost 1 CP per 2 pt increase."
                  formula={`Base: 30 + Purchased: ${derivedStats?.purchasedVitality || 0} (Max Increase: ${derivedStats?.maxStatIncrease ?? ((derivedStats?.stamina || 0) * 5)})`}
                  cost="1 CP = +2 Vitality (Base: 30, Max: 5 × STA)"
                  tags={['Non-Lethal', 'Vitality Buffer', 'Base 30', '1 CP / 2 pts']}
                  className="w-full block"
                >
                  <div className="flex flex-col relative group w-full">
                    <FolioInput
                      id="vitality"
                      label="Vitality (Non-Lethal)"
                      type="number"
                      value={getNum('vitality', derivedStats?.vitality || 30)}
                      onChange={handleStatChange}
                      labelColor="text-slate-300"
                      labelSize="text-[10.5px]"
                      inputClassName={`px-2 py-0.5 text-xs font-mono border ${derivedStats?.purchasedVitality > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                    />
                    {derivedStats?.purchasedVitality > 0 && (
                      <div className="absolute top-0 right-0 text-[8px] font-bold text-indigo-300 bg-indigo-900/80 px-1 py-0.2 rounded-bl">
                        +{derivedStats.purchasedVitality}
                      </div>
                    )}
                  </div>
                </FolioTooltip>

                <FolioTooltip
                  title="Health (Lethal)"
                  badge="Physical Integrity"
                  badgeColor="rose"
                  description="Core bodily tissue and organ integrity. Depleted directly by lethal strikes or when non-lethal damage overflows depleted Vitality. Falling to 0 results in Incapacitation or Dying. Starting pool is 30 points; additional points cost 1 CP per 2 pt increase."
                  formula={`Base: 30 + Purchased: ${derivedStats?.purchasedHealth || 0} (Max Increase: ${derivedStats?.maxStatIncrease ?? ((derivedStats?.stamina || 0) * 5)})`}
                  cost="1 CP = +2 Health (Base: 30, Max: 5 × STA)"
                  tags={['Lethal', 'Physical Integrity', 'Base 30', '1 CP / 2 pts']}
                  className="w-full block"
                >
                  <div className="flex flex-col relative group w-full">
                    <FolioInput
                      id="health"
                      label="Health (Lethal)"
                      type="number"
                      value={getNum('health', derivedStats?.health || 30)}
                      onChange={handleStatChange}
                      labelColor="text-slate-300"
                      labelSize="text-[10.5px]"
                      inputClassName={`px-2 py-0.5 text-xs font-mono border ${derivedStats?.purchasedHealth > 0 ? 'bg-indigo-950 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}
                    />
                    {derivedStats?.purchasedHealth > 0 && (
                      <div className="absolute top-0 right-0 text-[8px] font-bold text-indigo-300 bg-indigo-900/80 px-1 py-0.2 rounded-bl">
                        +{derivedStats.purchasedHealth}
                      </div>
                    )}
                  </div>
                </FolioTooltip>
              </div>
            </div>

            {/* Synthetic Structure Pool if applicable */}
            {derivedStats?.isSynthetic && (
              <FolioTooltip
                title="Structure Points (Synthetic Physiology)"
                badge="Chassis Integrity"
                badgeColor="amber"
                description="Synthetic and construct physiology uses Structure Points instead of separate Vitality and Health. Starting pool is 60 SP. Additional points cost 1 CP per 2 pt increase. Synthetics are immune to non-lethal damage, fatigue, and biological hazards."
                formula={`Base: 60 + Purchased: ${derivedStats?.purchasedStructure || 0}`}
                cost="1 CP = +2 Structure (Starting Pool: 60 SP)"
                tags={['Synthetic', 'Structure 60 SP', '1 CP / 2 pts']}
                className="w-full block"
              >
                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">⚙️</span>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <span>Synthetic Structure</span>
                        <span className="text-[9px] font-normal text-amber-400 font-mono">(60 SP Base)</span>
                      </div>
                      <div className="text-[9px] text-amber-200/70 font-sans leading-none">
                        Replaces separate Vitality &amp; Health. 1 CP = +2 Structure.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSheetLocked ? (
                      <span className="text-xs font-bold text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-600/40">
                        {derivedStats.structure} SP
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <label htmlFor="structure" className="text-[9.5px] text-slate-400 uppercase font-sans">Structure SP:</label>
                        <input
                          id="structure"
                          type="number"
                          min="60"
                          value={getNum('structure', derivedStats?.structure || 60)}
                          onChange={(e) => handleStatChange('structure', e.target.value)}
                          className="w-14 bg-slate-950 border border-amber-600/50 focus:border-amber-400 rounded px-1.5 py-0.5 text-xs font-mono text-center font-bold text-amber-200 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </FolioTooltip>
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
                  <div className="p-2 rounded bg-slate-950/95 border border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">⚰️</span>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                          Status: Permanently Deceased
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Character has succumbed to death. May be revived via high-level Metaphysics or TL5 Tech.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Perform Revivification',
                          message: "Perform Revivification? 'The High Cost of Dying' applies: Character loses ALL remaining Karma Points and suffers a -5 Experience Debt.",
                          danger: true,
                          confirmLabel: 'Revivify (-5 XP Debt)'
                        });
                        if (ok) {
                          revivifyCharacter();
                        }
                      }}
                      className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-red-100 border border-red-500 rounded text-[10px] font-bold tracking-wide uppercase transition-colors shadow flex items-center gap-1 cursor-pointer"
                      title="Revivify character (High Cost of Dying: -All Karma, -5 Experience Debt)"
                    >
                      <span>⚡</span> Revivify (-5 XP Debt)
                    </button>
                  </div>
                );
              }

              if (atDeathsDoor) {
                return (
                  <div className="p-2 rounded bg-rose-950/90 border border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)] flex flex-wrap items-center justify-between gap-2 animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">💀</span>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-rose-200 flex items-center gap-2">
                          <span>DEATH'S DOOR</span>
                          <span className="text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-900 border border-rose-500 text-rose-100">
                            {isStabilized ? 'STABILIZED' : `Clock: ${deathClock} Round${deathClock === 1 ? '' : 's'}`}
                          </span>
                        </div>
                        <div className="text-[9px] text-rose-300/80">
                          {isStabilized
                            ? 'Character is unconscious and severely wounded, but no longer actively dying.'
                            : 'Character is Comatose. Medical aid (Medicine CR 15) must be applied before clock expires!'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isStabilized && (
                        <>
                          <button
                            type="button"
                            onClick={() => stabilizeCharacter({ hasHealingEffect: true })}
                            className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-400 shadow-sm transition-colors cursor-pointer"
                            title="Apply Medicine (CR 15) or healing to stop the death clock"
                          >
                            🩹 Stabilize
                          </button>
                          <button
                            type="button"
                            onClick={() => advanceCharacterDeathTurn()}
                            className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-rose-700 transition-colors cursor-pointer"
                            title="Advance combat round without medical aid (-1 round from death clock)"
                          >
                            ⏳ -1 Rnd
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              }

              if (isIncapacitated) {
                return (
                  <div className="p-2 rounded bg-amber-950/80 border border-amber-600/70 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🛌</span>
                      <div>
                        <strong className="uppercase tracking-wide font-bold text-[11px]">Incapacitated (0 Health):</strong>
                        <span className="text-slate-300 text-[10px] ml-1.5">Unconscious and Prone. Drops held items. ({curV} Vit left).</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {/* Rest & Recovery Bar */}
            <div className="bg-slate-950/60 border border-cyan-900/50 rounded px-2 py-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">☕</span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Rest &amp; Recovery
                </span>
              </div>

              <button
                type="button"
                onClick={() => openRulesModal('rest')}
                className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[9.5px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                title="Open Rest & Recovery Manager (Full Rest & Light Rest Tiers)"
              >
                <span>☕</span> Take Rest / Rules
              </button>
            </div>

          </div>

          {/* Movement Block (Displays only enabled modes with quick add option) */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1.5 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
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
                  className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-[9.5px] font-bold text-amber-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Movement Paces & Fatigue Rules Codex"
                >
                  <span>🏃</span> Movement Rules
                </button>

                {unenabledModes.length > 0 && !isSheetLocked && (
                  <div className="flex items-center gap-1">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddMovementMode(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded px-1.5 py-0.5 text-[9.5px] text-cyan-300 font-bold uppercase outline-none cursor-pointer"
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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
                    <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded border border-slate-700/80 relative group w-full hover:border-cyan-500/50 transition-colors gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <label htmlFor={`move-${mode}`} className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 truncate cursor-pointer leading-tight">
                          {config.label}
                        </label>
                        <span className="text-[8.5px] font-mono text-slate-500 shrink-0 leading-none">
                          {Math.round(speedVal * 0.3)}m
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSheetLocked ? (
                          <span className="text-xs font-mono font-bold text-cyan-200 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-center min-w-[3rem]">
                            {speedVal} ft
                          </span>
                        ) : (
                          <div className="relative flex items-center">
                            <input
                              id={`move-${mode}`}
                              type="number"
                              min="0"
                              value={speedVal}
                              onChange={(e) => updateField(`move-${mode}`, Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-16 h-6 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-1.5 pr-4 text-xs font-mono text-center font-bold text-slate-100 outline-none transition-colors"
                            />
                            <span className="absolute right-1 text-[8.5px] font-mono text-slate-500 pointer-events-none">ft</span>
                          </div>
                        )}

                        {mode !== 'walk' && !isSheetLocked && (
                          <button
                            type="button"
                            onClick={() => updateField(`move-${mode}`, 0)}
                            className="text-slate-500 hover:text-red-400 text-[10px] transition-colors cursor-pointer leading-none p-0.5"
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

          {/* Tech & Meta Level Block */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-2 space-y-1.5">
            <div className="flex flex-wrap justify-between items-center border-b border-cyan-900/60 pb-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs">⚙️</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Tech Level &amp; Meta Level
                </h3>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  (Setting Parameters: 10 CP / diff from 3)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                {(() => {
                  const curTL = Math.min(5, Math.max(0, getNum('tech-level', 3)));
                  const tlCP = (curTL - 3) * 10;
                  const curML = Math.min(5, Math.max(0, getNum('magic-level', getNum('meta-level', 3))));
                  const mlCP = (curML - 3) * 10;
                  const totalLevelCP = tlCP + mlCP;
                  return (
                    <span className={`px-1.5 py-0.5 rounded font-bold border text-[9px] ${totalLevelCP > 0 ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : totalLevelCP < 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                      Level CP: {totalLevelCP > 0 ? `+${totalLevelCP} Cost` : totalLevelCP < 0 ? `+${Math.abs(totalLevelCP)} Awarded` : '0 CP (Baseline)'}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Tech Level (0-5) */}
              {(() => {
                const curTL = Math.min(5, Math.max(0, getNum('tech-level', 3)));
                const baseTL = Math.min(5, Math.max(0, getNum('base-tech-level', 3)));
                const tlCP = (curTL - 3) * 10;
                const purchasedTL = Math.max(0, curTL - baseTL);
                return (
                  <FolioTooltip
                    title="Technology Level (TL 0–5)"
                    badge="Setting Tier"
                    badgeColor="cyan"
                    description="Standard galactic spacefaring baseline is TL3 (0 CP). Higher tech costs 10 CP per level (+10 CP at TL4, +20 CP at TL5). Lower tech grants +10 CP per level difference (+10 CP at TL2, +20 CP at TL1, +30 CP at TL0). Lowered scores may be increased during creation or advancement at 10 CP per level. Species and faction levels do not stack (highest is taken)."
                    formula={`TL ${curTL}: ${(curTL - 3)} level difference × 10 CP = ${tlCP >= 0 ? `+${tlCP}` : tlCP} CP (Base TL: ${baseTL}${purchasedTL > 0 ? `, +${purchasedTL} Upgraded` : ''})`}
                    cost={tlCP === 0 ? '0 CP (Baseline)' : (tlCP > 0 ? `+${tlCP} CP Cost` : `+${Math.abs(tlCP)} CP Awarded`)}
                    tags={['TL 0-5', '10 CP / Level diff', 'Pillars Base']}
                  >
                    <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded border border-slate-700/80 gap-2 hover:border-cyan-500/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <label htmlFor="tech-level" className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 cursor-pointer shrink-0 leading-tight">
                            Tech Level
                          </label>
                          <span className="text-[8.5px] text-slate-400 font-mono hidden sm:inline">(0–5)</span>
                        </div>
                        <span className={`text-[8.5px] font-mono leading-none ${tlCP > 0 ? 'text-amber-400' : tlCP < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {tlCP === 0 ? '0 CP (TL3 Base)' : (tlCP > 0 ? `+${tlCP} CP` : `+${Math.abs(tlCP)} CP Award`)}
                          {purchasedTL > 0 ? ` • +${purchasedTL} Upgraded` : (baseTL < 3 ? ` (Base TL${baseTL})` : '')}
                        </span>
                      </div>
                      {isSheetLocked ? (
                        <span className="text-xs font-mono font-bold text-cyan-200 px-1 py-0.5">
                          {curTL}
                        </span>
                      ) : (
                        <input
                          id="tech-level"
                          type="number"
                          min="0"
                          max="5"
                          value={curTL}
                          onChange={(e) => updateField('tech-level', Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                          className="w-10 h-6 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-1 py-0.5 text-xs font-mono text-center font-bold text-slate-100 outline-none transition-colors shrink-0"
                        />
                      )}
                    </div>
                  </FolioTooltip>
                );
              })()}

              {/* Meta Level (0-5) */}
              {(() => {
                const curML = Math.min(5, Math.max(0, getNum('magic-level', getNum('meta-level', 3))));
                const baseML = Math.min(5, Math.max(0, getNum('base-meta-level', 3)));
                const mlCP = (curML - 3) * 10;
                const purchasedML = Math.max(0, curML - baseML);
                return (
                  <FolioTooltip
                    title="Meta Level (ML 0–5)"
                    badge="Metaphysics Tier"
                    badgeColor="purple"
                    description="Standard metaphysics baseline is ML3 (0 CP). Higher metaphysics costs 10 CP per level (+10 CP at ML4, +20 CP at ML5). Lower metaphysics grants +10 CP per level difference (+10 CP at ML2, +20 CP at ML1, +30 CP at ML0). Lowered scores may be increased during creation or advancement at 10 CP per level. Species and faction levels do not stack (highest is taken)."
                    formula={`ML ${curML}: ${(curML - 3)} level difference × 10 CP = ${mlCP >= 0 ? `+${mlCP}` : mlCP} CP (Base ML: ${baseML}${purchasedML > 0 ? `, +${purchasedML} Upgraded` : ''})`}
                    cost={mlCP === 0 ? '0 CP (Baseline)' : (mlCP > 0 ? `+${mlCP} CP Cost` : `+${Math.abs(mlCP)} CP Awarded`)}
                    tags={['ML 0-5', '10 CP / Level diff', 'Pillars Base']}
                  >
                    <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded border border-slate-700/80 gap-2 hover:border-purple-500/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <label htmlFor="magic-level" className="text-[11px] font-bold uppercase tracking-wider text-purple-300 cursor-pointer shrink-0 leading-tight">
                            Meta Level
                          </label>
                          <span className="text-[8.5px] text-slate-400 font-mono hidden sm:inline">(0–5)</span>
                        </div>
                        <span className={`text-[8.5px] font-mono leading-none ${mlCP > 0 ? 'text-amber-400' : mlCP < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {mlCP === 0 ? '0 CP (ML3 Base)' : (mlCP > 0 ? `+${mlCP} CP` : `+${Math.abs(mlCP)} CP Award`)}
                          {purchasedML > 0 ? ` • +${purchasedML} Upgraded` : (baseML < 3 ? ` (Base ML${baseML})` : '')}
                        </span>
                      </div>
                      {isSheetLocked ? (
                        <span className="text-xs font-mono font-bold text-purple-200 px-1 py-0.5">
                          {curML}
                        </span>
                      ) : (
                        <input
                          id="magic-level"
                          type="number"
                          min="0"
                          max="5"
                          value={curML}
                          onChange={(e) => updateField('magic-level', Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                          className="w-10 h-6 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded px-1 py-0.5 text-xs font-mono text-center font-bold text-slate-100 outline-none transition-colors shrink-0"
                        />
                      )}
                    </div>
                  </FolioTooltip>
                );
              })()}
            </div>
          </div>

          {/* Wealth & Financial Status Trait Block */}
          {(() => {
            const wealthScore = derivedStats?.wealthScore ?? 10;
            const wealthStatus = derivedStats?.wealthStatus;
            const statusName = derivedStats?.wealthStatusName || wealthStatus?.name || 'Middle Class';
            const autoBuyCr = derivedStats?.wealthAutoBuyCr ?? 600;
            const creditValue = derivedStats?.wealthCreditValue ?? 600;
            const breakdown = derivedStats?.wealthBreakdown || {};
            const customWealthMod = getNum('wealth-score-mod', 0);

            // Credits & Debits totals
            const rawCredits = characterData['credits'] ?? characterData['wealth-credits'] ?? 0;
            const liquidCredits = Math.max(0, parseInt(rawCredits, 10) || 0);

            const tradeGoods = getArrayFromData('trade-goods', 'wealth-trade-goods');
            const totalTradeGoodsCr = tradeGoods.reduce((sum, item) => sum + (Number(item?.creditValue) || 0), 0);
            const totalLiquidCr = liquidCredits + totalTradeGoodsCr;

            const debits = getArrayFromData('debits', 'wealth-debits');
            const totalDebtCr = debits.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
            const netLiquidPosition = totalLiquidCr - totalDebtCr;

            const getStatusBadgeStyle = (name) => {
              switch (name) {
                case 'Indebted':
                case 'Impoverished':
                  return 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
                case 'Struggling':
                  return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
                case 'Middle Class':
                  return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
                case 'Affluent':
                  return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
                case 'Wealthy':
                  return 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]';
                case 'Hegemon':
                case 'Industrialist':
                  return 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]';
                case 'Dynastic':
                case 'System Lord':
                case 'Sector Ruler':
                case 'Faction Ruler':
                  return 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.3)]';
                default:
                  return 'bg-slate-800 text-slate-300 border-slate-700';
              }
            };

            const formulaText = `WS ${wealthScore} = Occu Base (${breakdown.occupationBase ?? 2}) + Origin (${(breakdown.originMod ?? 0) >= 0 ? '+' : ''}${breakdown.originMod ?? 0}) + Faction (${(breakdown.factionMod ?? 0) >= 0 ? '+' : ''}${breakdown.factionMod ?? 0}) + TL (${(breakdown.tlMod ?? 0) >= 0 ? '+' : ''}${breakdown.tlMod ?? 0}) + Vocation (${(breakdown.skillBonus ?? 0) >= 0 ? '+' : ''}${breakdown.skillBonus ?? 0})${customWealthMod !== 0 ? ` + Mod (${customWealthMod >= 0 ? '+' : ''}${customWealthMod})` : ''}`;

            return (
              <div className="bg-slate-900/60 border border-amber-900/50 rounded-lg p-2 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-900/60 pb-1 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs shrink-0">💎</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 truncate">
                      Wealth &amp; Status
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 hidden sm:inline shrink-0">
                      (EUFT)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openRulesModal('wealth')}
                    className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-[9.5px] font-bold text-amber-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                    title="Open Tangent Economic Unified Field Theory &amp; Wealth Codex"
                  >
                    <span>💎</span> Codex
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {/* Wealth Score (WS) */}
                  <FolioTooltip
                    title={`Wealth Score: ${wealthScore}`}
                    badge={statusName}
                    badgeColor="amber"
                    description={`Represents personal economic leverage, liquid credit access, and commercial baseline. Items up to ${autoBuyCr.toLocaleString()} Cr are purchased automatically without financial rolls or lifestyle strain.`}
                    formula={formulaText}
                    cost={`Auto-Buy: ${autoBuyCr.toLocaleString()} Cr`}
                    tags={['Wealth Score', statusName, `${autoBuyCr.toLocaleString()} Cr Auto-Buy`, 'EUFT Golden Rule']}
                  >
                    <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded border border-slate-700/80 gap-2 hover:border-amber-500/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 leading-tight">
                            Wealth Score
                          </span>
                          <span className="text-[8.5px] text-slate-400 font-mono">(WS)</span>
                        </div>
                        <span className="text-[8.5px] font-mono leading-none text-slate-400 truncate">
                          Base {breakdown.occupationBase ?? 2} | {breakdown.occupation || 'Occu'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSheetLocked ? (
                          <span className="text-sm font-mono font-bold text-amber-300 px-1 py-0.5">
                            {wealthScore}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-mono font-bold text-amber-300">
                              {wealthScore}
                            </span>
                            <input
                              type="number"
                              title="Custom / situational Wealth Score modifier"
                              placeholder="±Mod"
                              value={customWealthMod || ''}
                              onChange={(e) => updateField('wealth-score-mod', parseInt(e.target.value, 10) || 0)}
                              className="w-10 h-6 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-1 py-0.5 text-[10px] font-mono text-center font-bold text-slate-100 outline-none transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </FolioTooltip>

                  {/* Financial Status Benchmark */}
                  <FolioTooltip
                    title={`Financial Status: ${statusName}`}
                    badge="Benchmark Tier"
                    badgeColor="amber"
                    description={`Standard lifestyle: ${wealthStatus?.lifestyle || 'Stable dwelling'}. Net worth benchmark is ${wealthStatus?.netWorth || '~25k Cr'}. Single-transaction auto-buy threshold is ${autoBuyCr.toLocaleString()} Cr.`}
                    formula={`Status Tier determined by WS range (${wealthStatus?.wsMin ?? 10}–${wealthStatus?.wsMax ?? 14})`}
                    cost={`Net Worth: ${wealthStatus?.netWorth || '~25k Cr'}`}
                    tags={['Financial Status', statusName, wealthStatus?.lifestyle || 'Standard']}
                  >
                    <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded border border-slate-700/80 gap-2 hover:border-amber-500/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 leading-tight">
                          Status Ranking
                        </span>
                        <span className="text-[8.5px] font-mono leading-none text-slate-400 truncate">
                          Net: {wealthStatus?.netWorth || '~25k Cr'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getStatusBadgeStyle(statusName)}`}>
                        {statusName}
                      </span>
                    </div>
                  </FolioTooltip>

                  {/* Credit Auto-Buy Limit */}
                  <FolioTooltip
                    title="Auto-Buy Credit Limit"
                    badge="Liquidity Threshold"
                    badgeColor="cyan"
                    description={`Under Tangent EUFT, any gear, service, or vehicle component with a market cost at or below ${autoBuyCr.toLocaleString()} Cr (Crafting DC ≤ ${wealthScore}) is auto-purchased without depletion checks or lifestyle reduction. Items exceeding this cost incur a Liquidity Gap.`}
                    formula={`Auto-Buy Limit = ${autoBuyCr.toLocaleString()} Cr | TSC Base = ${creditValue.toLocaleString()} Cr`}
                    cost="0 Liquidity Drag"
                    tags={['Auto-Buy', `${autoBuyCr.toLocaleString()} Cr`, 'TSC Parity']}
                  >
                    <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded border border-slate-700/80 gap-2 hover:border-amber-500/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 leading-tight">
                          Auto-Buy Limit
                        </span>
                        <span className="text-[8.5px] font-mono leading-none text-slate-400 truncate">
                          Single Purchase
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {autoBuyCr >= 1000000 ? `${(autoBuyCr / 1000000).toFixed(1)}M Cr` : autoBuyCr >= 1000 ? `${(autoBuyCr / 1000).toFixed(1)}k Cr` : `${autoBuyCr} Cr`}
                        </span>
                      </div>
                    </div>
                  </FolioTooltip>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* ACCORDIONS: CREDITS (LIQUID ASSETS) & DEBITS (LIABILITIES) */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="space-y-1.5 pt-1.5 border-t border-amber-900/40">
                  {/* 1. Credits Accordion: Liquid Assets */}
                  <div className="border border-cyan-900/60 rounded bg-slate-950/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsCreditsAccordionOpen(prev => !prev)}
                      className="w-full flex items-center justify-between p-2 hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isCreditsAccordionOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <Coins className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                          Liquid Assets
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
                          ({tradeGoods.length} {tradeGoods.length === 1 ? 'custom asset' : 'custom assets'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                          {totalLiquidCr.toLocaleString()} Cr Total
                        </span>
                      </div>
                    </button>

                    {isCreditsAccordionOpen && (
                      <div className="p-2 pt-0 space-y-2 border-t border-cyan-950">
                        {/* Primary Liquid Credits Field */}
                        <div className="bg-slate-900/70 p-2 rounded border border-slate-700/80 flex flex-wrap items-center justify-between gap-2 mt-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">🪙</span>
                              <label htmlFor="wealth-credits-input" className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 cursor-pointer">
                                Liquid Standard Credits (Cr)
                              </label>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">
                              Direct spendable universal credit reserves
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSheetLocked ? (
                              <span className="text-sm font-mono font-bold text-cyan-300 px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                                {liquidCredits.toLocaleString()} Cr
                              </span>
                            ) : (
                              <div className="relative flex items-center">
                                <input
                                  id="wealth-credits-input"
                                  type="number"
                                  min="0"
                                  value={liquidCredits}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                    updateField('credits', val);
                                    updateField('wealth-credits', val);
                                  }}
                                  className="w-28 h-7 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2 text-xs font-mono text-right font-bold text-cyan-200 outline-none transition-colors"
                                  placeholder="0"
                                />
                                <span className="ml-1 text-[10px] font-mono text-slate-400">Cr</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Trade Goods & Custom Currencies Table */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                              Trade Goods &amp; Currencies
                            </span>
                            {!isSheetLocked && (
                              <button
                                type="button"
                                onClick={handleAddTradeGood}
                                className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-[9.5px] font-bold text-cyan-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add Good / Currency
                              </button>
                            )}
                          </div>

                          {tradeGoods.length === 0 ? (
                            <div className="p-2 rounded bg-slate-900/40 border border-dashed border-slate-800 text-center">
                              <span className="text-[10px] text-slate-500 italic">
                                No custom trade goods or regional currencies recorded. Click "+ Add Good / Currency" to log materials, cargo, or local specie.
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {tradeGoods.map((item, idx) => (
                                <div 
                                  key={item.id || idx}
                                  className="bg-slate-900/80 p-1.5 rounded border border-slate-700/80 flex flex-wrap sm:flex-nowrap items-center gap-1.5 text-xs hover:border-cyan-500/40 transition-colors"
                                >
                                  {/* Goods Classification (Currency or Material) */}
                                  <div className="w-24 shrink-0">
                                    {isSheetLocked ? (
                                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 block text-center">
                                        {item.goods || 'material'}
                                      </span>
                                    ) : (
                                      <select
                                        value={item.goods || 'material'}
                                        onChange={(e) => handleUpdateTradeGood(idx, 'goods', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-1.5 py-1 text-[10px] font-mono text-cyan-300 outline-none cursor-pointer uppercase font-bold"
                                        title="Goods classification (currency or material)"
                                      >
                                        <option value="material">Material</option>
                                        <option value="currency">Currency</option>
                                        <option value="commodity">Commodity</option>
                                      </select>
                                    )}
                                  </div>

                                  {/* Description / Name */}
                                  <div className="flex-1 min-w-[120px]">
                                    {isSheetLocked ? (
                                      <span className="text-[11px] font-bold text-slate-200 px-1 truncate block">
                                        {item.name || 'Unnamed Good'}
                                      </span>
                                    ) : (
                                      <input
                                        type="text"
                                        placeholder="Good or currency description..."
                                        value={item.name || ''}
                                        onChange={(e) => handleUpdateTradeGood(idx, 'name', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-[11px] text-slate-100 outline-none transition-colors"
                                      />
                                    )}
                                  </div>

                                  {/* Amount / Qty */}
                                  <div className="w-16 shrink-0">
                                    {isSheetLocked ? (
                                      <span className="text-[11px] font-mono text-slate-300 block text-center">
                                        x{item.amount || 1}
                                      </span>
                                    ) : (
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Qty"
                                        value={item.amount ?? 1}
                                        onChange={(e) => handleUpdateTradeGood(idx, 'amount', parseInt(e.target.value, 10) || 0)}
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-1.5 py-1 text-[10px] font-mono text-center text-slate-200 outline-none transition-colors"
                                        title="Amount / Units"
                                      />
                                    )}
                                  </div>

                                  {/* Credit Value */}
                                  <div className="w-24 shrink-0">
                                    {isSheetLocked ? (
                                      <span className="text-[11px] font-mono font-bold text-amber-300 block text-right pr-1">
                                        {(Number(item.creditValue) || 0).toLocaleString()} Cr
                                      </span>
                                    ) : (
                                      <div className="relative flex items-center">
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="Cr Value"
                                          value={item.creditValue ?? 0}
                                          onChange={(e) => handleUpdateTradeGood(idx, 'creditValue', parseInt(e.target.value, 10) || 0)}
                                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-1.5 py-1 text-[10px] font-mono text-right font-bold text-amber-300 outline-none transition-colors"
                                          title="Credit Value (Cr)"
                                        />
                                        <span className="ml-1 text-[9px] font-mono text-slate-400">Cr</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Delete action */}
                                  {!isSheetLocked && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTradeGood(idx)}
                                      className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {/* Subtotal row */}
                              <div className="flex justify-between items-center px-2 py-1 text-[10px] font-mono text-slate-400 border-t border-slate-800">
                                <span>Goods Subtotal: <strong className="text-amber-300">{totalTradeGoodsCr.toLocaleString()} Cr</strong></span>
                                <span>Total Liquid Wealth: <strong className="text-cyan-300">{totalLiquidCr.toLocaleString()} Cr</strong></span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Debits Accordion: Debts */}
                  <div className="border border-rose-900/60 rounded bg-slate-950/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsDebitsAccordionOpen(prev => !prev)}
                      className="w-full flex items-center justify-between p-2 hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isDebitsAccordionOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <Receipt className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                          Debts
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
                          ({debits.length} {debits.length === 1 ? 'liability' : 'liabilities'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold border ${totalDebtCr > 0 ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                          {totalDebtCr > 0 ? `-${totalDebtCr.toLocaleString()} Cr Debt` : 'Debt-Free'}
                        </span>
                      </div>
                    </button>

                    {isDebitsAccordionOpen && (
                      <div className="p-2 pt-0 space-y-2 border-t border-rose-950">
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Outstanding Debts, Mortgages &amp; Liens
                          </span>
                          {!isSheetLocked && (
                            <button
                              type="button"
                              onClick={handleAddDebit}
                              className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-[9.5px] font-bold text-rose-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Debt
                            </button>
                          )}
                        </div>

                        {debits.length === 0 ? (
                          <div className="p-2 rounded bg-slate-900/40 border border-dashed border-slate-800 text-center">
                            <span className="text-[10px] text-slate-500 italic">
                              No active debts or financial liens recorded. Operative has zero recorded debt.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {debits.map((item, idx) => (
                              <div 
                                key={item.id || idx}
                                className="bg-slate-900/80 p-1.5 rounded border border-slate-700/80 flex flex-wrap sm:flex-nowrap items-center gap-1.5 text-xs hover:border-rose-500/40 transition-colors"
                              >
                                {/* Amount (Cr) */}
                                <div className="w-28 shrink-0">
                                  {isSheetLocked ? (
                                    <span className="text-[11px] font-mono font-bold text-rose-300 block">
                                      -{(Number(item.amount) || 0).toLocaleString()} Cr
                                    </span>
                                  ) : (
                                    <div className="relative flex items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Debt (Cr)"
                                        value={item.amount ?? 0}
                                        onChange={(e) => handleUpdateDebit(idx, 'amount', parseInt(e.target.value, 10) || 0)}
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded px-1.5 py-1 text-[10px] font-mono text-right font-bold text-rose-300 outline-none transition-colors"
                                        title="Amount owed in Credits"
                                      />
                                      <span className="ml-1 text-[9px] font-mono text-slate-400">Cr</span>
                                    </div>
                                  )}
                                </div>

                                {/* Debtor / Creditor */}
                                <div className="w-36 shrink-0">
                                  {isSheetLocked ? (
                                    <span className="text-[11px] font-bold text-slate-200 truncate block">
                                      {item.debtor || 'Unspecified Creditor'}
                                    </span>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="Debtor / Creditor..."
                                      value={item.debtor || ''}
                                      onChange={(e) => handleUpdateDebit(idx, 'debtor', e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded px-2 py-1 text-[11px] text-slate-100 outline-none transition-colors"
                                    />
                                  )}
                                </div>

                                {/* Notes / Terms */}
                                <div className="flex-1 min-w-[140px]">
                                  {isSheetLocked ? (
                                    <span className="text-[10px] text-slate-400 truncate block italic">
                                      {item.notes || 'No terms noted'}
                                    </span>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="Terms, collateral, repayment cycles, interest notes..."
                                      value={item.notes || ''}
                                      onChange={(e) => handleUpdateDebit(idx, 'notes', e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded px-2 py-1 text-[10px] text-slate-300 outline-none transition-colors"
                                    />
                                  )}
                                </div>

                                {/* Delete action */}
                                {!isSheetLocked && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDebit(idx)}
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                    title="Remove debt"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            {/* Subtotal row */}
                            <div className="flex justify-between items-center px-2 py-1 text-[10px] font-mono text-slate-400 border-t border-slate-800">
                              <span>Total Outstanding Debt: <strong className="text-rose-400">-{totalDebtCr.toLocaleString()} Cr</strong></span>
                              <span>Net Liquid Position: <strong className={netLiquidPosition >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{netLiquidPosition >= 0 ? `+${netLiquidPosition.toLocaleString()}` : netLiquidPosition.toLocaleString()} Cr</strong></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Advancement Points (AP) Block */}
          <div className="bg-slate-900/60 border border-emerald-900/50 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap justify-between items-center border-b border-emerald-900/60 pb-1.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🎖️</span>
                <FolioTooltip
                  title="Advancement Points (AP)"
                  badge="Heroic Advancement"
                  badgeColor="emerald"
                  description="System of character progression. Advancement Points (AP) are converted 1:1 into Character Points (CP) to buy attribute points, skills, and features."
                  formula="1 AP = 1 CP"
                  tags={['Advancement', 'AP', 'CP']}
                  showInfoIcon={true}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors">
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
                  className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-[9.5px] font-bold text-emerald-300 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open Advancement Points (AP) Codex & Progression Ledger"
                >
                  <span>✨</span> AP Codex
                </button>

                <button
                  type="button"
                  onClick={() => openRulesModal('experience')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-[9.5px] font-bold text-slate-300 hover:text-emerald-200 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open canonical Advancement Rules Codex"
                >
                  <span>📖</span> Rules
                </button>

                <button
                  type="button"
                  onClick={() => setIsFateOverrideOpen(true)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-[9.5px] font-bold text-slate-300 hover:text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open discreet override modal for Karma, Plot Points, and Advancement Points"
                >
                  <span>⚙️</span> Overrides
                </button>
              </div>
            </div>

            {/* Advancement Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-mono">
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
                      <div className="p-1.5 py-1 rounded border bg-slate-800/50 border-emerald-700/60 text-center flex flex-col justify-between w-full hover:border-emerald-400 transition-colors">
                        <span className="text-[9.5px] uppercase font-bold text-emerald-400 leading-tight">Earned AP</span>
                        <span className="text-sm font-black text-emerald-300 leading-tight my-0.5">+{earnedAP}</span>
                        <span className="text-[8px] text-slate-500 leading-tight">Lifetime Total</span>
                      </div>
                    </FolioTooltip>

                    <FolioTooltip
                      title="Available Advancement Points"
                      badge="Advancement Capital"
                      badgeColor="cyan"
                      description="Unspent Advancement Points ready to be invested into attributes (5 AP), skills (1 AP), or features (3 AP)."
                      formula={`Available: ${availableAP} AP`}
                    >
                      <div className="p-1.5 py-1 rounded border bg-slate-800/50 border-cyan-700/60 text-center flex flex-col justify-between w-full hover:border-cyan-400 transition-colors">
                        <span className="text-[9.5px] uppercase font-bold text-cyan-300 leading-tight">Available</span>
                        <span className="text-sm font-black text-cyan-200 leading-tight my-0.5">{availableAP}</span>
                        <span className="text-[8px] text-slate-500 leading-tight">Unspent AP</span>
                      </div>
                    </FolioTooltip>

                    <FolioTooltip
                      title="Spent Advancement Points"
                      badge="Invested Progression"
                      badgeColor="slate"
                      description="Total Advancement Points allocated towards character growth across attributes, skills, and traits."
                      formula={`Invested: ${spentAP} AP`}
                    >
                      <div className="p-1.5 py-1 rounded border bg-slate-800/50 border-slate-700 text-center flex flex-col justify-between w-full hover:border-slate-500 transition-colors">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-tight">Spent AP</span>
                        <span className="text-sm font-bold text-slate-200 leading-tight my-0.5">{spentAP}</span>
                        <span className="text-[8px] text-slate-500 leading-tight">Invested AP</span>
                      </div>
                    </FolioTooltip>

                    <FolioTooltip
                      title="Advancement Debt"
                      badge="Mortality Penalty"
                      badgeColor="rose"
                      description="Debt incurred when an operative undergoes emergency Revivification from death. Future earned AP will automatically repay debt first."
                      formula={debt > 0 ? `Debt: -${debt} AP` : 'Clear (No Debt)'}
                    >
                      <div className={`p-1.5 py-1 rounded border text-center flex flex-col justify-between w-full transition-colors ${
                        debt > 0 
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 hover:border-rose-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}>
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-tight">AP Debt</span>
                        <span className={`text-sm font-black leading-tight my-0.5 ${debt > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                          {debt > 0 ? `-${debt}` : '0'}
                        </span>
                        <span className="text-[8px] text-slate-500 leading-tight">
                          {debt > 0 ? 'High Cost' : 'Clear'}
                        </span>
                      </div>
                    </FolioTooltip>
                  </>
                );
              })()}
            </div>

            {/* Advancement Debt Action Banner if Debt > 0 */}
            {(characterData?.experience_debt || 0) > 0 && (
              <div className="p-1.5 rounded bg-rose-950/30 border border-rose-800/40 flex items-center justify-between gap-2 text-xs">
                <span className="text-rose-300 text-[10.5px]">
                  ⚠️ <strong>AP Debt Active (-{characterData.experience_debt}):</strong> Future earned AP automatically settles debt.
                </span>
                {(economyBreakdown?.availableAP ?? characterData?.earned_ap ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => payExperienceDebt(1)}
                    className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-100 rounded text-[9.5px] font-bold border border-rose-600 transition-colors shrink-0 cursor-pointer"
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
      {isFateOverrideOpen && (
        <React.Suspense fallback={null}>
          <DiscreetFateOverrideModal
            isOpen={isFateOverrideOpen}
            onClose={() => setIsFateOverrideOpen(false)}
            characterData={characterData}
            updateField={updateField}
            economyBreakdown={economyBreakdown}
            derivedStats={derivedStats}
            charismaScore={getAttrTotal('attr-charisma')}
          />
        </React.Suspense>
      )}

      {/* Consolidated Core Stats Rules Codex Modal */}
      {isCoreRulesModalOpen && (
        <React.Suspense fallback={null}>
          <PerceptionEssenceMovementModal
            isOpen={isCoreRulesModalOpen}
            onClose={() => setIsCoreRulesModalOpen(false)}
            initialTab={coreRulesInitialTab}
            characterData={characterData}
            getAttrTotal={getAttrTotal}
            derivedStats={derivedStats}
          />
        </React.Suspense>
      )}

      {/* Dedicated Perception Rules Modal */}
      {isPerceptionRulesOpen && (
        <React.Suspense fallback={null}>
          <PerceptionRulesModal
            isOpen={isPerceptionRulesOpen}
            onClose={() => setIsPerceptionRulesOpen(false)}
            characterData={characterData}
            getAttrTotal={getAttrTotal}
            derivedStats={derivedStats}
          />
        </React.Suspense>
      )}

      {/* Consolidated Karma Codex Modal */}
      {isKarmaCodexOpen && (
        <React.Suspense fallback={null}>
          <KarmaCodexModal
            isOpen={isKarmaCodexOpen}
            onClose={() => setIsKarmaCodexOpen(false)}
            charismaScore={getAttrTotal('attr-charisma')}
            currentKarma={getNum('karma', derivedStats?.maxKarma ?? 3)}
            maxKarma={derivedStats?.maxKarma ?? 3}
            plotPoints={getNum('plot-points', 0)}
          />
        </React.Suspense>
      )}

      {/* Consolidated Advancement Points (AP) Codex Modal */}
      {isExperienceCodexOpen && (
        <React.Suspense fallback={null}>
          <ExperienceCodexModal
            isOpen={isExperienceCodexOpen}
            onClose={() => setIsExperienceCodexOpen(false)}
            earnedAP={Number(characterData?.earned_ap || 0)}
            availableAP={economyBreakdown?.availableAP ?? Number(characterData?.earned_ap || 0)}
            experienceDebt={Number(characterData?.experience_debt || 0)}
          />
        </React.Suspense>
      )}

    </div>
  );
};

export default React.memo(CoreStatsTab);
