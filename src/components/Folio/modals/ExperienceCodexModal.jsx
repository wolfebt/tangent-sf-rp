import React, { useState } from 'react';
import { EXPERIENCE_RULES } from '../../../engines/tangentConstants';

const ADVANCEMENT_COSTS = [
  {
    category: 'Skills & Proficiencies',
    items: [
      { name: 'Skill Rank (+1)', cost: '1 AP', increment: 'Max +1 per award', desc: 'Increases the skill score by +1. Must adhere to the Increment Rule.' },
      { name: 'Skill Specialization (+1)', cost: '1 AP', increment: 'Max +1 per award', desc: 'Specialized focus in a specific weapon, craft, tool, or lore domain.' },
      { name: 'Attribute Check / Save (+1)', cost: '1 AP', increment: 'Max +1 per award', desc: 'Increases saving throw or passive attribute check modifier.' }
    ]
  },
  {
    category: 'Vitals & Survivability',
    items: [
      { name: 'Bonus Vitality (+5 Pool)', cost: '1 AP', increment: 'Max +5 per award', desc: 'Adds +5 points to the kinetic / energy Vitality shield pool.' },
      { name: 'Bonus Health (+5 Pool)', cost: '1 AP', increment: 'Max +5 per award', desc: 'Adds +5 points to the biological / lethal Health life-force pool.' }
    ]
  },
  {
    category: 'Attributes & Feats',
    items: [
      { name: 'Primary Attribute (+1)', cost: '5 AP', increment: 'Max +1 per award', desc: 'Permanently increases Strength, Agility, Intellect, etc. Represents intense conditioning.' },
      { name: 'Feature / Feat', cost: '2 – 3 AP', increment: '1 Feat per award', desc: 'Acquires a new combat trait, scientific specialty, or racial/background feature.' }
    ]
  },
  {
    category: 'Powers & Metaphysics',
    items: [
      { name: 'Special Ability', cost: '5 AP', increment: '1 Ability per award', desc: 'Unlocks a specialized biological, cybernetic, or racial special ability.' },
      { name: 'Awakened Discipline', cost: '5 AP', increment: '1 Discipline per award', desc: 'Awakens a new psychic or metaphysical school of discipline.' },
      { name: 'Invocation / Power', cost: '1 – 3 AP', increment: '1 Invocation per award', desc: 'Acquires an individual psychic or metaphysical invocation within an awakened school.' }
    ]
  }
];

const AWARD_GUIDELINES = [
  {
    title: 'Standard Session Pacing',
    badge: '1 – 3 AP per Session',
    color: 'emerald',
    icon: '⏳',
    desc: 'The Architect typically awards 1 to 3 Award Points at the end of a standard 3-4 hour game session, evaluated from gameplay focus and roleplay engagement.'
  },
  {
    title: 'Session Focus & Mechanics',
    badge: '0 – 2 AP',
    color: 'cyan',
    icon: '🎯',
    desc: 'Recognizes players who actively engage with the tactical mechanics, overcome combat obstacles, solve environmental puzzles, and support party strategy.'
  },
  {
    title: 'In-Character Roleplaying',
    badge: '0 – 2 AP',
    color: 'purple',
    icon: '🎭',
    desc: 'Awarded to players who faithfully embody their persona motivations, flaws, ethos, and relationships, elevating the narrative experience for the entire group.'
  },
  {
    title: 'Overcoming Villains & Plot Arcs',
    badge: '1 – 3 AP',
    color: 'amber',
    icon: '👑',
    desc: 'Granted upon unravelling deep conspiracies, thwarting major nemesis factions, or achieving critical tactical milestones in the campaign narrative.'
  },
  {
    title: 'Chapter & Campaign Milestones',
    badge: '5 – 10 AP',
    color: 'blue',
    icon: '🌌',
    desc: 'Major story arc or chapter conclusions. Represents significant narrative progression and provides character downtime reflection.'
  },
  {
    title: 'Epic Actions & Creative Ingenuity',
    badge: '1 – 5 AP (Ad Hoc)',
    color: 'rose',
    icon: '⚡',
    desc: 'Ad hoc GM awards for turning the tide of an impossible encounter, stunning creative plans, or memorable moments that stump the Architect.'
  }
];

