import React, { useState } from 'react';
import { CORE_ATTRIBUTES, ATTRIBUTE_CHECKS, NON_ATTRIBUTE_FLAW } from '../../../engines/tangentConstants';

const CHALLENGE_RATINGS = [
  { dc: 10, label: 'Easy', desc: 'Routine tasks with minor pressure or mild distraction.' },
  { dc: 15, label: 'Moderate', desc: 'Standard professional challenge; demanding for untrained operators.' },
  { dc: 18, label: 'Challenging', desc: 'Complex problem or stressful combat situation requiring skill.' },
  { dc: 20, label: 'Hard', desc: 'Significant hazard, masterwork obstacle, or high-tier opposition.' },
  { dc: 25, label: 'Extreme', desc: 'Legendary difficulty; nearly impossible without specialized training or traits.' },
  { dc: 30, label: 'Heroic', desc: 'Feats bordering on miracle; world-class or cinematic actions.' },
  { dc: 35, label: 'Mythic', desc: 'Godlike or cosmic-scale endeavors pushing the boundaries of reality.' }
];

const SKILL_SYNERGIES = [
  {
    check: 'Might (STR)',
    skills: 'Athletics, Combat Maneuvers, Brawling',
    bonusDesc: 'Grants circumstance bonuses when attempting high-leverage lifts, grappling large beasts, or breaching structural bulkheads.'
  },
  {
    check: 'Reflex (AGI)',
    skills: 'Acrobatics, Stealth, Piloting / Evasion',
    bonusDesc: 'Applies circumstance modifiers when diving clear of area-of-effect explosions, ducking ship debris, or catching projectiles.'
  },
  {
    check: 'Fortitude (STA)',
    skills: 'Medicine, Survival, Biochemistry',
    bonusDesc: 'Allows analytical or acclimatization knowledge to bolster biological saves against exotic toxins, radiation, and extreme environments.'
  },
  {
    check: 'Reason (INT)',
    skills: 'Linguistics, Cryptography, Science, Technology',
    bonusDesc: 'Provides direct competence bonuses when decrypting alien transmission ciphers, reverse-engineering xeno-tech, or solving ancient mechanisms.'
  },
  {
    check: 'Willpower (WIS)',
    skills: 'Attune, Mental Alertness, Insight',
    bonusDesc: 'Strengthens psychic mental defense screens against psionic intrusion, eldritch terror, panic, and insidious mental manipulation.'
  },
  {
    check: 'Etiquette (CHA)',
    skills: 'Diplomacy, Bluff, Streetwise, Subterfuge',
    bonusDesc: 'Enables nuanced reading of social etiquette, underworld code words, or aristocratic protocol to avert hostile confrontations.'
  }
];

