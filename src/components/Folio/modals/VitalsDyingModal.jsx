import React, { useState } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { VITALITY_HEALTH_STRUCTURE_RULES, DEATH_AND_DYING_RULES } from '../../../engines/tangentConstants';

const DAMAGE_ROUTING_TIERS = [
  {
    type: 'Non-Lethal Damage',
    target: 'Vitality First',
    icon: '🥊',
    color: 'amber',
    summary: 'Pummeling, fatigue, exhaustion, stun attacks',
    description: 'Vitality acts as a buffer absorbing non-lethal harm. Only when Vitality is completely depleted (0) does excess non-lethal damage spill over into Health.'
  },
  {
    type: 'Lethal Damage',
    target: 'Health Direct',
    icon: '🗡️',
    color: 'rose',
    summary: 'Blades, ballistic fire, energy weapons, plasma, acid',
    description: 'Lethal damage reduces Health directly. If lethal damage exceeds current Health (reducing it to 0), any excess damage is applied to remaining Vitality.'
  },
  {
    type: 'Critical Hits',
    target: 'Direct Health Bypass',
    icon: '⚡',
    color: 'purple',
    summary: 'Natural 20s, critical exploits, pinpoint strikes',
    description: 'Critical strikes bypass the target\'s Vitality buffer entirely, inflicting direct lethal damage straight to Health. Excess damage beyond 0 Health goes to Vitality.'
  },
  {
    type: 'Concussive Damage',
    target: '50/50 Split (Trauma)',
    icon: '💥',
    color: 'cyan',
    summary: 'Falls, shockwaves, vehicle collisions, explosions',
    description: 'Concussive trauma is dispersed across the entire body. If the character attempts to reduce the damage, it is split 50/50 between Vitality and Health.'
  }
];

const MORTALITY_STAGES = [
  {
    stage: '1. Buffered / Active',
    trigger: 'Health > 0 & Vitality > 0',
    status: 'Combat Effective',
    color: 'emerald',
    icon: '🛡️',
    details: 'The character is fully conscious, functioning, and protected by their dual-track vitality buffer and stamina toughness.'
  },
  {
    stage: '2. Incapacitated',
    trigger: '0 Health (Vitality > 0)',
    status: 'Unconscious & Prone',
    color: 'amber',
    icon: '🛌',
    details: 'The character falls unconscious immediately, drops anything held, and falls Prone. Crucially, they are NOT on the death clock because Vitality buffer still cushions them.'
  },
  {
    stage: '3. Death\'s Door',
    trigger: '0 Health AND 0 Vitality',
    status: 'Comatose (Death Clock Active)',
    color: 'rose',
    icon: '💀',
    details: 'Both tracks are zero. The character enters a coma. The Death Clock starts with rounds equal to Stamina score (minimum 1 round). Medical aid or healing is urgently required.'
  },
  {
    stage: '4. Deceased',
    trigger: 'Death Clock Reaches 0 / Massive Damage',
    status: 'Permanently Dead',
    color: 'red',
    icon: '⚰️',
    details: 'The biological life or artificial core has expired. Return requires high-tier Metaphysics or TL5 tech, incurring "The High Cost of Dying" (-All Karma, -5 AP Debt).'
  }
];