export const ExperienceCodexModal = ({
  isOpen,
  onClose,
  earnedAP = 0,
  availableAP = 0,
  experienceDebt = 0
}) => {
  const [activeTab, setActiveTab] = useState('core'); // 'core', 'awards', 'costs', 'debt'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCosts = ADVANCEMENT_COSTS.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        cat.category.toLowerCase().includes(q)
      );
    })
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0e1422] border border-emerald-500/40 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(16,185,129,0.15)] text-slate-100 space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎖️</span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-emerald-300">
                Experience, Award Points (AP) &amp; Progression Codex
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Canonical Tangent Science Fantasy Roleplay Character Advancement System
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="self-end sm:self-center px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Live Advancement Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Earned AP</span>
            <div className="text-base font-bold text-emerald-300">
              +{earnedAP} AP
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Available / Unspent</span>
            <div className="text-base font-bold text-cyan-300">
              {availableAP} AP
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <div className="text-base font-bold text-amber-300">
              1 AP = 1 CP
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Experience Debt</span>
            <div className={`text-base font-bold ${experienceDebt > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {experienceDebt > 0 ? `-${experienceDebt} AP (Trauma)` : 'None (0 AP)'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {[
              { id: 'core', label: 'Core System & Increment Rule' },
              { id: 'awards', label: 'GM Award Pacing' },
              { id: 'costs', label: 'Advancement Costs Table' },
              { id: 'debt', label: 'Experience Debt' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search costs & rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

          {/* TAB 1: Core Mechanics & The Increment Rule */}
          {activeTab === 'core' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              
              {/* Critical Rule Callout */}
              <div className="bg-amber-950/40 border border-amber-500/60 rounded-xl p-4 space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>⚠️</span>
                  <span>CRITICAL CANON: The Increment Rule</span>
                </div>
                <p className="text-amber-100/90 text-xs leading-relaxed">
                  Abilities, skills, or other traits may <strong>ONLY HAVE A 1 POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD</strong>.
                  A player cannot dump multiple Award Points into a single skill or trait in a single transaction.
                </p>
                <div className="p-2.5 rounded bg-black/40 border border-amber-500/30 text-[11px] font-mono text-amber-200/90">
                  Example: If granted 3 AP after a chapter, a character can increase Technology (+1), Stealth (+1), and buy a Specialization (+1), but CANNOT increase Technology by +3 all at once.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                    <span>⚖️</span> 1 AP = 1 CP Direct Exchange
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Award Points (AP) represent the experiential growth earned by characters in active play. They function identically to Character Points (CP) from character creation, on a direct 1-for-1 basis.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                    <span>🛡️</span> Vitals Scaling Buffer
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Investing in physical stamina yields high efficiency: spending 1 AP grants <strong>+5 Maximum Vitality</strong> or <strong>+5 Maximum Health</strong>, bolstering survival in lethal firefights.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <span>🎮</span> GM Award Workflow in VTT
                </h4>
                <p className="text-slate-400 text-xs">
                  In Tangent SF RP, experience is primarily granted by the Game Master during and after sessions inside the VTT Tactical Environment. Awards immediately cascade to the Persona Folio and sync across the cloud.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: GM Award Categories & Pacing */}
          {activeTab === 'awards' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Official Architect guidelines for granting experience pacing throughout a campaign:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AWARD_GUIDELINES.map((guide, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <span>{guide.icon}</span>
                        <span>{guide.title}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 whitespace-nowrap">
                        {guide.badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {guide.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Advancement Costs Table */}
          {activeTab === 'costs' && (
            <div className="space-y-4">
              {filteredCosts.map((cat, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1.5">
                    {cat.category}
                  </h4>
                  <div className="space-y-2">
                    {cat.items.map((item, iIdx) => (
                      <div key={iIdx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-200 text-xs">{item.name}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.increment}
                          </span>
                          <span className="font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/60">
                            {item.cost}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Experience Debt & The High Cost of Dying */}
          {activeTab === 'debt' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-rose-950/40 border border-rose-600/70 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <span>💀</span>
                  <span>The High Cost of Dying: Revivification Trauma</span>
                </div>
                <p className="text-rose-100/90 text-xs leading-relaxed">
                  A character who survives Death's Door through emergency revivification or miraculous medical intervention suffers intense biological and psychological shock.
                  Canonically, revivification imposes an immediate <strong>-5 Experience Debt</strong> penalty and causes the complete loss of all current Karma.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">Automatic Repayment</h4>
                  <p className="text-slate-400 text-xs">
                    Future Award Points granted by the GM automatically pay down Experience Debt on a 1-for-1 basis before new traits, skills, or attributes can be advanced.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-cyan-300 text-sm">Manual Settlement</h4>
                  <p className="text-slate-400 text-xs">
                    Players may elect to settle Experience Debt voluntarily by expending unspent AP in the Discreet Fate &amp; AP modal or reducing an existing trait in consultation with the GM.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ExperienceCodexModal;