const AttributeChecksGuideModal = ({ isOpen, onClose, characterData = {}, getAttrTotal = () => 0 }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'checks' | 'dcs' | 'synergies'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const checksList = Object.values(ATTRIBUTE_CHECKS);

  const filteredChecks = checksList.filter(check => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      check.name.toLowerCase().includes(q) ||
      check.attributeName.toLowerCase().includes(q) ||
      check.description.toLowerCase().includes(q) ||
      check.example.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e1422] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-slate-100 space-y-6 my-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-cyan-300">
                Attribute Checks &amp; Saves Guide
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Canonical Tangent Science Fantasy Roleplay Ability Checks, Saving Throws &amp; Challenge Mechanics
            </p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Live Active Hero Attribute & Checks Tracker */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <span>Hero Check Baseline Tracker</span>
            <span className="text-cyan-400 font-mono">Formula: Base = 2 + (Attr × 2)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
            {checksList.map(check => {
              const attrTotal = getAttrTotal(check.attributeId);
              const checkTotal = getAttrTotal(check.id);
              const calculatedBase = 2 + (attrTotal * 2);

              return (
                <div key={check.id} className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-sans font-bold text-slate-400 uppercase">
                      {check.name}
                    </div>
                    <div className="text-[9px] text-slate-500 font-sans">
                      {check.attributeCode} ({attrTotal >= 0 ? `+${attrTotal}` : attrTotal})
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-base font-bold text-cyan-300">
                      {checkTotal > 0 ? `+${checkTotal}` : checkTotal}
                    </div>
                    <div className="text-[8.5px] text-amber-400/80 font-sans">
                      Base: {calculatedBase}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {[
              { id: 'all', label: 'All Rules' },
              { id: 'checks', label: 'The 6 Checks & Saves' },
              { id: 'dcs', label: 'Formulas & DCs' },
              { id: 'synergies', label: 'Skill Synergies' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search checks, saves, or rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Content Area */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">

          {/* Section: Core Formula & Economy */}
          {(activeTab === 'all' || activeTab === 'dcs') && (
            <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>📐</span> Core Formulas &amp; Character Progression Economy
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>Base Score Formula</span>
                    <code className="text-amber-300 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Base = 2 + (Attribute × 2)
                    </code>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    Whenever an Attribute increases, its corresponding sub-attribute check base score automatically shifts by twice that amount. A character with an Attribute of 0 has a base check score of 2. An Attribute of +3 gives a base score of 8.
                  </p>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    Roll Expression: <span className="text-emerald-300 font-bold">d20 + Total Score + Circumstance Modifiers</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>Point Costs &amp; Paragon Limits</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">5 BP / Attr • 1 BP / Check</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    <strong>Primary Attributes</strong> cost <strong>5 Build Points (BP)</strong> per +1 increase. <strong>Attribute Checks</strong> can also be increased independently at a cost of <strong>1 BP</strong> per +1 point.
                  </p>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                    Characters start with an attribute maximum of <strong>+4</strong> before species traits. Paragon upper score is <strong>+5</strong> + species modifiers.
                  </div>
                </div>
              </div>

              {/* Challenge Types: Targeted vs Opposed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/50 space-y-1">
                  <div className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <span>🎯</span> Targeted Challenges (vs Static CR)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Targeted challenges pit a character's roll against a static Challenge Rating (CR) set by the Architect/GM or scenario. Meeting or exceeding the CR achieves success.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/50 space-y-1">
                  <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                    <span>⚔️</span> Opposed Challenges (Contest)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Opposed challenges involve direct competition between two active participants (e.g. Might vs Might in an arm wrestle, or Reflex vs Reflex in a quick-draw contest). The highest total roll wins.
                  </p>
                </div>
              </div>

              {/* Challenge Rating Scale */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Standard Challenge Rating (CR) Scale
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center font-mono">
                  {CHALLENGE_RATINGS.map(cr => (
                    <div key={cr.dc} className="bg-slate-950 p-2 rounded-lg border border-slate-800" title={cr.desc}>
                      <div className="text-sm font-bold text-cyan-300">CR {cr.dc}</div>
                      <div className="text-[10px] font-sans font-bold text-amber-400">{cr.label}</div>
                      <div className="text-[9px] text-slate-500 font-sans mt-0.5 line-clamp-2">{cr.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: The 6 Checks & Saves */}
          {(activeTab === 'all' || activeTab === 'checks') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <span>⚡</span> The 6 Core Attribute Checks &amp; Saving Throws
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Act as saving throws and fallbacks for unlisted actions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredChecks.map(check => {
                  const currentTotal = getAttrTotal(check.id);
                  const isSave = ['Fortitude', 'Willpower', 'Reflex'].includes(check.name);

                  return (
                    <div
                      key={check.id}
                      className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-2.5 transition-all shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-black">❖</span>
                            <h4 className="text-sm font-bold text-slate-100">
                              {check.name}
                            </h4>
                            <span className="text-xs text-slate-400 font-mono">
                              ({check.attributeName})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isSave && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                                Primary Save
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Total: {currentTotal > 0 ? `+${currentTotal}` : currentTotal}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {check.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                        <div className="text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-850">
                          <strong className="text-cyan-300 font-mono">Example:</strong> {check.example}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                          <span>Base Formula: {check.baseFormula}</span>
                          <span>Cost: 1 BP / point</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Skill Synergies */}
          {(activeTab === 'all' || activeTab === 'synergies') && (
            <div className="bg-slate-900/50 border border-emerald-900/40 rounded-xl p-4 space-y-3.5">
              <div className="flex justify-between items-center border-b border-emerald-900/40 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <span>🧬</span> Skill Synergies &amp; Circumstance Modifiers
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Applied by Architect discretion based on context
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                When a character faces an Attribute Check or Saving Throw where their learned background, specialized skills, or career expertise directly relates to the threat, the Architect can award <strong>circumstance bonuses</strong> (typically +1 to +3) or allow an applicable skill check to substitute.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKILL_SYNERGIES.map((syn, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-300 text-xs">{syn.check}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{syn.skills}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {syn.bonusDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Non-Attribute Flaw */}
          {activeTab === 'all' && (
            <div className="bg-slate-900/60 border border-rose-500/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-rose-900/40 pb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span>⚠️</span> {NON_ATTRIBUTE_FLAW.name} (Special Rule)
                </h4>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
                  +{NON_ATTRIBUTE_FLAW.bpRefund} BP Refund
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {NON_ATTRIBUTE_FLAW.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                {NON_ATTRIBUTE_FLAW.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-950/80 p-2 rounded border border-slate-800">
                    • {ex}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span>Tangent SF RP • Attribute Resolution Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(AttributeChecksGuideModal);
