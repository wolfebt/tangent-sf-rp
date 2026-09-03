import React, { useState } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { Crosshair, Shield, Plus, Dices, Sparkles, X, Zap } from 'lucide-react';
import FolioTooltip from '../shared/FolioTooltip';

export const CombatTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField, derivedStats, getAttrTotal } = useFolio();
  const { openDiceRoller } = useDice();

  const [combatView, setCombatView] = useState('all'); // 'all' | 'offensive' | 'defensive'
  const [latestDamageRoll, setLatestDamageRoll] = useState(null);

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

  // Attacks list
  const attacks = getArray('attacks');
  const addAttack = () => {
    const newAttacks = [...attacks, { name: '', score: '', damage: '', type: '', notes: '' }];
    updateField('attacks', newAttacks);
  };

  const updateAttack = (index, field, value) => {
    const updated = [...attacks];
    updated[index] = { ...updated[index], [field]: value };
    updateField('attacks', updated);
  };

  const removeAttack = (index) => {
    const atkName = attacks[index]?.name || 'Attack';
    if (!confirmTypedDeletion(atkName, 'attack')) return;
    updateField('attacks', attacks.filter((_, i) => i !== index));
  };

  // Armor & Defense list
  const armors = getArray('armor');
  const addArmor = () => {
    const newArmors = [...armors, { name: '', resistance: '', type: '', notes: '' }];
    updateField('armor', newArmors);
  };

  const updateArmor = (index, field, value) => {
    const updated = [...armors];
    updated[index] = { ...updated[index], [field]: value };
    updateField('armor', updated);
  };

  const removeArmor = (index) => {
    const armorName = armors[index]?.name || 'Armor';
    if (!confirmTypedDeletion(armorName, 'defense entry')) return;
    updateField('armor', armors.filter((_, i) => i !== index));
  };

  const reflexTotal = getAttrTotal('attr-reflex');
  const initiativeMod = parseInt(characterData['initiative-mod'] || 0, 10);
  const initiativeTotal = reflexTotal + initiativeMod;

  return (
    <div className="tab-panel active p-4 space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header & Quick Telemetry */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Crosshair size={18} />
            </span>
            Active Combat Systems
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive offensive weaponry, tactical strikes, defensive armor carapaces &amp; resistance envelopes
          </p>
        </div>

        {/* Combat Status Telemetry Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-cyan-900 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Initiative:</span>
            <span className="text-amber-400 font-bold text-sm">+{initiativeTotal}</span>
          </div>
          <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-900 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Toughness:</span>
            <span className="text-emerald-300 font-bold text-sm">+{derivedStats?.toughness ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Latest Damage Roll Feedback Banner */}
      {latestDamageRoll && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all select-none shadow-lg ${
          latestDamageRoll.isCritSuccess 
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            : latestDamageRoll.isCritFail
            ? 'bg-red-500/20 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'bg-slate-900/95 border-cyan-500/50 text-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold font-mono text-cyan-300 flex items-center gap-1.5">
              <span>🎲</span> {latestDamageRoll.total}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>{latestDamageRoll.label}</span>
                <span className="font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30 text-[10px]">
                  {latestDamageRoll.expression}
                </span>
                {latestDamageRoll.isCritSuccess && (
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider animate-pulse">
                    ⚡ CRITICAL HIT!
                  </span>
                )}
                {latestDamageRoll.isCritFail && (
                  <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">
                    💀 CRITICAL MISS!
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Rolls: [{latestDamageRoll.rolls.map(r => r.value).join(', ')}] {latestDamageRoll.modifier !== 0 ? (latestDamageRoll.modifier > 0 ? `+ ${latestDamageRoll.modifier}` : `${latestDamageRoll.modifier}`) : ''}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLatestDamageRoll(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
            title="Dismiss Roll"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. OFFENSIVE CAPABILITIES BLOCK */}
      <div className="bg-slate-900/70 border border-amber-900/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <div>
              <FolioTooltip
                title="Offensive Capabilities"
                badge="Combat Actions"
                badgeColor="amber"
                description="Configured weaponry, ballistic firearms, melee blades, and tactical strike options available to your operative."
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

          <div className="flex items-center gap-2 shrink-0">
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
            <button
              type="button"
              onClick={addAttack}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Add empty scratch row"
            >
              + Quick Row
            </button>
          </div>
        </div>

        {/* Table Column Headers */}
        {attacks.length > 0 && (
          <div className="hidden sm:grid grid-cols-12 gap-2 px-2.5 text-[10px] font-mono uppercase font-bold text-slate-400 border-b border-slate-800/80 pb-1">
            <span className="col-span-3">Weapon / Attack</span>
            <div className="col-span-2 text-center">
              <FolioTooltip title="Attack Check Score" badge="Hit Check" badgeColor="cyan" description="Governing combat skill + base attribute + situational modifiers rolled vs target defense." asWrapper={false}>
                <span className="text-cyan-400 cursor-help hover:underline">Check Score ⓘ</span>
              </FolioTooltip>
            </div>
            <div className="col-span-2 text-center">
              <FolioTooltip title="Damage Formula" badge="Dice Roll" badgeColor="amber" description="Dice notation rolled upon hitting the target (e.g. 2d6+3, 1d10). Click the roll button to test." asWrapper={false}>
                <span className="text-amber-400 cursor-help hover:underline">Damage ⓘ</span>
              </FolioTooltip>
            </div>
            <div className="col-span-2">
              <FolioTooltip title="Damage Type" badge="Category" badgeColor="rose" description="Damage category (Kinetic, Ballistic, Energy, Plasma, Metaphysical, Sonic, Thermal, Cryo) matched against armor resistances." asWrapper={false}>
                <span className="cursor-help hover:underline">Type ⓘ</span>
              </FolioTooltip>
            </div>
            <div className="col-span-1">
              <FolioTooltip title="Tactical Weapon Notes" badge="Properties" badgeColor="slate" description="Weapon traits such as Armor Piercing (AP), Burst Fire, Reach, Autofire, Stun, or Range increments." asWrapper={false}>
                <span className="cursor-help hover:underline truncate">Notes ⓘ</span>
              </FolioTooltip>
            </div>
            <span className="col-span-2 text-right">Actions</span>
          </div>
        )}

        {/* Attacks Table */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {attacks.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No offensive attack entries configured. Click "+ Add Weapon" to browse catalog or "+ Quick Row" to create custom attacks.
            </div>
          ) : (
            attacks.map((att, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs hover:border-amber-900/60 transition-colors">
                <input
                  type="text"
                  placeholder="Attack / Weapon Name"
                  value={att.name || ''}
                  onChange={(e) => updateAttack(idx, 'name', e.target.value)}
                  className="col-span-3 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1.5 text-slate-100 outline-none font-medium"
                />
                <div className="col-span-2 flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Check Score"
                    value={att.score || ''}
                    onChange={(e) => updateAttack(idx, 'score', e.target.value)}
                    className="w-full text-center bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-1 py-1.5 text-cyan-300 font-mono font-bold outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const scoreVal = parseInt(att.score || 0, 10);
                      openDiceRoller({
                        label: `${att.name || 'Weapon'} Attack Check`,
                        baseModifier: scoreVal,
                        expression: `2d10${scoreVal !== 0 ? (scoreVal > 0 ? `+${scoreVal}` : `${scoreVal}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative'
                      });
                    }}
                    className="p-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 rounded transition-all shrink-0 cursor-pointer"
                    title={`Roll Attack Check (2d10 + ${att.score || 0})`}
                  >
                    <Dices size={13} />
                  </button>
                </div>

                <div className="col-span-2 flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Damage Formula"
                    value={att.damage || ''}
                    onChange={(e) => updateAttack(idx, 'damage', e.target.value)}
                    className="w-full text-center bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-1 py-1.5 text-amber-300 font-mono font-bold outline-none text-xs"
                  />
                  {att.damage && (
                    <button
                      type="button"
                      onClick={() => {
                        openDiceRoller({
                          label: `${att.name || 'Weapon'} Damage`,
                          expression: att.damage,
                          baseModifier: 0,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Operative'
                        });
                      }}
                      className="p-1 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 rounded transition-all shrink-0 cursor-pointer"
                      title={`Roll Damage (${att.damage})`}
                    >
                      <span className="text-xs">💥</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Damage Type"
                  value={att.type || ''}
                  onChange={(e) => updateAttack(idx, 'type', e.target.value)}
                  className="col-span-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-2 py-1.5 text-slate-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Tactical Notes"
                  value={att.notes || ''}
                  onChange={(e) => updateAttack(idx, 'notes', e.target.value)}
                  className="col-span-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1.5 text-slate-400 outline-none truncate"
                />
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const scoreVal = parseInt(att.score || 0, 10);
                      openDiceRoller({
                        label: `${att.name || 'Weapon'} Attack Check`,
                        baseModifier: scoreVal,
                        expression: `2d10${scoreVal !== 0 ? (scoreVal > 0 ? `+${scoreVal}` : `${scoreVal}`) : ''}`,
                        rollMode: 'normal',
                        characterName: characterData['char-name'] || 'Operative'
                      });
                    }}
                    className="px-1.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[10px] font-bold font-mono transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-0.5"
                    title={`Roll Attack Check (2d10 + ${att.score || 0})`}
                  >
                    <Dices size={10} className="text-cyan-400" />
                    <span>Check</span>
                  </button>
                  {att.damage && (
                    <button
                      type="button"
                      onClick={() => {
                        openDiceRoller({
                          label: `${att.name || 'Weapon'} Damage`,
                          expression: att.damage,
                          baseModifier: 0,
                          rollMode: 'normal',
                          characterName: characterData['char-name'] || 'Operative'
                        });
                      }}
                      className="px-1.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold font-mono transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-0.5"
                      title={`Roll damage formula (${att.damage})`}
                    >
                      <span>💥</span>
                      <span>Dmg</span>
                    </button>
                  )}
                  {onOpenAssetModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAssetModal('attacks', 'Attack Weapon', 'edit', idx, att)}
                      className="text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer text-xs"
                      title="Full asset edit & DB sync"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttack(idx)}
                    className="text-slate-500 hover:text-red-400 font-bold text-sm px-0.5 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. DEFENSIVE CAPABILITIES BLOCK */}
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

          <div className="flex items-center gap-2 shrink-0">
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
            <button
              type="button"
              onClick={addArmor}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Add empty scratch row"
            >
              + Quick Row
            </button>
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
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {armors.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No defensive protection entries configured. Click "+ Add Armor" to browse catalog or "+ Quick Row" to create custom defenses.
            </div>
          ) : (
            armors.map((arm, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs hover:border-emerald-900/60 transition-colors">
                <input
                  type="text"
                  placeholder="Defense / Armor Name"
                  value={arm.name || ''}
                  onChange={(e) => updateArmor(idx, 'name', e.target.value)}
                  className="col-span-3 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-2.5 py-1.5 text-slate-100 outline-none font-medium"
                />
                <input
                  type="text"
                  placeholder="Resistance / DR"
                  value={arm.resistance || ''}
                  onChange={(e) => updateArmor(idx, 'resistance', e.target.value)}
                  className="col-span-2 text-center bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-1.5 py-1.5 text-emerald-300 font-mono font-bold outline-none"
                />
                <input
                  type="text"
                  placeholder="Armor Class / Type"
                  value={arm.type || ''}
                  onChange={(e) => updateArmor(idx, 'type', e.target.value)}
                  className="col-span-2 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-2 py-1.5 text-slate-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Tactical Notes"
                  value={arm.notes || ''}
                  onChange={(e) => updateArmor(idx, 'notes', e.target.value)}
                  className="col-span-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1.5 text-slate-400 outline-none truncate"
                />
                <div className="col-span-2 flex items-center justify-end gap-1.5">
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CombatTab);
