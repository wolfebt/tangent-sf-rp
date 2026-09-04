/**
 * @file ConnectedFolioTab.tsx
 * @description Connected Folio Tab for the VTT Center Split View.
 * Provides live access to the operative's vitals, quick triage, attacks,
 * core attributes, skills, and invocations.
 * Features 1-click canonical 2d10 die actions directly integrated with useDice().
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Heart, 
  Activity, 
  Crosshair, 
  Dices, 
  Sparkles, 
  Shield, 
  Zap, 
  Search,
  Flame
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { AudioService } from '../../../services/audioService';
import { DEFAULT_SKILLS } from '../../../data/skillsData';

export const ConnectedFolioTab: React.FC = () => {
  const folio = (useFolio() || {}) as any;
  const { 
    characterData, 
    derivedStats, 
    getAttrTotal,
    updateCharacterHealth,
    updateCharacterVitality
  } = folio;
  const { openDiceRoller } = useDice();

  const [activeSection, setActiveSection] = useState<'combat' | 'skills' | 'stats' | 'meta'>('combat');
  const [skillSearch, setSkillSearch] = useState('');
  const [skillCategory, setSkillCategory] = useState<'all' | 'physical' | 'mental' | 'social' | 'combat' | 'meta'>('all');

  const charName = characterData?.['char-name'] || characterData?.name || 'Operative';
  const charDocId = characterData?.['character-doc-id'] || characterData?.id || 'active-hero';
  const curHealth = parseInt(characterData?.current_health ?? characterData?.health ?? 30, 10);
  const maxHealth = parseInt(characterData?.health || 30, 10);
  const curVitality = parseInt(characterData?.current_vitality ?? characterData?.vitality ?? 30, 10);
  const maxVitality = parseInt(characterData?.vitality || 30, 10);
  const curKarma = parseInt(characterData?.karma ?? 0, 10);

  // Helper to parse arrays
  const getArray = (key: string): any[] => {
    const val = characterData?.[key];
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

  const attacks = getArray('attacks');
  const armors = getArray('armor');
  const invocations = getArray('invocations');

  // Quick healing
  const handleQuickHeal = (target: 'vitality' | 'health', amount: number) => {
    if (target === 'vitality') {
      const nextVit = Math.min(maxVitality, curVitality + amount);
      if (updateCharacterVitality) updateCharacterVitality(charDocId, nextVit);
    } else {
      const nextHp = Math.min(maxHealth, curHealth + amount);
      if (updateCharacterHealth) updateCharacterHealth(charDocId, nextHp);
    }
    AudioService.playTerminalBeep(1200, 0.05);
  };

  // Helper for numeric attribute
  const getNum = (id: string, defaultVal = 0) => parseInt(characterData?.[id] || defaultVal, 10);

  // Core Attributes Definition
  const coreAttributes = useMemo(() => [
    { name: 'Strength', code: 'STR', id: 'attr-strength', isSub: false },
    { name: 'Might', code: 'MGT', id: 'attr-might', isSub: true, primary: 'attr-strength' },
    { name: 'Agility', code: 'AGI', id: 'attr-agility', isSub: false },
    { name: 'Reflex', code: 'REF', id: 'attr-reflex', isSub: true, primary: 'attr-agility' },
    { name: 'Stamina', code: 'STA', id: 'attr-stamina', isSub: false },
    { name: 'Fortitude', code: 'FOR', id: 'attr-fortitude', isSub: true, primary: 'attr-stamina' },
    { name: 'Intellect', code: 'INT', id: 'attr-intellect', isSub: false },
    { name: 'Reason', code: 'RSN', id: 'attr-reason', isSub: true, primary: 'attr-intellect' },
    { name: 'Wisdom', code: 'WIS', id: 'attr-wisdom', isSub: false },
    { name: 'Will', code: 'WIL', id: 'attr-will', isSub: true, primary: 'attr-wisdom' },
    { name: 'Charisma', code: 'CHA', id: 'attr-charisma', isSub: false },
    { name: 'Deception', code: 'DEC', id: 'attr-deception', isSub: true, primary: 'attr-charisma' }
  ], []);

  // Skill calculations
  const getSkillRank = useCallback((skill: any) => {
    if (!skill || !characterData) return 0;
    const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
    const cleanId = sId.replace(/^[a-z]+-/, '');
    const rankVal = characterData[`skill-${sId}-rank`] ?? characterData[`skill-${cleanId}-rank`];
    return Math.min(20, Math.max(0, parseInt(rankVal, 10) || 0));
  }, [characterData]);

  const getSkillMod = useCallback((skill: any) => {
    if (!skill || !characterData) return 0;
    const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
    const cleanId = sId.replace(/^[a-z]+-/, '');
    const modVal = characterData[`skill-${sId}-mod`] ?? characterData[`skill-${cleanId}-mod`];
    return parseInt(modVal, 10) || 0;
  }, [characterData]);

  const getSkillTotal = useCallback((skill: any) => {
    const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
    const cleanId = sId.replace(/^[a-z]+-/, '');
    const rank = getSkillRank(skill);
    const mod = getSkillMod(skill);
    const baseAttrKey = characterData?.[`skill-${sId}-base`] || characterData?.[`skill-${cleanId}-base`] || (typeof skill === 'object' ? skill.baseAttr : '') || '';

    let baseAttrVal = 0;
    if (baseAttrKey) {
      const attrVal = getNum(baseAttrKey);
      const attrMod = getNum(`${baseAttrKey}-mod`);
      baseAttrVal = attrVal + attrMod;
    }

    return rank + baseAttrVal + mod;
  }, [characterData, getSkillRank, getSkillMod]);

  // Flatten skills from DEFAULT_SKILLS
  const flattenedSkills = useMemo(() => {
    const list: Array<{ id: string; name: string; group: string; total: number; rank: number; mod: number }> = [];
    Object.entries(DEFAULT_SKILLS).forEach(([groupKey, groupList]: [string, any]) => {
      if (!Array.isArray(groupList)) return;
      groupList.forEach((group: any) => {
        if (!Array.isArray(group.skills)) return;
        group.skills.forEach((s: any) => {
          list.push({
            id: s.id,
            name: s.name,
            group: groupKey,
            rank: getSkillRank(s),
            mod: getSkillMod(s),
            total: getSkillTotal(s)
          });
        });
      });
    });
    return list;
  }, [getSkillRank, getSkillMod, getSkillTotal]);

  const filteredSkills = useMemo(() => {
    return flattenedSkills.filter(s => {
      if (skillCategory !== 'all' && s.group !== skillCategory) return false;
      if (skillSearch.trim()) {
        return s.name.toLowerCase().includes(skillSearch.trim().toLowerCase());
      }
      return true;
    });
  }, [flattenedSkills, skillCategory, skillSearch]);

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-200 text-xs overflow-hidden select-none">
      {/* Operative Header Bar */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-cyan-300 font-mono truncate max-w-[180px]">
              {charName}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
              {characterData?.archetype || 'Operative'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {characterData?.species || 'Human'} &bull; Karma: <span className="text-amber-400 font-bold">{curKarma}</span>
          </div>
        </div>

        {/* Section Pill Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveSection('combat')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeSection === 'combat' ? 'bg-amber-950 border border-amber-500/50 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Combat Attacks & Defenses"
          >
            <Crosshair size={12} />
            <span>Combat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('skills')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeSection === 'skills' ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Trained Skills"
          >
            <Sparkles size={12} />
            <span>Skills</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('stats')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeSection === 'stats' ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Core Attributes & Saves"
          >
            <Shield size={12} />
            <span>Stats</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('meta')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeSection === 'meta' ? 'bg-purple-950 border border-purple-500/50 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Essence Invocations"
          >
            <Zap size={12} />
            <span>Meta</span>
          </button>
        </div>
      </div>

      {/* Vitals Telemetry Header */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-[#080d1a] border-b border-slate-800/80 shrink-0">
        {/* Health */}
        <div className="p-2 rounded-lg bg-slate-950/80 border border-rose-950/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
              <Heart size={11} />
              <span>Health</span>
            </div>
            <div className="text-base font-mono font-bold text-rose-300 mt-0.5">
              {curHealth} <span className="text-[10px] text-slate-500 font-normal">/ {maxHealth}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleQuickHeal('health', 5)}
              className="px-1.5 py-0.5 bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded text-[10px] font-mono cursor-pointer"
              title="Heal +5 Health"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleQuickHeal('health', maxHealth)}
              className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] font-mono cursor-pointer"
              title="Max Health"
            >
              Max
            </button>
          </div>
        </div>

        {/* Vitality */}
        <div className="p-2 rounded-lg bg-slate-950/80 border border-cyan-950/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
              <Activity size={11} />
              <span>Vitality</span>
            </div>
            <div className="text-base font-mono font-bold text-cyan-300 mt-0.5">
              {curVitality} <span className="text-[10px] text-slate-500 font-normal">/ {maxVitality}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleQuickHeal('vitality', 5)}
              className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 rounded text-[10px] font-mono cursor-pointer"
              title="Heal +5 Vitality"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleQuickHeal('vitality', maxVitality)}
              className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] font-mono cursor-pointer"
              title="Max Vitality"
            >
              Max
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {/* ================================================================= */}
        {/* 1. COMBAT SECTION (Attacks & Defenses)                            */}
        {/* ================================================================= */}
        {activeSection === 'combat' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-between">
              <span>Configured Weapon Attacks ({attacks.length})</span>
            </div>

            {attacks.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg">
                No attacks configured in operative folio.
              </div>
            ) : (
              <div className="space-y-1.5">
                {attacks.map((att: any, idx: number) => {
                  const scoreVal = parseInt(att.score || 0, 10);
                  const dmgExpr = att.damage || '1d10';
                  return (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-100 truncate text-xs flex items-center gap-1.5">
                          <span>{att.name || `Weapon #${idx + 1}`}</span>
                          {att.type && (
                            <span className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                              {att.type}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Score: <span className="text-cyan-300 font-bold">+{scoreVal}</span> &bull; Dmg: <span className="text-amber-300 font-bold">{dmgExpr}</span>
                        </div>
                      </div>

                      {/* Interactive Die Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Strike Roll Check */}
                        <button
                          type="button"
                          onClick={() => {
                            openDiceRoller({
                              label: `${att.name || 'Weapon'} Strike Check`,
                              baseModifier: scoreVal,
                              expression: `2d10${scoreVal !== 0 ? (scoreVal > 0 ? `+${scoreVal}` : `${scoreVal}`) : ''}`,
                              rollMode: 'normal',
                              characterName: charName,
                              autoRoll: true
                            });
                          }}
                          className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white font-mono font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Roll Strike Check (2d10 + ${scoreVal})`}
                        >
                          <Dices size={11} className="text-cyan-400" />
                          <span>Strike (+{scoreVal})</span>
                        </button>

                        {/* Damage Roll Check */}
                        <button
                          type="button"
                          onClick={() => {
                            openDiceRoller({
                              label: `${att.name || 'Weapon'} Damage`,
                              expression: dmgExpr,
                              rollMode: 'normal',
                              characterName: charName,
                              autoRoll: true
                            });
                          }}
                          className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 hover:text-white font-mono font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Roll Weapon Damage (${dmgExpr})`}
                        >
                          <Flame size={11} className="text-amber-400" />
                          <span>Dmg ({dmgExpr})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Armor Carapaces */}
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold pt-2 flex items-center justify-between">
              <span>Armor Defenses & Toughness</span>
              <span className="text-slate-400 text-[10px]">Toughness: +{derivedStats?.toughness ?? 0}</span>
            </div>

            {armors.length === 0 ? (
              <div className="p-3 text-center text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg text-[11px]">
                No armor entries configured. Toughness base applies.
              </div>
            ) : (
              <div className="space-y-1">
                {armors.map((arm: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950/50 border border-slate-855 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-medium text-slate-300">{arm.name || 'Armor Carapace'}</span>
                    <span className="font-mono text-emerald-400 font-bold">DR {arm.resistance || arm.dr || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. SKILLS SECTION                                                 */}
        {/* ================================================================= */}
        {activeSection === 'skills' && (
          <div className="space-y-2">
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500/60 font-mono"
                />
              </div>

              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-mono outline-none cursor-pointer"
              >
                <option value="all">All ({flattenedSkills.length})</option>
                <option value="physical">Physical</option>
                <option value="mental">Mental</option>
                <option value="social">Social</option>
                <option value="combat">Combat</option>
                <option value="meta">Metafocus</option>
              </select>
            </div>

            {/* Skills Table List */}
            <div className="space-y-1">
              {filteredSkills.map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-855 hover:border-slate-700 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-200 truncate">{s.name}</div>
                    <div className="text-[9.5px] font-mono text-slate-500">
                      Rank {s.rank} &bull; Mod {s.mod >= 0 ? `+${s.mod}` : s.mod} &bull; {s.group}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-cyan-300 font-bold text-xs">{s.total}</span>
                    <button
                      type="button"
                      onClick={() => {
                        openDiceRoller({
                          label: `${s.name} Check`,
                          baseModifier: s.total,
                          expression: `2d10${s.total !== 0 ? (s.total > 0 ? `+${s.total}` : `${s.total}`) : ''}`,
                          rollMode: 'normal',
                          characterName: charName,
                          autoRoll: true
                        });
                      }}
                      className="p-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                      title={`Roll ${s.name} Check (2d10 + ${s.total})`}
                    >
                      <Dices size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. STATS & ATTRIBUTES SECTION                                     */}
        {/* ================================================================= */}
        {activeSection === 'stats' && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Core Attributes & Saving Throws
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {coreAttributes.map((attr) => {
                const total = typeof getAttrTotal === 'function' ? getAttrTotal(attr.id) : 0;
                return (
                  <div
                    key={attr.id}
                    className={`p-2 rounded-lg border transition-colors flex items-center justify-between ${
                      attr.isSub 
                        ? 'bg-slate-950/40 border-slate-900 ml-2' 
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${attr.isSub ? 'text-slate-400 text-[11px]' : 'text-slate-200 font-bold'}`}>
                        {attr.name}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">{attr.code}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold ${attr.isSub ? 'text-amber-400' : 'text-cyan-300'}`}>
                        {total >= 0 ? `+${total}` : total}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          openDiceRoller({
                            label: `${attr.name} (${attr.code}) Check`,
                            baseModifier: total,
                            expression: `2d10${total !== 0 ? (total > 0 ? `+${total}` : `${total}`) : ''}`,
                            rollMode: 'normal',
                            characterName: charName,
                            autoRoll: true
                          });
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          attr.isSub
                            ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300'
                            : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300'
                        }`}
                        title={`Roll ${attr.name} Check (2d10 + ${total})`}
                      >
                        <Dices size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. METAPHYSICS & INVOCATIONS SECTION                              */}
        {/* ================================================================= */}
        {activeSection === 'meta' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center justify-between">
              <span>Essence Invocations ({invocations.length})</span>
            </div>

            {invocations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg">
                No Essence Invocations learned by this operative.
              </div>
            ) : (
              <div className="space-y-1.5">
                {invocations.map((inv: any, idx: number) => {
                  const invName = inv.name || inv.title || `Invocation #${idx + 1}`;
                  const rank = inv.rank || 1;
                  const dc = inv.baseDC || 15;
                  const disc = inv.discipline || 'Essence';
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-purple-950/60 hover:border-purple-500/50 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-purple-300 text-xs truncate flex items-center gap-1.5">
                          <span>{invName}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-400">
                            {disc}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Rank: {rank} &bull; Target DC: {dc}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          openDiceRoller({
                            label: `${invName} Invocation Check`,
                            targetNumber: dc,
                            expression: '2d10',
                            rollMode: 'normal',
                            characterName: charName,
                            autoRoll: true
                          });
                        }}
                        className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-white font-mono font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        title={`Cast ${invName} (DC ${dc})`}
                      >
                        <Zap size={11} className="text-purple-400" />
                        <span>Cast (DC {dc})</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