const VitalsDyingModal = ({ isOpen, onClose }) => {
  const {
    characterData,
    derivedStats,
    getAttrTotal,
    stabilizeCharacter,
    advanceCharacterDeathTurn,
    revivifyCharacter
  } = useFolio();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'routing' | 'mortality' | 'synthetic'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const maxHealth = parseInt(characterData.health || 30, 10);
  const maxVitality = parseInt(characterData.vitality || 30, 10);
  const curHealth = parseInt(characterData.current_health ?? characterData.health ?? 30, 10);
  const curVitality = parseInt(characterData.current_vitality ?? characterData.vitality ?? 30, 10);
  const staminaScore = getAttrTotal('attr-stamina') || 0;
  const toughness = derivedStats?.toughness ?? staminaScore;
  const isSynthetic = derivedStats?.isSynthetic || false;
  const structure = derivedStats?.structure ?? (curHealth + curVitality);

  const isDead = characterData?.is_dead || false;
  const atDeathsDoor = !isDead && (characterData?.is_at_deaths_door || (curHealth <= 0 && curVitality <= 0));
  const isIncapacitated = !isDead && !atDeathsDoor && curHealth <= 0;
  const isStabilized = characterData?.is_stabilized || false;
  const deathClock = characterData?.death_clock ?? Math.max(1, staminaScore || 1);

  const filteredRouting = DAMAGE_ROUTING_TIERS.filter(tier => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return tier.type.toLowerCase().includes(q) ||
      tier.target.toLowerCase().includes(q) ||
      tier.summary.toLowerCase().includes(q) ||
      tier.description.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0e1422] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-slate-100 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-cyan-300">
                Vitality, Health, Structure &amp; Dying Rules
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Canonical Tangent Science Fantasy Roleplay Health Architecture &amp; Mortality Engine
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

        {/* Live Hero Vitals Status Bar */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex flex-wrap justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <span>Hero Biological &amp; Mortality State</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono">Toughness: +{toughness} (STA Soak)</span>
              {isSynthetic && <span className="text-amber-400 font-mono">Structure: {structure} SP</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-sans text-slate-400 font-bold uppercase">Health (Lethal)</div>
              <div className={`text-lg font-bold ${curHealth <= 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                {curHealth} <span className="text-xs font-normal text-slate-500">/ {maxHealth}</span>
              </div>
              <div className="text-[9px] font-sans text-slate-500">Physical Trauma</div>
            </div>

            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-sans text-cyan-300 font-bold uppercase">Vitality (Buffer)</div>
              <div className={`text-lg font-bold ${curVitality <= 0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {curVitality} <span className="text-xs font-normal text-slate-500">/ {maxVitality}</span>
              </div>
              <div className="text-[9px] font-sans text-slate-500">Non-Lethal Cushion</div>
            </div>

            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-sans text-emerald-400 font-bold uppercase">Base Toughness</div>
              <div className="text-lg font-bold text-emerald-300">
                +{toughness}
              </div>
              <div className="text-[9px] font-sans text-slate-500">Wound Soak / Point</div>
            </div>

            <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-sans text-amber-400 font-bold uppercase">Condition Status</div>
              <div className="text-xs font-bold font-sans mt-1">
                {isDead ? (
                  <span className="text-red-400 uppercase">⚰️ Deceased</span>
                ) : atDeathsDoor ? (
                  <span className="text-rose-400 uppercase">💀 Death's Door ({deathClock}r)</span>
                ) : isIncapacitated ? (
                  <span className="text-amber-400 uppercase">🛌 Incapacitated</span>
                ) : (
                  <span className="text-emerald-400 uppercase">✓ Combat Active</span>
                )}
              </div>
              <div className="text-[9px] font-sans text-slate-500">
                {isStabilized ? 'Stabilized' : 'Normal'}
              </div>
            </div>
          </div>

          {/* Interactive quick controls if afflicted */}
          {(atDeathsDoor || isDead || isIncapacitated) && (
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-300 text-[11px]">
                {isDead && <span className="text-red-400">Hero is deceased. Revivification invokes The High Cost of Dying (-All Karma, -5 AP Debt).</span>}
                {atDeathsDoor && <span className="text-rose-300">Hero is Comatose at Death's Door! Apply Medicine DC 15 check or healing tech.</span>}
                {isIncapacitated && <span className="text-amber-300">Hero is unconscious at 0 Health, but buffered by remaining Vitality.</span>}
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                {atDeathsDoor && !isStabilized && (
                  <>
                    <button
                      type="button"
                      onClick={() => stabilizeCharacter({ hasHealingEffect: true })}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10.5px] font-bold uppercase tracking-wider border border-emerald-400 transition-colors cursor-pointer"
                    >
                      🩹 Stabilize (DC 15)
                    </button>
                    <button
                      type="button"
                      onClick={() => advanceCharacterDeathTurn()}
                      className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10.5px] font-mono font-bold uppercase tracking-wider border border-rose-700 transition-colors cursor-pointer"
                    >
                      ⏳ -1 Round
                    </button>
                  </>
                )}
                {isDead && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Perform Revivification? 'The High Cost of Dying' applies: Character loses ALL remaining Karma Points and suffers a -5 AP Debt.")) {
                        revivifyCharacter();
                      }
                    }}
                    className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[10.5px] font-bold uppercase tracking-wider border border-red-500 transition-colors cursor-pointer"
                  >
                    ⚡ Revivify Character (-5 AP Debt)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {[
              { id: 'all', label: 'All Rules' },
              { id: 'routing', label: 'Damage Routing' },
              { id: 'mortality', label: 'Mortality & Death Clock' },
              { id: 'synthetic', label: 'Synthetics & Structure' }
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
            placeholder="Search vitals, mortality, or damage rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Content Area */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">

          {/* Section: Philosophy & Starting Pools */}
          {(activeTab === 'all') && (
            <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>🛡️</span> The Tangent Dual-Track Health Philosophy
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center justify-between">
                    <span>No Hit Points (HP) in Tangent</span>
                    <span className="text-[10px] font-mono text-cyan-300">Dual-Track System</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">
                    {VITALITY_HEALTH_STRUCTURE_RULES.descriptions.systemRule} Instead of an abstract single HP number, harm is tracked across two distinct physiological tiers: <strong>Vitality</strong> (fatigue, non-lethal bruising, stamina) and <strong>Health</strong> (physical trauma and flesh wounds).
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>Starting Values &amp; Progression</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">1 CP = +5 Points</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">
                    Characters begin with a baseline of <strong>30 points each</strong> in Vitality and Health. Both can be increased with Character Points (CP) at a rate of 5 points per 1 CP, with a suggested starting maximum of 60 points each.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/50 text-xs text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <span>🛡️</span> Stamina Toughness Soak Rule
                </div>
                <p className="text-[11px] text-slate-300">
                  {VITALITY_HEALTH_STRUCTURE_RULES.descriptions.staminaScore}
                </p>
              </div>
            </div>
          )}

          {/* Section: Damage Routing Mechanics */}
          {(activeTab === 'all' || activeTab === 'routing') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <span>⚡</span> Damage Types &amp; Routing Mechanics
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Order of Resolution: Armor DR → Toughness → Target Track
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRouting.map((tier, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-2 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          <span>{tier.icon}</span> {tier.type}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {tier.target}
                        </span>
                      </div>

                      <div className="text-[10.5px] font-mono text-cyan-300/80 mb-2">
                        {tier.summary}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    {tier.type === 'Concussive Damage' && (
                      <div className="pt-2 border-t border-slate-800 text-[10.5px] text-slate-400">
                        {VITALITY_HEALTH_STRUCTURE_RULES.descriptions.concussiveDamage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: The 4 Mortality Stages & Death Clock */}
          {(activeTab === 'all' || activeTab === 'mortality') && (
            <div className="bg-slate-900/60 border border-rose-500/30 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-rose-900/40 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                  <span>💀</span> The Stages of Mortality &amp; The Death Clock
                </h3>
                <span className="text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
                  Clock = STA Score (Min 1 Round)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {MORTALITY_STAGES.map(stage => (
                  <div key={stage.stage} className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{stage.icon}</span> {stage.stage}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{stage.trigger}</span>
                    </div>
                    <div className="text-[10.5px] font-bold text-cyan-300">{stage.status}</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {stage.details}
                    </p>
                  </div>
                ))}
              </div>

              {/* Critical Survival Mechanics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-800/60 space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>🩹</span> Stabilization (DC 15)
                  </div>
                  <p className="text-[11px] text-slate-300">
                    A successful <strong>Medicine (DC 15) check</strong> or the application of healing tech/magic stops the Death Clock. The character remains unconscious and severely wounded, but is no longer actively dying.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-red-800/60 space-y-1">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <span>💥</span> Massive Damage Instant Kill
                  </div>
                  <p className="text-[11px] text-slate-300">
                    If a character takes damage equal to or greater than their <strong>Stamina Score in a single hit</strong> while at Death's Door, they suffer instant permanent death, bypassing the clock.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-purple-800/60 space-y-1">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <span>⚡</span> The High Cost of Dying
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Reviving a dead character (TL5 tech / high Metaphysics) causes them to lose <strong>ALL remaining Karma Points</strong> and incurs a <strong>-5 Experience Debt</strong> from severe trauma.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Synthetics & Non-Standard Physiologies */}
          {(activeTab === 'all' || activeTab === 'synthetic') && (
            <div className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex justify-between items-center border-b border-amber-900/40 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <span>⚙️</span> Synthetics, Mecha &amp; Structure Points (SP)
                </h3>
                <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                  Structure = Vitality + Health
                </span>
              </div>

              <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-3 text-xs text-amber-200/90 leading-relaxed">
                {VITALITY_HEALTH_STRUCTURE_RULES.descriptions.structure}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300">No Vitality Buffer</div>
                  <p className="text-[11px] text-slate-400">
                    Synthetics and constructs lack organic nervous fatigue. All damage, whether lethal or non-lethal, is applied directly to Structure.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300">Unified SP Pool</div>
                  <p className="text-[11px] text-slate-400">
                    Structure score equals the combined total of Vitality and Health (e.g. 30 Vit + 30 Health = 60 Structure Points baseline).
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300">Repair vs Medicine</div>
                  <p className="text-[11px] text-slate-400">
                    Structure damage cannot be healed via standard biological Medicine; it requires Technology/Engineering checks, spare parts, and nanite fabrication.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex flex-wrap justify-between items-center text-xs font-mono gap-2">
                <span className="text-slate-400">Covered Non-Standard Physiologies:</span>
                <span className="text-cyan-300 font-bold">
                  {VITALITY_HEALTH_STRUCTURE_RULES.nonStandardPhysiologies.join(' • ')}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span>Tangent SF RP • Health Architecture &amp; Mortality Engine</span>
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

export default React.memo(VitalsDyingModal);
