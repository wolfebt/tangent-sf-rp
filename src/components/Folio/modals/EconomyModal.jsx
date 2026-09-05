import React, { useState, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { EXPERIENCE_RULES } from '../../../engines/tangentConstants';
import {
  AttributePoolPulldown,
  FeatureMultiselectPulldown,
  TraitMultiselectPulldown,
  SkillPoolRankPulldown
} from '../shared/IdentityPoolPulldown';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { DEFAULT_FEATURES } from '../../../data/featuresData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { COMMON_OCCUPATIONAL_TRAITS } from '../../../data/occupationsData';
import { resolveCatalogItem } from '../../../engines/tangentIdentityEngine';
import { BookOpen, Shield, Dna, Layers, Sparkles } from 'lucide-react';

const extractNameList = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(item => {
    if (typeof item === 'object' && item !== null) {
      return item.name || item.title || item.skill || item.id || '';
    }
    return String(item);
  }).filter(Boolean);
};

const normalizeTraitName = (trait) => {
  if (!trait) return '';
  const raw = typeof trait === 'object' ? (trait.name || trait.title || trait.id || '') : String(trait);
  const cleaned = raw.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
  return cleaned.replace(/\b\w/g, c => c.toUpperCase());
};

const EconomyModal = ({ isOpen, onClose, characterData, updateField, economyBreakdown }) => {
  const [activeTab, setActiveTab] = useState('pools'); // 'pools' | 'itemized' | 'experience'
  const {
    awardExperience,
    payExperienceDebt,
    allocatePoolSkillRank,
    togglePoolTrait,
    removePoolTrait,
    togglePoolFeature,
    removePoolFeature,
    allocatePoolAttribute
  } = useFolio();

  // Experience Award Form State
  const [awardAmount, setAwardAmount] = useState(5);
  const [awardCategory, setAwardCategory] = useState('Campaign Progress');
  const [awardReason, setAwardReason] = useState('Mission Milestone');
  const [awardNotes, setAwardNotes] = useState('');
  const [sessionNum, setSessionNum] = useState('');
  const [autoPayDebt, setAutoPayDebt] = useState(true);

  // Resolved identity catalog objects
  const { dbData } = economyBreakdown || {};

  const speciesObj = useMemo(() => {
    return resolveCatalogItem('species', characterData?.['char-species'], dbData) || 
      (dbData?.species || DEFAULT_SPECIES).find(s => (s.name || s.id || '').toLowerCase() === (characterData?.['char-species'] || '').toLowerCase());
  }, [characterData?.['char-species'], dbData]);

  const originObj = useMemo(() => {
    return resolveCatalogItem('origins', characterData?.['char-origin'], dbData) || 
      (dbData?.origins || []).find(o => (o.name || o.id || '').toLowerCase() === (characterData?.['char-origin'] || '').toLowerCase());
  }, [characterData?.['char-origin'], dbData]);

  const secondaryOriginObj = useMemo(() => {
    const secName = characterData?.['char-secondary-origin'] || characterData?.['char-origin-secondary'];
    if (!secName) return null;
    return resolveCatalogItem('origins', secName, dbData) || 
      (dbData?.origins || []).find(o => (o.name || o.id || '').toLowerCase() === String(secName).toLowerCase());
  }, [characterData?.['char-secondary-origin'], characterData?.['char-origin-secondary'], dbData]);

  const occuObj = useMemo(() => {
    return resolveCatalogItem('occupations', characterData?.['char-occu'], dbData) || 
      (dbData?.occupations || []).find(oc => (oc.name || oc.id || '').toLowerCase() === (characterData?.['char-occu'] || '').toLowerCase());
  }, [characterData?.['char-occu'], dbData]);

  const secondaryOccuObj = useMemo(() => {
    const secOccName = characterData?.['char-secondary-occu'] || characterData?.['char-background-occu'] || characterData?.['char-occu-secondary'];
    if (!secOccName) return null;
    return resolveCatalogItem('occupations', secOccName, dbData) || 
      (dbData?.occupations || []).find(oc => (oc.name || oc.id || '').toLowerCase() === String(secOccName).toLowerCase());
  }, [characterData?.['char-secondary-occu'], characterData?.['char-background-occu'], characterData?.['char-occu-secondary'], dbData]);

  const factionObj = useMemo(() => {
    return resolveCatalogItem('factions', characterData?.['char-faction'], dbData) || 
      (dbData?.factions || DEFAULT_FACTIONS).find(f => (f.name || f.id || '').toLowerCase() === (characterData?.['char-faction'] || '').toLowerCase());
  }, [characterData?.['char-faction'], dbData]);

  const allTraitsMerged = useMemo(() => {
    const map = new Map();
    ALL_CANONICAL_TRAITS.forEach(t => {
      const idKey = (t.id || '').toLowerCase();
      const normKey = normalizeTraitName(t.name || t.title || '').toLowerCase();
      if (idKey) map.set(idKey, t);
      if (normKey) map.set(normKey, t);
    });
    const extraTraits = [...(dbData?.traits || []), ...(dbData?.trait || [])];
    extraTraits.forEach(t => {
      if (!t) return;
      const idKey = (t.id || '').toLowerCase();
      const normKey = normalizeTraitName(t.name || t.title || '').toLowerCase();
      const merged = { ...(map.get(idKey) || map.get(normKey) || {}), ...t };
      if (idKey) map.set(idKey, merged);
      if (normKey) map.set(normKey, merged);
    });
    return Array.from(new Set(map.values()));
  }, [dbData?.traits, dbData?.trait]);

  if (!isOpen || !economyBreakdown) return null;

  const {
    startingCP = 150,
    earnedAP = 0,
    totalBudget = startingCP + earnedAP,
    spentCP = 0,
    remainingCP = totalBudget - spentCP,
    availableAP = 0,
    experienceDebt = 0,
    identityPools = {},
    itemizedList = [],
    experienceAwards = []
  } = economyBreakdown;

  // Identity pool categories to render
  const identityCategories = [
    { key: 'occupation', label: 'Occupation', data: identityPools.occupation },
    { key: 'origin', label: 'Origin', data: identityPools.origin },
    { key: 'faction', label: 'Faction', data: identityPools.faction },
    { key: 'species', label: 'Species', data: identityPools.species }
  ];

  const isOver = spentCP > totalBudget;

  const handleApplyPreset = (category, amount, reason) => {
    setAwardCategory(category);
    setAwardAmount(amount);
    setAwardReason(reason);
  };

  const handleGrantAward = async (e) => {
    e.preventDefault();
    if (!awardExperience) return;
    const heroId = characterData['character-doc-id'] || characterData.id;
    await awardExperience(heroId, {
      amount: parseInt(awardAmount, 10) || 1,
      category: awardCategory,
      reason: awardReason,
      notes: awardNotes,
      sessionNumber: sessionNum ? parseInt(sessionNum, 10) : undefined,
      autoPayDebt: Boolean(autoPayDebt)
    });
    setAwardNotes('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 md:p-6 pt-10 sm:pt-14 md:pt-16 pb-12 overflow-y-auto select-none font-sans">
      <div className={`bg-[#121824] border rounded-xl max-w-5xl w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-6 flex flex-col max-h-[85vh] sm:max-h-[88vh] ${isOver ? 'border-red-500/80 ring-2 ring-red-500/60' : 'border-cyan-500/60'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>💎</span> Character Point &amp; Award Point Economy
            </h3>
            {isOver && (
              <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-500/80 rounded text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                Over Budget
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold leading-none transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Over-Budget Alert Banner */}
        {isOver && (
          <div className="bg-red-950/90 border border-red-500/80 rounded-lg p-3 flex items-center justify-between text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-red-300">
                  OVER BUDGET ALERT (-{Math.abs(remainingCP)} CP DEFICIT)
                </span>
                <span className="text-[11px] text-red-200/90">
                  Character point expenditure ({spentCP} CP) exceeds effective budget ({totalBudget} CP = {startingCP} CP + {earnedAP} AP).
                </span>
              </div>
            </div>
            <span className="px-2 py-1 bg-red-900/90 border border-red-400 text-red-100 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
              Illegal Sheet
            </span>
          </div>
        )}

        {/* CP & AP Overview Summary Cards (Counters) */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-slate-900/90 p-3.5 rounded-lg border ${isOver ? 'border-red-500/70 ring-1 ring-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-800'}`}>
          <div className="flex flex-col">
            <label className="text-[9.5px] uppercase font-bold text-slate-400 mb-1">
              Starting CP (Creation)
            </label>
            <input
              type="number"
              step="5"
              value={startingCP}
              onChange={(e) => updateField('starting-cp', parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded text-center py-1 text-sm font-mono font-bold text-cyan-300 outline-none"
              title="Base character creation Character Points (Standard 150 CP)"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 mb-1">
              Campaign AP (+Earned)
            </span>
            <span className="text-lg font-bold font-mono py-1 text-emerald-400">
              +{earnedAP} AP
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 mb-1">
              Spent Points
            </span>
            <span className={`text-lg font-bold font-mono py-1 ${isOver ? 'text-red-400' : 'text-amber-400'}`}>
              {spentCP} / {totalBudget} CP
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 mb-1">
              Remaining Budget
            </span>
            <span className={`text-lg font-bold font-mono py-1 ${remainingCP >= 0 ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>
              {remainingCP} CP
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'experience'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎖️</span> Advancement Points (AP) ({earnedAP} AP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pools')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pools'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🧩</span> Identity Point Pools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itemized')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'itemized'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Itemized Expenditures ({itemizedList.length})
          </button>
        </div>

        {/* TAB 1: ADVANCEMENT POINTS (AP) */}
        {activeTab === 'experience' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            
            {/* The Increment Rule (CRITICAL) Callout Banner */}
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                <span>⚠️</span> The Increment Rule (CRITICAL CANON RULE)
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed">
                <strong>Exchange Rate:</strong> 1 Advancement Point (AP) = 1 Character Point (CP). Points are spent exactly like CP during creation, except that <strong className="text-amber-200">abilities, skills, or other traits may ONLY have a 1-point increment of any score per advancement award event</strong>. A player cannot dump 10 AP into a single skill instantly.
              </p>
            </div>

            {/* Advancement Debt Banner (If Active) */}
            {experienceDebt > 0 && (
              <div className="bg-rose-950/50 border border-rose-500/60 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-rose-200 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💀</span>
                  <div>
                    <div className="text-xs font-bold font-mono uppercase text-rose-300 flex items-center gap-2">
                      <span>Advancement Debt Active</span>
                      <span className="bg-rose-900 border border-rose-500 px-1.5 py-0.2 rounded font-black text-rose-100">
                        -{experienceDebt} AP
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Revivification trauma. Settled 1-for-1 from future AP awards or trait reductions.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => payExperienceDebt(characterData['character-doc-id'] || characterData.id, 1)}
                    className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 border border-rose-500 text-rose-100 rounded text-xs font-bold uppercase cursor-pointer transition-colors"
                  >
                    Pay 1 AP Debt
                  </button>
                  <button
                    type="button"
                    onClick={() => payExperienceDebt(characterData['character-doc-id'] || characterData.id, experienceDebt)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded text-xs font-bold uppercase cursor-pointer transition-colors"
                  >
                    Clear All Debt
                  </button>
                </div>
              </div>
            )}

            {/* Award Advancement Points Tool (GM & Session Award Panel) */}
            <div className="bg-slate-950/80 border border-cyan-900/60 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span>🎖️</span> Award Advancement Points (GM Tool)
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  Pacing: 1-3 AP / session • 5-10 AP / chapter
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Quick Award Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('story', 7, 'Chapter Completion (Complex Arc & Downtime)')}
                    className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 rounded text-[11px] text-cyan-300 font-mono cursor-pointer transition-colors"
                  >
                    📖 Chapter Completion (+7 AP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('story', 2, 'Overcoming Major Villain / Plot Climax')}
                    className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 rounded text-[11px] text-cyan-300 font-mono cursor-pointer transition-colors"
                  >
                    ⚔️ Overcame Villain (+2 AP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('session', 2, 'Standard Session: Tactical Focus (+1) & Roleplaying (+1)')}
                    className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 rounded text-[11px] text-emerald-300 font-mono cursor-pointer transition-colors"
                  >
                    🎲 Standard Session (+2 AP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('session', 1, 'Exceptional In-Character Roleplay Interaction')}
                    className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 rounded text-[11px] text-emerald-300 font-mono cursor-pointer transition-colors"
                  >
                    🎭 Roleplaying (+1 AP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('epic', 5, 'Epic Action & Stumping the Architect (Saved Plot)')}
                    className="px-2 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-700/50 rounded text-[11px] text-purple-300 font-mono cursor-pointer transition-colors"
                  >
                    ⚡ Stumped Architect (+5 AP)
                  </button>
                </div>
              </div>

              {/* Award Form */}
              <form onSubmit={handleGrantAward} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
                <div className="sm:col-span-3 flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    AP Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-sm font-mono font-bold text-emerald-300 outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-4 flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={awardCategory}
                    onChange={(e) => setAwardCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-xs text-slate-200 outline-none h-[30px]"
                  >
                    <option value="session">Session Award (0-3 AP)</option>
                    <option value="story">Story / Chapter Award (5-10 AP)</option>
                    <option value="epic">Epic / Ad Hoc Award (1-5 AP)</option>
                    <option value="custom">Custom Award</option>
                  </select>
                </div>

                <div className="sm:col-span-5 flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Session # (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={sessionNum}
                    onChange={(e) => setSessionNum(e.target.value)}
                    className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>

                <div className="sm:col-span-12 flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Reason &amp; Narrative Achievement
                  </label>
                  <input
                    type="text"
                    value={awardReason}
                    onChange={(e) => setAwardReason(e.target.value)}
                    placeholder="e.g. Completed Chapter 1; defeated the Dread-Commander"
                    className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2.5 py-1 text-xs text-slate-200 outline-none"
                    required
                  />
                </div>

                {experienceDebt > 0 && (
                  <div className="sm:col-span-12 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="autoPayDebt"
                      checked={autoPayDebt}
                      onChange={(e) => setAutoPayDebt(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                    />
                    <label htmlFor="autoPayDebt" className="text-xs text-rose-300 font-medium">
                      Automatically dedicate up to {experienceDebt} AP from this award to settle active Experience Debt
                    </label>
                  </div>
                )}

                <div className="sm:col-span-12 flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400 rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>➕</span> Grant Experience Award (+{awardAmount} AP)
                  </button>
                </div>
              </form>
            </div>

            {/* Experience Awards Ledger / History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Award History Ledger ({experienceAwards.length})</span>
                <span className="text-[10px] font-mono text-emerald-400 font-normal">
                  Lifetime Earned: +{earnedAP} AP
                </span>
              </h4>

              <div className="bg-slate-950/80 border border-slate-800 rounded divide-y divide-slate-800/70 max-h-60 overflow-y-auto text-xs">
                {experienceAwards.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 italic">
                    No experience awards logged yet. Use the tool above to grant session, story, or epic AP!
                  </div>
                ) : (
                  experienceAwards.map((award, idx) => (
                    <div key={award.id || idx} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-900/50 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded border ${
                            award.category === 'story'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-600/50'
                              : award.category === 'epic'
                              ? 'bg-purple-950 text-purple-300 border-purple-600/50'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                          }`}>
                            {award.category || 'Session'}
                          </span>
                          {award.sessionNumber && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Session {award.sessionNumber}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {award.timestamp ? new Date(award.timestamp).toLocaleDateString() : 'Recorded'}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-200 text-xs truncate">
                          {award.reason || 'Experience Award'}
                        </div>
                        {award.notes && (
                          <div className="text-[11px] text-slate-400 italic">
                            {award.notes}
                          </div>
                        )}
                        {award.debtPaid > 0 && (
                          <div className="text-[10px] text-rose-300 font-mono">
                            Paid {award.debtPaid} AP toward Experience Debt
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          +{award.amount} AP
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: IDENTITY POINT POOLS */}
        {activeTab === 'pools' && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 1. OCCUPATION CARD */}
              {(() => {
                const name = characterData?.['char-occu'] || 'Not Selected';
                const secOccName = characterData?.['char-secondary-occu'] || characterData?.['char-background-occu'] || characterData?.['char-occu-secondary'];
                const isSelected = Boolean(characterData?.['char-occu'] && characterData?.['char-occu'] !== 'Not Selected');
                const profSkills = extractNameList(occuObj?.professional_skills || occuObj?.skills);

                const commonTraitNames = COMMON_OCCUPATIONAL_TRAITS.map(t => t.name);
                const primaryOccTraits = extractNameList(occuObj?.traits || occuObj?.trait);
                const secondaryOccTraits = extractNameList(secondaryOccuObj?.traits || secondaryOccuObj?.trait);
                const occTraits = Array.from(new Set([...primaryOccTraits, ...commonTraitNames, ...secondaryOccTraits]));

                const occFeats = extractNameList(occuObj?.features || occuObj?.recommended_features || occuObj?.bonus_features);
                const maxSP = parseInt(occuObj?.skill_points ?? (profSkills.length > 0 ? 20 : 0), 10);
                const maxTraits = parseInt(occuObj?.bonus_traits || occuObj?.bonus_features || (occTraits.length > 0 ? 2 : 0), 10);
                const occMaxFeats = parseInt(occuObj?.bonus_features || (occFeats.length > 0 ? 1 : 0), 10);
                const activeMods = identityPools.occupation?.activeModifiers || [];

                return (
                  <div className="bg-slate-950/90 border border-sky-500/40 rounded-xl p-4 space-y-3.5 flex flex-col justify-between shadow-[0_0_12px_rgba(56,189,248,0.08)]">
                    <div className="flex justify-between items-start border-b border-sky-900/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                          Occupation Career
                        </span>
                        <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                          {maxSP} SP • {maxTraits} Traits
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold block truncate max-w-[160px] ${isSelected ? 'text-sky-200' : 'text-slate-500 italic'}`}>
                          {name}
                        </span>
                        {secOccName && (
                          <span className="text-[10px] text-sky-400 font-mono truncate max-w-[160px] block">
                            + {secOccName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      {isSelected ? (
                        <>
                          {(profSkills.length > 0 && maxSP > 0) && (
                            <SkillPoolRankPulldown
                              title="Professional Skill Package Pool"
                              subtitle="Max Rank 11 • Recommended: Rank 6"
                              categoryLabel="Professional Skill"
                              maxSP={maxSP}
                              allocatedSkills={characterData?.occuAllocations?.skills || {}}
                              recommendedSkills={profSkills}
                              allSkills={dbData?.skills?.length > 0 ? dbData.skills : ALL_CANONICAL_SKILLS}
                              onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('occuAllocations', sName, newRank, delta, maxSP)}
                              onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('occuAllocations', sName, 0, 0, maxSP)}
                              colorTheme="sky"
                            />
                          )}

                          {maxTraits > 0 && (
                            <div className="pt-2 border-t border-sky-900/30">
                              <TraitMultiselectPulldown
                                title={`Occupation Career Traits Pool${secOccName ? ' (Combined with Background)' : ''}`}
                                categoryLabel="Occupational Trait"
                                maxSelectable={maxTraits}
                                selectedTraits={characterData?.occuAllocations?.traits || []}
                                recommendedTraits={occTraits}
                                allTraits={allTraitsMerged}
                                onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('occuAllocations', tName, tObj, maxTraits)}
                                onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('occuAllocations', tName)}
                                colorTheme="sky"
                              />
                            </div>
                          )}

                          {(occFeats.length > 0 && occMaxFeats > 0) && (
                            <div className="pt-2 border-t border-sky-900/30">
                              <FeatureMultiselectPulldown
                                title="Occupation Feature Choices Pool (0 CP Supplemental)"
                                categoryLabel="Occupation Feature"
                                maxSelectable={occMaxFeats}
                                selectedFeatures={characterData?.occuAllocations?.features || []}
                                recommendedFeatures={occFeats}
                                allFeatures={dbData?.features?.length > 0 ? dbData.features : DEFAULT_FEATURES}
                                onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('occuAllocations', fName, fObj, occMaxFeats)}
                                onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('occuAllocations', fName)}
                                colorTheme="sky"
                              />
                            </div>
                          )}

                          {activeMods.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-sky-900/30">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-sky-400/90 block">
                                Inherent Modifiers:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {activeMods.map((m, idx) => (
                                  <span key={idx} className="bg-sky-950/70 border border-sky-900/50 px-2 py-0.5 rounded text-[10px] text-sky-200 font-mono">
                                    {m.name || m.label}: <strong>{m.value > 0 ? `+${m.value}` : m.value}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic py-4 text-center">
                          Select an occupation in the Identity Tab to allocate professional skill points and career traits.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. ORIGIN CARD */}
              {(() => {
                const name = characterData?.['char-origin'] || 'Not Selected';
                const secName = characterData?.['char-secondary-origin'] || characterData?.['char-origin-secondary'];
                const isSelected = Boolean(characterData?.['char-origin'] && characterData?.['char-origin'] !== 'Not Selected');
                const primarySocSkills = extractNameList(originObj?.society_skills);
                const secondarySocSkills = extractNameList(secondaryOriginObj?.society_skills);
                const socSkills = Array.from(new Set([...primarySocSkills, ...secondarySocSkills]));

                const primaryOrigTraits = extractNameList(originObj?.traits || originObj?.trait);
                const secondaryOrigTraits = extractNameList(secondaryOriginObj?.traits || secondaryOriginObj?.trait);
                const origTraits = Array.from(new Set([...primaryOrigTraits, ...secondaryOrigTraits]));

                const primaryOrigFeats = extractNameList(originObj?.features || originObj?.bonus_features);
                const secondaryOrigFeats = extractNameList(secondaryOriginObj?.features || secondaryOriginObj?.bonus_features);
                const origFeats = Array.from(new Set([...primaryOrigFeats, ...secondaryOrigFeats]));

                const maxSP = parseInt(originObj?.skill_points ?? (socSkills.length > 0 ? 20 : 0), 10);
                const maxTraits = parseInt(originObj?.bonus_traits || originObj?.bonus_features || (origTraits.length > 0 ? 2 : 0), 10);
                const origMaxFeats = parseInt(originObj?.bonus_features || 0, 10);
                const activeMods = identityPools.origin?.activeModifiers || [];

                return (
                  <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl p-4 space-y-3.5 flex flex-col justify-between shadow-[0_0_12px_rgba(16,185,129,0.08)]">
                    <div className="flex justify-between items-start border-b border-emerald-900/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Origin Homeworld
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                          {maxSP} SP • {maxTraits} Traits
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold block truncate max-w-[160px] ${isSelected ? 'text-emerald-200' : 'text-slate-500 italic'}`}>
                          {name}
                        </span>
                        {secName && (
                          <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[160px] block">
                            + {secName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      {isSelected ? (
                        <>
                          {(socSkills.length > 0 && maxSP > 0) && (
                            <SkillPoolRankPulldown
                              title="Society Skill Point Pool"
                              categoryLabel="Society Skill"
                              maxSP={maxSP}
                              allocatedSkills={characterData?.originAllocations?.skills || {}}
                              recommendedSkills={socSkills}
                              allSkills={dbData?.skills?.length > 0 ? dbData.skills : ALL_CANONICAL_SKILLS}
                              onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('originAllocations', sName, newRank, delta, maxSP)}
                              onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('originAllocations', sName, 0, 0, maxSP)}
                              colorTheme="emerald"
                            />
                          )}

                          {maxTraits > 0 && (
                            <div className="pt-2 border-t border-emerald-900/30">
                              <TraitMultiselectPulldown
                                title="Origin Homeworld Traits Pool"
                                categoryLabel="Origin Trait"
                                maxSelectable={maxTraits}
                                selectedTraits={characterData?.originAllocations?.traits || []}
                                recommendedTraits={origTraits}
                                allTraits={allTraitsMerged}
                                onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('originAllocations', tName, tObj, maxTraits)}
                                onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('originAllocations', tName)}
                                colorTheme="emerald"
                              />
                            </div>
                          )}

                          {(origFeats.length > 0 && origMaxFeats > 0) && (
                            <div className="pt-2 border-t border-emerald-900/30">
                              <FeatureMultiselectPulldown
                                title="Origin Bonus Features"
                                categoryLabel="Origin Feature"
                                maxSelectable={origMaxFeats}
                                selectedFeatures={characterData?.originAllocations?.features || []}
                                recommendedFeatures={origFeats}
                                allFeatures={dbData?.features?.length > 0 ? dbData.features : DEFAULT_FEATURES}
                                onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('originAllocations', fName, fObj, origMaxFeats)}
                                onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('originAllocations', fName)}
                                colorTheme="emerald"
                              />
                            </div>
                          )}

                          {activeMods.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-emerald-900/30">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/90 block">
                                Inherent Modifiers:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {activeMods.map((m, idx) => (
                                  <span key={idx} className="bg-emerald-950/70 border border-emerald-900/50 px-2 py-0.5 rounded text-[10px] text-emerald-200 font-mono">
                                    {m.name || m.label}: <strong>{m.value > 0 ? `+${m.value}` : m.value}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic py-4 text-center">
                          Select an origin in the Identity Tab to allocate society skill points and homeworld traits.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 3. FACTION CARD */}
              {(() => {
                const name = characterData?.['char-faction'] || 'Not Selected';
                const isSelected = Boolean(characterData?.['char-faction'] && characterData?.['char-faction'] !== 'Not Selected');
                const pkgSkills = extractNameList(factionObj?.skill_package || factionObj?.skills);
                const factionBenefits = extractNameList(factionObj?.features || factionObj?.bonus_features || factionObj?.benefits);
                const factionTraits = extractNameList(factionObj?.traits || factionObj?.trait);
                const maxSP = parseInt(factionObj?.skill_points || (pkgSkills.length > 0 ? 20 : 0), 10);
                const maxFeats = parseInt(factionObj?.bonus_features || (factionBenefits.length > 0 ? 1 : 0), 10);
                const maxTraits = parseInt(factionObj?.bonus_traits || (factionTraits.length > 0 ? 1 : 0), 10);
                const activeMods = identityPools.faction?.activeModifiers || [];

                return (
                  <div className="bg-slate-950/90 border border-purple-500/40 rounded-xl p-4 space-y-3.5 flex flex-col justify-between shadow-[0_0_12px_rgba(168,85,247,0.08)]">
                    <div className="flex justify-between items-start border-b border-purple-900/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                          Faction Allegiance
                        </span>
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                          {maxSP} SP • {maxFeats} Benefits
                        </span>
                      </div>
                      <span className={`text-xs font-bold truncate max-w-[160px] ${isSelected ? 'text-purple-200' : 'text-slate-500 italic'}`}>
                        {name}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {isSelected ? (
                        <>
                          {(factionObj?.driving_mandate || factionObj?.mandate) && (
                            <div className="text-[11px] text-slate-300 italic font-mono bg-purple-950/30 p-2 rounded border border-purple-900/40">
                              <span className="text-purple-400 not-italic font-bold">Mandate:</span> "{factionObj.driving_mandate || factionObj.mandate}"
                            </div>
                          )}

                          {(pkgSkills.length > 0 && maxSP > 0) && (
                            <SkillPoolRankPulldown
                              title="Faction Skill Package Pool"
                              categoryLabel="Faction Skill"
                              maxSP={maxSP}
                              allocatedSkills={characterData?.factionAllocations?.skills || {}}
                              recommendedSkills={pkgSkills}
                              allSkills={dbData?.skills?.length > 0 ? dbData.skills : ALL_CANONICAL_SKILLS}
                              onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('factionAllocations', sName, newRank, delta, maxSP)}
                              onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('factionAllocations', sName, 0, 0, maxSP)}
                              colorTheme="purple"
                            />
                          )}

                          {(factionBenefits.length > 0 && maxFeats > 0) && (
                            <div className="pt-2 border-t border-purple-900/30">
                              <FeatureMultiselectPulldown
                                title="Faction Features & Benefits Pool"
                                categoryLabel="Faction Feature"
                                maxSelectable={maxFeats}
                                selectedFeatures={characterData?.factionAllocations?.features || []}
                                recommendedFeatures={factionBenefits}
                                allFeatures={dbData?.features?.length > 0 ? dbData.features : DEFAULT_FEATURES}
                                onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('factionAllocations', fName, fObj, maxFeats)}
                                onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('factionAllocations', fName)}
                                colorTheme="purple"
                              />
                            </div>
                          )}

                          {maxTraits > 0 && (
                            <div className="pt-2 border-t border-purple-900/30">
                              <TraitMultiselectPulldown
                                title="Faction Traits Pool"
                                categoryLabel="Faction Trait"
                                maxSelectable={maxTraits}
                                selectedTraits={characterData?.factionAllocations?.traits || []}
                                recommendedTraits={factionTraits}
                                allTraits={allTraitsMerged}
                                onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('factionAllocations', tName, tObj, maxTraits)}
                                onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('factionAllocations', tName)}
                                colorTheme="purple"
                              />
                            </div>
                          )}

                          {activeMods.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-purple-900/30">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400/90 block">
                                Inherent Modifiers:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {activeMods.map((m, idx) => (
                                  <span key={idx} className="bg-purple-950/70 border border-purple-900/50 px-2 py-0.5 rounded text-[10px] text-purple-200 font-mono">
                                    {m.name || m.label}: <strong>{m.value > 0 ? `+${m.value}` : m.value}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic py-4 text-center">
                          Select a faction in the Identity Tab to allocate faction skill packages and benefits.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 4. SPECIES CARD */}
              {(() => {
                const name = characterData?.['char-species'] || 'Not Selected';
                const isSelected = Boolean(characterData?.['char-species'] && characterData?.['char-species'] !== 'Not Selected');
                const specAttrs = speciesObj ? (
                  speciesObj.bonus_attribute_points ||
                  speciesObj.bonus_attribute_choices ||
                  (speciesObj.modifiers || []).filter(m => (m.type === 'attribute' || m.aspect === 'attribute') && (m.mode === 'bonus_pool' || m.mode === 'choice_pool' || (m.target || '').toLowerCase().includes('any'))).reduce((acc, m) => acc + (parseInt(m.value || 1, 10)), 0) || 0
                ) : 0;
                const specFeats = extractNameList(speciesObj?.bonus_feature_choices || speciesObj?.recommended_features);
                const specTraits = extractNameList(speciesObj?.bonus_trait_choices || speciesObj?.recommended_traits || speciesObj?.traits);
                const specSkills = extractNameList(speciesObj?.bonus_skill_choices);
                const specMaxSkills = parseInt(speciesObj?.bonus_skills || speciesObj?.bonus_skill_points || 0, 10);
                const specMaxFeats = parseInt(speciesObj?.bonus_features || speciesObj?.bonus_feature_points || 0, 10);
                const specMaxTraits = parseInt(speciesObj?.bonus_traits || (specTraits.length > 0 ? 1 : 0), 10);
                const activeMods = identityPools.species?.activeModifiers || [];
                const inherentTraits = extractNameList(speciesObj?.inherent_features);

                return (
                  <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-4 space-y-3.5 flex flex-col justify-between shadow-[0_0_12px_rgba(34,211,238,0.08)]">
                    <div className="flex justify-between items-start border-b border-cyan-900/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Dna className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Species Background
                        </span>
                        {(specAttrs > 0 || specMaxSkills > 0 || specMaxFeats > 0 || specMaxTraits > 0) && (
                          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                            {specAttrs > 0 ? `+${specAttrs} Attr ` : ''}
                            {specMaxSkills > 0 ? `+${specMaxSkills} SP ` : ''}
                            {specMaxTraits > 0 ? `+${specMaxTraits} Trait ` : ''}
                            {specMaxFeats > 0 ? `+${specMaxFeats} Feat` : ''}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-bold truncate max-w-[160px] ${isSelected ? 'text-cyan-200' : 'text-slate-500 italic'}`}>
                        {name}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {isSelected ? (
                        <>
                          {/* Bonus Attribute Points Selector */}
                          {specAttrs > 0 && (
                            <AttributePoolPulldown
                              title="Species Bonus Attribute Points"
                              maxPoints={parseInt(specAttrs, 10)}
                              allocatedAttrs={characterData?.speciesAllocations?.attributes || {}}
                              onAllocate={(attrId, delta) => allocatePoolAttribute && allocatePoolAttribute('speciesAllocations', attrId, delta, parseInt(specAttrs, 10))}
                              allowedOptions={speciesObj?.bonus_attribute_options}
                              colorTheme="cyan"
                            />
                          )}

                          {/* Species Traits Choices Pulldown */}
                          {(specTraits.length > 0 && specMaxTraits > 0) && (
                            <div className="pt-2 border-t border-cyan-900/30">
                              <TraitMultiselectPulldown
                                title="Species Trait Choices"
                                categoryLabel="Species Trait"
                                maxSelectable={specMaxTraits}
                                selectedTraits={characterData?.speciesAllocations?.traits || []}
                                recommendedTraits={specTraits}
                                allTraits={allTraitsMerged}
                                onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('speciesAllocations', tName, tObj, specMaxTraits)}
                                onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('speciesAllocations', tName)}
                                colorTheme="cyan"
                              />
                            </div>
                          )}

                          {/* Species Feature Choices Pulldown */}
                          {(specFeats.length > 0 && specMaxFeats > 0) && (
                            <div className="pt-2 border-t border-cyan-900/30">
                              <FeatureMultiselectPulldown
                                title="Species Feature Choices"
                                categoryLabel="Species Feature"
                                maxSelectable={specMaxFeats}
                                selectedFeatures={characterData?.speciesAllocations?.features || []}
                                recommendedFeatures={specFeats}
                                allFeatures={dbData?.features?.length > 0 ? dbData.features : DEFAULT_FEATURES}
                                onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('speciesAllocations', fName, fObj, specMaxFeats)}
                                onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('speciesAllocations', fName)}
                                colorTheme="cyan"
                              />
                            </div>
                          )}

                          {/* Species Skill Pool Pulldown */}
                          {(specSkills.length > 0 && specMaxSkills > 0) && (
                            <div className="pt-2 border-t border-cyan-900/30">
                              <SkillPoolRankPulldown
                                title="Species Skill Pool"
                                categoryLabel="Species Skill"
                                maxSP={specMaxSkills}
                                allocatedSkills={characterData?.speciesAllocations?.skills || {}}
                                recommendedSkills={specSkills}
                                allSkills={dbData?.skills?.length > 0 ? dbData.skills : ALL_CANONICAL_SKILLS}
                                onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('speciesAllocations', sName, newRank, delta, specMaxSkills)}
                                onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('speciesAllocations', sName, 0, 0, specMaxSkills)}
                                colorTheme="cyan"
                              />
                            </div>
                          )}

                          {/* Inherent Traits */}
                          {inherentTraits.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-cyan-900/30">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/90 block">
                                Inherent Traits:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {inherentTraits.map((t, idx) => (
                                  <span key={idx} className="bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded text-[10px] text-cyan-200">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Active Modifiers */}
                          {activeMods.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-cyan-900/30">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/90 block">
                                Inherent Modifiers:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {activeMods.map((m, idx) => (
                                  <span key={idx} className="bg-cyan-950/70 border border-cyan-900/50 px-2 py-0.5 rounded text-[10px] text-cyan-200 font-mono">
                                    {m.name || m.label}: <strong>{m.value > 0 ? `+${m.value}` : m.value}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic py-4 text-center">
                          Select a species in the Identity Tab to allocate species bonus attributes, skills, and traits.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* 5. GENERAL POINT BUY (OPEN CP BUDGET) */}
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 space-y-3 shadow-[0_0_15px_rgba(34,211,238,0.06)]">
              <div className="flex justify-between items-center border-b border-cyan-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">
                    General Point Buy (Open CP Budget)
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {remainingCP} CP Remaining
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkillPoolRankPulldown
                  title="Additional Skill Ranks (1 CP / Rank)"
                  categoryLabel="General Skill"
                  maxSP={Math.max(0, remainingCP + Object.values(characterData?.generalAllocations?.skills || {}).reduce((a, b) => a + (parseInt(b, 10) || 0), 0))}
                  allocatedSkills={characterData?.generalAllocations?.skills || {}}
                  recommendedSkills={[]}
                  allSkills={dbData?.skills?.length > 0 ? dbData.skills : ALL_CANONICAL_SKILLS}
                  onUpdateRank={(sName, newRank, delta) => allocatePoolSkillRank && allocatePoolSkillRank('generalAllocations', sName, newRank, delta, 999)}
                  onRemoveSkill={(sName) => allocatePoolSkillRank && allocatePoolSkillRank('generalAllocations', sName, 0, 0, 999)}
                  colorTheme="cyan"
                />

                <TraitMultiselectPulldown
                  title="Additional Traits (1 CP / Trait)"
                  categoryLabel="General Trait"
                  maxSelectable={99}
                  selectedTraits={characterData?.generalAllocations?.traits || []}
                  recommendedTraits={[]}
                  allTraits={allTraitsMerged}
                  onToggleTrait={(tName, tObj) => togglePoolTrait && togglePoolTrait('generalAllocations', tName, tObj, 99)}
                  onRemoveTrait={(tName) => removePoolTrait && removePoolTrait('generalAllocations', tName)}
                  colorTheme="cyan"
                />

                <FeatureMultiselectPulldown
                  title="Additional Features & Perks (3 CP each)"
                  categoryLabel="General Feature"
                  maxSelectable={99}
                  selectedFeatures={characterData?.generalAllocations?.features || []}
                  recommendedFeatures={[]}
                  allFeatures={dbData?.features?.length > 0 ? dbData.features : DEFAULT_FEATURES}
                  onToggleFeature={(fName, fObj) => togglePoolFeature && togglePoolFeature('generalAllocations', fName, fObj, 99)}
                  onRemoveFeature={(fName) => removePoolFeature && removePoolFeature('generalAllocations', fName)}
                  colorTheme="cyan"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ITEMIZED EXPENDITURES */}
        {activeTab === 'itemized' && (
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Detailed Expenditures List
            </h4>
            <div className="bg-slate-950/80 border border-slate-800 rounded flex-1 overflow-y-auto text-xs divide-y divide-slate-800/60 max-h-72">
              {itemizedList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">No point expenditures recorded.</div>
              ) : (
                itemizedList.map((item, idx) => {
                  const costVal = item.costVal !== undefined ? item.costVal : parseInt(item.cost, 10);
                  const costStr = String(item.cost || `${costVal} CP`);
                  const isPackageIncluded = costStr.includes('[') || (costVal === 0 && item.standaloneCost);

                  // Color and badge styling for cost
                  let costStyle = 'text-amber-400'; // Default positive cost
                  if (costVal < 0) {
                    costStyle = 'text-emerald-400'; // Refund
                  } else if (isPackageIncluded) {
                    costStyle = 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5 rounded shadow-sm'; // 0 [X] Package-included
                  } else if (costVal === 0) {
                    costStyle = 'text-slate-400/80'; // 0 CP baseline
                  }

                  return (
                    <div key={idx} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-900/60 transition-colors">
                      <span className="col-span-3 font-bold uppercase text-[10px] text-cyan-400 tracking-wider truncate">
                        {item.category}
                      </span>
                      <span className="col-span-4 font-medium text-slate-200 truncate pr-2">
                        {item.item}
                      </span>
                      <span className="col-span-3 text-slate-400 text-center font-mono text-[11px] truncate">
                        {item.val}
                      </span>
                      <span className="col-span-2 text-right">
                        <span className={`font-mono font-bold text-xs ${costStyle}`}>
                          {item.cost}
                        </span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">
            Rule: 1 AP = 1 CP • Increment Rule: Max +1 per award
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(EconomyModal);
