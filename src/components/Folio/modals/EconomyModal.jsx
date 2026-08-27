import React, { useState } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { EXPERIENCE_RULES } from '../../../engines/tangentConstants';

const EconomyModal = ({ isOpen, onClose, characterData, updateField, economyBreakdown }) => {
  const [activeTab, setActiveTab] = useState('pools'); // 'pools' | 'itemized' | 'experience'
  const { awardExperience, payExperienceDebt } = useFolio();

  // Experience Award Form State
  const [awardAmount, setAwardAmount] = useState(2);
  const [awardCategory, setAwardCategory] = useState('session');
  const [awardReason, setAwardReason] = useState('Standard Session & In-Character Roleplay');
  const [awardNotes, setAwardNotes] = useState('');
  const [sessionNum, setSessionNum] = useState('');
  const [autoPayDebt, setAutoPayDebt] = useState(true);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-md p-4 pt-6 sm:pt-10 overflow-y-auto">
      <div className={`bg-[#121824] border rounded-xl max-w-3xl w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-6 my-6 flex flex-col max-h-[92vh] ${isOver ? 'border-red-500/80 ring-2 ring-red-500/60' : 'border-cyan-500/60'}`}>
        
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
                  Character point expenditure ({spentCP} CP) exceeds effective budget ({totalBudget} CP = {startingCP} BP + {earnedAP} AP).
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
              Starting BP (Creation)
            </label>
            <input
              type="number"
              step="5"
              value={startingCP}
              onChange={(e) => updateField('starting-cp', parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded text-center py-1 text-sm font-mono font-bold text-cyan-300 outline-none"
              title="Base character creation build points (Standard 150 BP)"
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
            <span>🎖️</span> Experience &amp; AP ({earnedAP} AP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pools')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'pools'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Identity Point Pools
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

        {/* TAB 1: EXPERIENCE & AWARD POINTS (AP) */}
        {activeTab === 'experience' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            
            {/* The Increment Rule (CRITICAL) Callout Banner */}
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                <span>⚠️</span> The Increment Rule (CRITICAL CANON RULE)
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed">
                <strong>Exchange Rate:</strong> 1 Award Point (AP) = 1 Build Point (BP). Points are spent exactly like BP during creation, except that <strong className="text-amber-200">abilities, skills, or other traits may ONLY have a 1-point increment of any score per experience award event</strong>. A player cannot dump 10 AP into a single skill instantly.
              </p>
            </div>

            {/* Experience Debt Banner (If Active) */}
            {experienceDebt > 0 && (
              <div className="bg-rose-950/50 border border-rose-500/60 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-rose-200 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💀</span>
                  <div>
                    <div className="text-xs font-bold font-mono uppercase text-rose-300 flex items-center gap-2">
                      <span>Experience Debt Active</span>
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

            {/* Award Experience Tool (GM & Session Award Panel) */}
            <div className="bg-slate-950/80 border border-cyan-900/60 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span>🎖️</span> Award Experience Points (GM Tool)
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
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {identityCategories.map(({ key, label, data }) => {
                const name = data?.name || 'Not Selected';
                const pools = data?.pools || [];
                const activeModifiers = data?.activeModifiers || [];
                const isSelected = name && name !== 'Not Selected';
                const hasBonuses = pools.length > 0 || activeModifiers.length > 0;

                return (
                  <div key={key} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                          {label}
                        </span>
                        {hasBonuses && (
                          <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                            {pools.length > 0 ? `${pools.length} Pool${pools.length > 1 ? 's' : ''}` : ''}
                            {pools.length > 0 && activeModifiers.length > 0 ? ' • ' : ''}
                            {activeModifiers.length > 0 ? `${activeModifiers.length} Mod${activeModifiers.length > 1 ? 's' : ''}` : ''}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold truncate max-w-[140px] ${isSelected ? 'text-amber-300' : 'text-slate-500 italic'}`}>
                        {name}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 pt-1">
                      {/* Allotted Point Pools for Spend */}
                      {pools.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/90 block">
                            Point Pools to Allocate:
                          </span>
                          {pools.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/90 border border-emerald-900/50 px-2.5 py-1 rounded text-xs">
                              <span className="text-slate-200 font-medium">{p.name || 'Granted Pool'}</span>
                              <span className="font-mono font-bold text-emerald-400 shrink-0">
                                +{p.awarded} {p.type || 'Points'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Active Constant Modifiers */}
                      {activeModifiers.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/90 block">
                            Inherent Modifiers:
                          </span>
                          {activeModifiers.map((m, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/70 border border-cyan-900/40 px-2 py-0.5 rounded text-[11px]">
                              <span className="text-slate-300">{m.label || m.name}</span>
                              <span className="font-mono font-bold text-cyan-300">
                                {m.value > 0 ? `+${m.value}` : m.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!hasBonuses && (
                        <div className="text-[11px] text-slate-500 italic py-2 text-center">
                          No special pools or inherent modifiers granted.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  
                  // Color coding for cost
                  let costColor = 'text-amber-400'; // Default positive cost
                  if (costVal < 0) {
                    costColor = 'text-emerald-400'; // Refund
                  } else if (costVal === 0) {
                    costColor = 'text-cyan-300/80'; // 0 CP
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
                      <span className={`col-span-2 text-right font-mono font-bold ${costColor}`}>
                        {item.cost}
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
            Rule: 1 AP = 1 BP • Increment Rule: Max +1 per award
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
