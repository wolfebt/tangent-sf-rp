import React, { useState, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { Crosshair, Shield, Plus, Dices, Sparkles, X, Zap, Heart, Activity } from 'lucide-react';
import FolioTooltip from '../shared/FolioTooltip';
import { 
  createAttackFromWeapon, 
  createArmorFromItem,
  isNaturalAttackTrait,
  createAttackFromNaturalTrait,
  isOffensiveMetaphysics,
  createAttackFromInvocation,
  calculateDefaultAttackScore,
  getEffectiveSkillBonus,
  isConventionalWeaponItem
} from '../../../utils/combatUtils';

export const CombatTab = ({ onOpenSelectorModal, onOpenAssetModal, onSwitchToTactical }) => {
  const {
    characterData,
    updateField,
    derivedStats,
    getAttrTotal,
    computedModifiers,
    isLocked,
    isPlayerOverride
  } = useFolio();
  const { openDiceRoller } = useDice();
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);

  const [combatView, setCombatView] = useState('all'); // 'all' | 'offensive' | 'defensive'
  const [latestDamageRoll, setLatestDamageRoll] = useState(null);

  const curHealth = parseInt(characterData.current_health ?? characterData.health ?? 30, 10);
  const maxHealth = parseInt(characterData.health || 30, 10);
  const curVitality = parseInt(characterData.current_vitality ?? characterData.vitality ?? 30, 10);
  const maxVitality = parseInt(characterData.vitality || 30, 10);
  const curStructure = parseInt(characterData.current_structure ?? characterData.structure ?? 60, 10);
  const maxStructure = parseInt(characterData.structure || 60, 10);
  const isSynthetic = Boolean(
    characterData.isSynthetic ?? characterData.is_synthetic ?? derivedStats?.isSynthetic ?? false
  );
  const isDead = characterData.is_dead || false;
  const atDeathsDoor = !isDead && (characterData.is_at_deaths_door || (curHealth <= 0 && curVitality <= 0));
  const isIncapacitated = !isDead && !atDeathsDoor && curHealth <= 0;

  const handleRollDamage = (damageExpr, weaponName) => {
    if (!damageExpr) return;
    const rollResult = rollDice(damageExpr, {
      characterName: characterData['char-name'] || 'Hero',
      label: `${weaponName || 'Weapon'} Damage`
    });

    AudioService.playDiceRollSound();
    if (rollResult.isCritSuccess) {
      AudioService.playCriticalChime(true);
    } else if (rollResult.isCritFail) {
      AudioService.playCriticalChime(false);
    } else {
      AudioService.playCombatHit(false);
    }

    setLatestDamageRoll(rollResult);
  };

  const getArray = (key) => {
    const val = characterData[key];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Weapons & Armoring from Inventory (Property)
  const weapons = getArray('weapons');
  const armoring = getArray('armoring');

  // Attacks list
  const attacks = getArray('attacks');

  // Unreadied weapons & armors
  const unreadiedWeapons = weapons.filter(w => {
    const wName = (typeof w === 'object' ? (w.name || w.title) : String(w || '')).trim().toLowerCase();
    const wId = typeof w === 'object' ? w.id : null;
    return !attacks.some(a => {
      if (wId && (a.weaponId === wId || a.id === wId || a.id === `atk_${wId}`)) return true;
      return (a.name || '').trim().toLowerCase() === wName;
    });
  });

  // Natural attacks from features, traits & special abilities not yet in attacks
  const naturalSources = [
    ...(Array.isArray(characterData.features) ? characterData.features : []),
    ...(Array.isArray(characterData.traits) ? characterData.traits : []),
    ...(Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [])
  ].filter(isNaturalAttackTrait);

  const unreadiedNaturalAttacks = naturalSources.filter(nat => {
    const nName = (typeof nat === 'object' ? (nat.name || nat.title) : String(nat || '')).trim().toLowerCase();
    const nId = typeof nat === 'object' ? nat.id : null;
    return !attacks.some(a => {
      if (nId && (a.sourceId === nId || a.id === nId || a.id === `nat_${nId}`)) return true;
      return (a.name || '').trim().toLowerCase() === nName;
    });
  });

  // Offensive metaphysics not yet in attacks
  const metaSources = [
    ...(Array.isArray(characterData.invocations) ? characterData.invocations : []),
    ...(Array.isArray(characterData.awakened) ? characterData.awakened : []),
    ...(Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [])
  ].filter(isOffensiveMetaphysics);

  const unreadiedInvocations = metaSources.filter(inv => {
    const iName = (typeof inv === 'object' ? (inv.name || inv.title) : String(inv || '')).trim().toLowerCase();
    const iId = typeof inv === 'object' ? inv.id : null;
    return !attacks.some(a => {
      if (iId && (a.sourceId === iId || a.id === iId || a.id === `meta_${iId}`)) return true;
      return (a.name || '').trim().toLowerCase() === iName;
    });
  });

  // Armor & Defense list
  const armors = getArray('armor');

  const unreadiedArmors = armoring.filter(arm => {
    const aName = (typeof arm === 'object' ? (arm.name || arm.title) : String(arm || '')).trim().toLowerCase();
    const aId = typeof arm === 'object' ? arm.id : null;
    return !armors.some(a => {
      if (aId && (a.armorId === aId || a.id === aId || a.id === `armor_${aId}`)) return true;
      return (a.name || '').trim().toLowerCase() === aName;
    });
  });

  const dismissedCombatItemsRef = React.useRef(new Set());

  // Auto-sync unreadied weapons, natural attacks, and offensive invocations into attacks unless explicitly dismissed
  useEffect(() => {
    const autoWeapons = unreadiedWeapons.filter(w => {
      const key = (typeof w === 'object' ? (w.id || w.name || w.title) : String(w || '')).trim().toLowerCase();
      return key && !dismissedCombatItemsRef.current.has(`atk:${key}`);
    });
    const autoNatural = unreadiedNaturalAttacks.filter(n => {
      const key = (typeof n === 'object' ? (n.id || n.name || n.title) : String(n || '')).trim().toLowerCase();
      return key && !dismissedCombatItemsRef.current.has(`atk:${key}`);
    });
    const autoInvocations = unreadiedInvocations.filter(inv => {
      const key = (typeof inv === 'object' ? (inv.id || inv.name || inv.title) : String(inv || '')).trim().toLowerCase();
      return key && !dismissedCombatItemsRef.current.has(`atk:${key}`);
    });

    if (autoWeapons.length > 0 || autoNatural.length > 0 || autoInvocations.length > 0) {
      const nextAttacks = [
        ...attacks,
        ...autoWeapons.map(w => createAttackFromWeapon(w, characterData, getAttrTotal, computedModifiers)),
        ...autoNatural.map(n => createAttackFromNaturalTrait(n, characterData, getAttrTotal, computedModifiers)),
        ...autoInvocations.map(inv => createAttackFromInvocation(inv, characterData, getAttrTotal, computedModifiers))
      ];
      updateField('attacks', nextAttacks);
    }
  }, [unreadiedWeapons.length, unreadiedNaturalAttacks.length, unreadiedInvocations.length]);

  // Auto-sync unreadied armoring into armor defenses unless explicitly dismissed
  useEffect(() => {
    const autoArmors = unreadiedArmors.filter(a => {
      const key = (typeof a === 'object' ? (a.id || a.name || a.title) : String(a || '')).trim().toLowerCase();
      return key && !dismissedCombatItemsRef.current.has(`arm:${key}`);
    });
    if (autoArmors.length > 0) {
      updateField('armor', [...armors, ...autoArmors.map(a => createArmorFromItem(a))]);
    }
  }, [unreadiedArmors.length]);

  const syncAllUnreadiedAttacks = () => {
    const totalUnreadied = unreadiedWeapons.length + unreadiedNaturalAttacks.length + unreadiedInvocations.length;
    if (totalUnreadied === 0) return;
    const newAttacks = [
      ...attacks,
      ...unreadiedWeapons.map(w => createAttackFromWeapon(w, characterData, getAttrTotal, computedModifiers)),
      ...unreadiedNaturalAttacks.map(n => createAttackFromNaturalTrait(n, characterData, getAttrTotal, computedModifiers)),
      ...unreadiedInvocations.map(inv => createAttackFromInvocation(inv, characterData, getAttrTotal, computedModifiers))
    ];
    updateField('attacks', newAttacks);
  };

  const readyAllArmors = () => {
    if (unreadiedArmors.length === 0) return;
    const newArmors = [
      ...armors,
      ...unreadiedArmors.map(a => createArmorFromItem(a))
    ];
    updateField('armor', newArmors);
  };

  const addAttack = () => {
    const newAttacks = [...attacks, { name: '', score: '', damage: '', type: '', notes: '' }];
    updateField('attacks', newAttacks);
  };

  const updateAttack = (index, field, value) => {
    const updated = [...attacks];
    const nextRow = { ...updated[index], [field]: value };
    if (field === 'score') {
      nextRow.isManualScore = Boolean(String(value).trim() !== '');
    }
    updated[index] = nextRow;
    updateField('attacks', updated);
  };

  const removeAttack = async (index) => {
    const target = attacks[index];
    const atkName = target?.name || 'Attack';
    if (!(await confirmTypedDeletion(atkName, 'attack'))) return;
    const key = (target?.weaponId || target?.sourceId || target?.id || target?.name || '').trim().toLowerCase();
    if (key) dismissedCombatItemsRef.current.add(`atk:${key}`);
    if (target?.name) dismissedCombatItemsRef.current.add(`atk:${target.name.trim().toLowerCase()}`);
    updateField('attacks', attacks.filter((_, i) => i !== index));
  };

  const addArmor = () => {
    const newArmors = [...armors, { name: '', resistance: '', type: '', notes: '' }];
    updateField('armor', newArmors);
  };

  const updateArmor = (index, field, value) => {
    const updated = [...armors];
    updated[index] = { ...updated[index], [field]: value };
    updateField('armor', updated);
  };

  const removeArmor = async (index) => {
    const target = armors[index];
    const armorName = target?.name || 'Armor';
    if (!(await confirmTypedDeletion(armorName, 'defense entry'))) return;
    const key = (target?.armorId || target?.id || target?.name || '').trim().toLowerCase();
    if (key) dismissedCombatItemsRef.current.add(`arm:${key}`);
    if (target?.name) dismissedCombatItemsRef.current.add(`arm:${target.name.trim().toLowerCase()}`);
    updateField('armor', armors.filter((_, i) => i !== index));
  };

  const reflexTotal = getAttrTotal ? getAttrTotal('attr-reflex') : parseInt(characterData['attr-reflex'] || 2, 10);
  const agilityTotal = getAttrTotal ? getAttrTotal('attr-agility') : parseInt(characterData['attr-agility'] || 0, 10);
  const strengthTotal = getAttrTotal ? getAttrTotal('attr-strength') : parseInt(characterData['attr-strength'] || 0, 10);

  const initiativeMod = parseInt(characterData['initiative-mod'] || 0, 10) +
    (computedModifiers?.combatMods?.['initiative-mod'] || 0);
  const initiativeTotal = reflexTotal + initiativeMod;

  const defenseSkillBonus = getEffectiveSkillBonus('combat-defense', characterData, computedModifiers);
  const acroSkillBonus = getEffectiveSkillBonus('physical-acrobatics', characterData, computedModifiers);
  const meleeSkillBonus = Math.max(
    getEffectiveSkillBonus('combat-melee', characterData, computedModifiers),
    getEffectiveSkillBonus('combat-unarmed', characterData, computedModifiers),
    defenseSkillBonus
  );

  const combatDefenseMod = (computedModifiers?.combatMods?.['defense-mod'] || 0) +
    parseInt(characterData['defense-mod'] || 0, 10);
  const combatEvasionMod = (computedModifiers?.combatMods?.['evasion-mod'] || 0) +
    parseInt(characterData['evasion-mod'] || 0, 10);

  const evasionTotal = 10 + agilityTotal + Math.max(defenseSkillBonus, acroSkillBonus) + combatDefenseMod + combatEvasionMod;
  const meleeDefenseTotal = 10 + Math.max(agilityTotal, strengthTotal) + meleeSkillBonus + combatDefenseMod;

  const toughnessTotal = (derivedStats?.toughness ?? 0) + (computedModifiers?.combatMods?.['armor-dr'] || 0);

  const totalUnreadiedOffensive = unreadiedWeapons.length + unreadiedNaturalAttacks.length + unreadiedInvocations.length;

  return (
    <div className="tab-panel active p-4 space-y-5 pb-20 w-full">
      {/* Unified Combat Command Header & Defenses Matrix */}
      <div className="bg-slate-900/90 border border-cyan-900/60 rounded-xl p-4 shadow-xl space-y-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-cyan-950 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-300">
              <Crosshair className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-cyan-300">
              Combat Systems &amp; Defenses
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {/* View Filter Pill Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-sans">
              <button
                type="button"
                onClick={() => setCombatView('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-bold ${
                  combatView === 'all'
                    ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCombatView('offensive')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-bold ${
                  combatView === 'offensive'
                    ? 'bg-amber-950 border border-amber-500/50 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚔️ Offensive ({attacks.length})
              </button>
              <button
                type="button"
                onClick={() => setCombatView('defensive')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-bold ${
                  combatView === 'defensive'
                    ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛡️ Defensive ({armors.length})
              </button>
            </div>

            {/* Vitals Snapshot */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center gap-2">
              {isSynthetic ? (
                <>
                  <span className="text-slate-500 font-bold uppercase">Structure:</span>
                  <span className="text-amber-300 font-bold">{curStructure}/{maxStructure} SP</span>
                </>
              ) : (
                <>
                  <span className="text-slate-500 font-bold uppercase">HP:</span>
                  <span className="text-rose-400 font-bold">{curHealth}/{maxHealth}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 font-bold uppercase">VIT:</span>
                  <span className="text-cyan-400 font-bold">{curVitality}/{maxVitality}</span>
                </>
              )}
            </div>

            {/* Launch Tactical Play View */}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToTactical) {
                  onSwitchToTactical();
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('folio-view-mode-change', { detail: 'play' }));
                }
              }}
              className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/80 text-cyan-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:border-cyan-400 cursor-pointer"
              title="Switch to Tactical Play View for live combat triage, wound soaking, and active checks"
            >
              <span>⚔️ Tactical View &rarr;</span>
            </button>
          </div>
        </div>

        {/* 4 Defensive Profile Cards (Hover for Formula, Click Initiative to Roll) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Initiative (Interactive Roll Trigger) */}
          <FolioTooltip
            title="Initiative Priority"
            badge="Turn Order"
            badgeColor="amber"
            description="Determines turn order in tactical combat rounds. Click to roll Initiative check."
            formula={`2d10 + Reflex (${reflexTotal >= 0 ? `+${reflexTotal}` : reflexTotal})${initiativeMod !== 0 ? ` + Mod (${initiativeMod >= 0 ? `+${initiativeMod}` : initiativeMod})` : ''}`}
          >
            <button
              type="button"
              onClick={(e) => {
                openDiceRoller({
                  label: `Initiative ${initiativeTotal >= 0 ? `+${initiativeTotal}` : initiativeTotal}`,
                  baseModifier: initiativeTotal,
                  expression: `2d10${initiativeTotal !== 0 ? (initiativeTotal > 0 ? `+${initiativeTotal}` : `${initiativeTotal}`) : ''}`,
                  rollMode: 'normal',
                  characterName: characterData['char-name'] || 'Persona',
                  personaId: characterData['character-doc-id'] || characterData.id,
                  autoRoll: e?.shiftKey || false
                });
              }}
              className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between text-left transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-amber-300 flex items-center justify-between w-full">
                <span>Initiative</span>
                <Dices className="w-3.5 h-3.5 text-amber-400" />
              </span>
              <div className="flex items-baseline justify-between mt-1 w-full">
                <span className="text-lg font-bold font-mono text-amber-300">+{initiativeTotal}</span>
                <span className="text-[10px] font-mono text-slate-500">REF {reflexTotal >= 0 ? `+${reflexTotal}` : reflexTotal}</span>
              </div>
            </button>
          </FolioTooltip>

          {/* 2. Melee Defense (Parry) */}
          <FolioTooltip
            title="Melee Defense (Parry)"
            badge="CQC Target DC"
            badgeColor="cyan"
            description="Target number opponents must meet or exceed on a 2d10 melee attack check to strike you in close combat."
            formula="10 + max(AGI, STR) + max(Melee, Unarmed, Defense) + Mod"
          >
            <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 flex flex-col justify-between transition-colors">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Melee Defense</span>
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono text-cyan-300">{meleeDefenseTotal}</span>
                <span className="text-[10px] font-mono text-slate-500">Parry</span>
              </div>
            </div>
          </FolioTooltip>

          {/* 3. Ranged Defense (Evasion) */}
          <FolioTooltip
            title="Ranged Defense (Evasion)"
            badge="Ranged Target DC"
            badgeColor="emerald"
            description="Target number opponents must meet or exceed on a 2d10 ranged attack check to hit you at distance."
            formula="10 + AGI + max(Defense, Acrobatics) + Mod"
          >
            <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between transition-colors">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Ranged Defense</span>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono text-emerald-300">{evasionTotal}</span>
                <span className="text-[10px] font-mono text-slate-500">Evasion</span>
              </div>
            </div>
          </FolioTooltip>

          {/* 4. Toughness / Soak DR */}
          <FolioTooltip
            title="Toughness & Armor Soak"
            badge="Damage Reduction"
            badgeColor="rose"
            description="Passive physical damage reduction subtracted point-for-point from incoming wound damage."
            formula="Toughness (Stamina) + Equipped Armor DR"
          >
            <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 flex flex-col justify-between transition-colors">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Toughness / DR</span>
                <Activity className="w-3.5 h-3.5 text-rose-400" />
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono text-rose-300">+{toughnessTotal}</span>
                <span className="text-[10px] font-mono text-slate-500">Soak DR</span>
              </div>
            </div>
          </FolioTooltip>
        </div>
      </div>

      {/* 1. OFFENSIVE CAPABILITIES BLOCK */}
      {(combatView === 'all' || combatView === 'offensive') && (
        <div className="bg-slate-900/70 border border-amber-900/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚔️</span>
              <div>
                <FolioTooltip
                  title="Offensive Capabilities"
                  badge="Combat Actions"
                  badgeColor="amber"
                  description="Configured weaponry, ballistic firearms, melee blades, and tactical strike options available to your persona."
                  formula="Hit Check vs Defense • Damage dice rolled on hit"
                  tags={['Weapons', 'Damage Rolls', 'Critical Hits']}
                  showInfoIcon={true}
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors cursor-help">
                    Active Offensive Capabilities
                  </h3>
                </FolioTooltip>
                <p className="text-[11px] text-slate-400">
                  Melee strikes, ballistic firearms, energy ordnance, and combat martial maneuvers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {!isSheetLocked && (
                <>
                  {onOpenSelectorModal && (
                    <button
                      type="button"
                      onClick={() => onOpenSelectorModal('weapons', 'Weaponry', 'weaponry')}
                      className="px-3 py-1.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(245,158,11,0.2)] cursor-pointer"
                      title="Open Weapons Catalog with build option"
                    >
                      <span>✨</span>
                      <span>+ Add Weapon</span>
                    </button>
                  )}
                  {totalUnreadiedOffensive > 0 && (
                    <button
                      type="button"
                      onClick={syncAllUnreadiedAttacks}
                      className="px-2.5 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                      title={`Sync ${totalUnreadiedOffensive} un-equipped weapon(s), natural attack(s), or invocation(s) into active loadout`}
                    >
                      <span>🔄</span>
                      <span>Sync Loadout (+{totalUnreadiedOffensive})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addAttack}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    title="Add empty scratch row"
                  >
                    + Quick Row
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table Column Headers */}
          {attacks.length > 0 && (
            <div className="hidden sm:grid grid-cols-12 gap-2 px-2.5 text-[10px] font-mono uppercase font-bold text-slate-400 border-b border-slate-800/80 pb-1">
              <span className="col-span-3">Weapon / Attack</span>
              <div className="col-span-2 text-center">
                <FolioTooltip title="Attack Check Score" badge="Hit Check" badgeColor="cyan" description="Attack modifier score added to 2d10 (or d20) to contest target Defense." asWrapper={false}>
                  <span className="text-cyan-400 cursor-help hover:underline">Check Score ⓘ</span>
                </FolioTooltip>
              </div>
              <div className="col-span-2 text-center">
                <FolioTooltip title="Damage Formula" badge="Dice Roll" badgeColor="amber" description="Base damage dice expression (e.g. 2d6+2, 1d10, 3d8) rolled on successful strike." asWrapper={false}>
                  <span className="text-amber-400 cursor-help hover:underline">Damage ⓘ</span>
                </FolioTooltip>
              </div>
              <span className="col-span-2">Dmg Type</span>
              <span className="col-span-1">Notes</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
          )}

          {/* Attack Table */}
          <div className="space-y-2">
            {attacks.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-800 rounded-lg space-y-2.5">
                <p>No active offensive attacks configured.</p>
                {!isSheetLocked && (
                  <div className="flex flex-wrap items-center justify-center gap-2 not-italic">
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal('weapons', 'Weaponry', 'weaponry')}
                        className="px-3 py-1 bg-amber-950/90 border border-amber-500/50 text-amber-300 hover:bg-amber-900 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        ✨ + Add Weapon from Catalog
                      </button>
                    )}
                    {totalUnreadiedOffensive > 0 && (
                      <button
                        type="button"
                        onClick={syncAllUnreadiedAttacks}
                        className="px-3 py-1 bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        🔄 Sync Loadout (+{totalUnreadiedOffensive})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addAttack}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Quick Scratch Row
                    </button>
                  </div>
                )}
              </div>
            ) : (
              attacks.map((att, idx) => {
                const isWeaponAtk = Boolean(att.weaponId || att.category === 'weapon' || isConventionalWeaponItem(att));
                const effectiveScoreStr = (!att.isManualScore && isWeaponAtk && att.name)
                  ? calculateDefaultAttackScore({ ...att, isManualScore: false }, characterData, getAttrTotal, computedModifiers)
                  : (att.score || '+0');
                return (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs hover:border-amber-900/60 transition-colors">
                {isSheetLocked ? (
                  <span className="col-span-3 text-slate-100 font-medium truncate py-1">
                    {att.name || <span className="text-slate-600 italic">Unnamed Attack</span>}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Attack / Weapon Name"
                    value={att.name || ''}
                    onChange={(e) => updateAttack(idx, 'name', e.target.value)}
                    className="col-span-3 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1.5 text-slate-100 outline-none font-medium"
                  />
                )}
                <div className="col-span-2 flex items-center gap-1">
                  {isSheetLocked ? (
                    <span className="w-full text-center text-cyan-300 font-mono font-bold text-xs">
                      {effectiveScoreStr}
                    </span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Check Score"
                      value={effectiveScoreStr}
                      onChange={(e) => updateAttack(idx, 'score', e.target.value)}
                      className="w-full text-center bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-1 py-1.5 text-cyan-300 font-mono font-bold outline-none text-xs"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      const scoreVal = parseInt(effectiveScoreStr || 0, 10) || 0;
                      openDiceRoller({
                        label: `${att.name || 'Weapon'} Strike ${scoreVal >= 0 ? `+${scoreVal}` : scoreVal}`,
                        baseModifier: scoreVal,
                        expression: `2d10${scoreVal !== 0 ? (scoreVal > 0 ? `+${scoreVal}` : `${scoreVal}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Persona',
                        personaId: characterData['character-doc-id'] || characterData.id,
                        autoRoll: e?.shiftKey || false
                      });
                    }}
                    className="p-1 bg-rose-950/90 hover:bg-rose-900 border border-rose-500/50 hover:border-rose-400 text-rose-300 rounded transition-all shrink-0 cursor-pointer"
                    title={`Check Attack (2d10 + ${effectiveScoreStr || 0}). Shift-click to quick-roll.`}
                  >
                    <Dices size={13} />
                  </button>
                </div>

                <div className="col-span-2 flex items-center gap-1">
                  {isSheetLocked ? (
                    <span className="w-full text-center text-amber-300 font-mono font-bold text-xs truncate">
                      {att.damage || '-'}
                    </span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Damage Formula"
                      value={att.damage || ''}
                      onChange={(e) => updateAttack(idx, 'damage', e.target.value)}
                      className="w-full text-center bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-1 py-1.5 text-amber-300 font-mono font-bold outline-none text-xs"
                    />
                  )}
                  {att.damage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        openDiceRoller({
                          label: `${att.name || 'Weapon'} Damage`,
                          expression: att.damage,
                          baseModifier: 0,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Persona',
                          personaId: characterData['character-doc-id'] || characterData.id,
                          autoRoll: e?.shiftKey || false
                        });
                      }}
                      className="p-1 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 rounded transition-all shrink-0 cursor-pointer"
                      title={`Roll Damage (${att.damage})`}
                    >
                      <span className="text-xs">💥</span>
                    </button>
                  )}
                </div>

                {isSheetLocked ? (
                  <span className="col-span-2 text-slate-300 text-xs truncate">
                    {att.type || '-'}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Damage Type"
                    value={att.type || ''}
                    onChange={(e) => updateAttack(idx, 'type', e.target.value)}
                    className="col-span-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-2 py-1.5 text-slate-300 outline-none"
                  />
                )}
                {isSheetLocked ? (
                  <span className="col-span-1 text-slate-400 text-xs truncate" title={att.notes}>
                    {att.notes || '-'}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Tactical Notes"
                    value={att.notes || ''}
                    onChange={(e) => updateAttack(idx, 'notes', e.target.value)}
                    className="col-span-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1.5 text-slate-400 outline-none truncate"
                  />
                )}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      const scoreVal = parseInt(effectiveScoreStr || 0, 10) || 0;
                      openDiceRoller({
                        label: `${att.name || 'Weapon'} Strike ${scoreVal >= 0 ? `+${scoreVal}` : scoreVal}`,
                        baseModifier: scoreVal,
                        expression: `2d10${scoreVal !== 0 ? (scoreVal > 0 ? `+${scoreVal}` : `${scoreVal}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Persona',
                        personaId: characterData['character-doc-id'] || characterData.id,
                        autoRoll: e?.shiftKey || false
                      });
                    }}
                    className="px-1.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded text-[10px] font-bold font-mono transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-0.5"
                    title={`Check Attack (2d10 + ${effectiveScoreStr || 0}). Shift-click to quick-roll.`}
                  >
                    <Dices size={10} className="text-rose-400" />
                    <span>Check</span>
                  </button>
                  {att.damage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        openDiceRoller({
                          label: `${att.name || 'Weapon'} Damage`,
                          expression: att.damage,
                          baseModifier: 0,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Persona',
                          personaId: characterData['character-doc-id'] || characterData.id,
                          autoRoll: e?.shiftKey || false
                        });
                      }}
                      className="px-1.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold font-mono transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-0.5"
                      title={`Roll damage formula (${att.damage})`}
                    >
                      <span>💥</span>
                      <span>Dmg</span>
                    </button>
                  )}
                  {!isSheetLocked && onOpenAssetModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAssetModal('attacks', 'Attack Weapon', 'edit', idx, att)}
                      className="text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer text-xs"
                      title="Full asset edit & DB sync"
                    >
                      ✏️
                    </button>
                  )}
                  {!isSheetLocked && (
                    <button
                      type="button"
                      onClick={() => removeAttack(idx)}
                      className="text-slate-500 hover:text-red-400 font-bold text-sm px-0.5 cursor-pointer"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
                );
              }))}
          </div>
        </div>
      )}

      {/* 2. DEFENSIVE CAPABILITIES BLOCK */}
      {(combatView === 'all' || combatView === 'defensive') && (
        <div className="bg-slate-900/70 border border-emerald-900/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <FolioTooltip
                  title="Defensive Capabilities"
                  badge="Damage Mitigation"
                  badgeColor="emerald"
                  description="Equipped armor suits, ballistic shields, kinetic force fields, and physiological resistances reducing incoming wound damage."
                  formula="Net Damage = Incoming Damage - (Armor DR + Toughness)"
                  tags={['Armor DR', 'Toughness', 'Shields']}
                  showInfoIcon={true}
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors cursor-help">
                    Active Defensive Capabilities
                  </h3>
                </FolioTooltip>
                <p className="text-[11px] text-slate-400">
                  Body armor, ballistic shields, kinetic force fields, energy screens &amp; physiological resistances
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {!isSheetLocked && (
                <>
                  {onOpenSelectorModal && (
                    <button
                      type="button"
                      onClick={() => onOpenSelectorModal('armoring', 'Armor & Defense', 'armoring')}
                      className="px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer"
                      title="Open Armor Catalog with build option"
                    >
                      <span>✨</span>
                      <span>+ Add Armor</span>
                    </button>
                  )}
                  {unreadiedArmors.length > 0 && (
                    <button
                      type="button"
                      onClick={readyAllArmors}
                      className="px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.2)] cursor-pointer"
                      title={`Ready ${unreadiedArmors.length} armor item(s) from Property Armoring`}
                    >
                      <span>🛡️</span>
                      <span>Ready from Property ({unreadiedArmors.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addArmor}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    title="Add empty scratch row"
                  >
                    + Quick Row
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table Column Headers */}
          {armors.length > 0 && (
            <div className="hidden sm:grid grid-cols-12 gap-2 px-2.5 text-[10px] font-mono uppercase font-bold text-slate-400 border-b border-slate-800/80 pb-1">
              <span className="col-span-3">Armor / Shield</span>
              <div className="col-span-2 text-center">
                <FolioTooltip title="Damage Resistance (DR)" badge="Absorption" badgeColor="emerald" description="Damage Reduction points subtracted directly from incoming damage before applying to Vitality or Health." asWrapper={false}>
                  <span className="text-emerald-400 cursor-help hover:underline">Resist / DR ⓘ</span>
                </FolioTooltip>
              </div>
              <div className="col-span-2">
                <FolioTooltip title="Armor Class & Type" badge="Classification" badgeColor="cyan" description="Armor type: Rigid Plate, Ballistic Mesh, Powered Armor, Kinetic Screen, Energy Shield, or Natural Hide." asWrapper={false}>
                  <span className="cursor-help hover:underline">Armor Type ⓘ</span>
                </FolioTooltip>
              </div>
              <div className="col-span-3">
                <FolioTooltip title="Tactical Defense Notes" badge="Properties" badgeColor="slate" description="Specialized protections such as Environmental Seals, EMP Hardening, Thermal Insulators, or Stealth Coating." asWrapper={false}>
                  <span className="cursor-help hover:underline truncate">Notes ⓘ</span>
                </FolioTooltip>
              </div>
              <span className="col-span-2 text-right">Actions</span>
            </div>
          )}

          {/* Armor Table */}
          <div className="space-y-2">
            {armors.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-800 rounded-lg space-y-2.5">
                <p>No defensive protection entries configured.</p>
                {!isSheetLocked && (
                  <div className="flex flex-wrap items-center justify-center gap-2 not-italic">
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal('armoring', 'Armor & Defense', 'armoring')}
                        className="px-3 py-1 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        ✨ + Add Armor from Catalog
                      </button>
                    )}
                    {unreadiedArmors.length > 0 && (
                      <button
                        type="button"
                        onClick={readyAllArmors}
                        className="px-3 py-1 bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        🛡️ Ready {unreadiedArmors.length} Armor(s) from Property
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addArmor}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Quick Scratch Row
                    </button>
                  </div>
                )}
              </div>
            ) : (
            armors.map((arm, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs hover:border-emerald-900/60 transition-colors">
                {isSheetLocked ? (
                  <span className="col-span-3 text-slate-100 font-medium truncate py-1">
                    {arm.name || <span className="text-slate-600 italic">Unnamed Armor</span>}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Defense / Armor Name"
                    value={arm.name || ''}
                    onChange={(e) => updateArmor(idx, 'name', e.target.value)}
                    className="col-span-3 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-2.5 py-1.5 text-slate-100 outline-none font-medium"
                  />
                )}
                {isSheetLocked ? (
                  <span className="col-span-2 text-center text-emerald-300 font-mono font-bold text-xs">
                    {arm.resistance || 0}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Resistance / DR"
                    value={arm.resistance || ''}
                    onChange={(e) => updateArmor(idx, 'resistance', e.target.value)}
                    className="col-span-2 text-center bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-1.5 py-1.5 text-emerald-300 font-mono font-bold outline-none"
                  />
                )}
                {isSheetLocked ? (
                  <span className="col-span-2 text-slate-300 text-xs truncate">
                    {arm.type || '-'}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Armor Class / Type"
                    value={arm.type || ''}
                    onChange={(e) => updateArmor(idx, 'type', e.target.value)}
                    className="col-span-2 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-2 py-1.5 text-slate-300 outline-none"
                  />
                )}
                {isSheetLocked ? (
                  <span className="col-span-3 text-slate-400 text-xs truncate" title={arm.notes}>
                    {arm.notes || '-'}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="Tactical Notes"
                    value={arm.notes || ''}
                    onChange={(e) => updateArmor(idx, 'notes', e.target.value)}
                    className="col-span-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1.5 text-slate-400 outline-none truncate"
                  />
                )}
                <div className="col-span-2 flex items-center justify-end gap-1.5">
                  {isSheetLocked ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      Equipped
                    </span>
                  ) : (
                    <>
                      {onOpenAssetModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAssetModal('armor', 'Armor & Defense', 'edit', idx, arm)}
                          className="text-slate-400 hover:text-cyan-300 p-1 cursor-pointer"
                          title="Full asset edit & DB sync"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeArmor(idx)}
                        className="text-slate-500 hover:text-red-400 font-bold text-sm px-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default React.memo(CombatTab);
