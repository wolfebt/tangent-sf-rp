import React, { useState } from 'react';
import { 
  Eye, 
  BookOpen, 
  Compass, 
  AlertTriangle, 
  Activity, 
  Search, 
  X,
  Target,
  Sparkles,
  MessageSquare,
  Cpu
} from 'lucide-react';
import { PERCEPTION_RULES } from '../../../engines/tangentConstants';

const CHALLENGE_RATINGS = [
  { dc: 10, label: 'Easy', desc: 'Routine tasks with minor pressure or mild distraction.', perceptionExample: 'Spotting prominent tracks in mud; hearing loud conversation in the next room' },
  { dc: 15, label: 'Moderate', desc: 'Standard professional challenge; demanding for untrained operators.', perceptionExample: 'Noticing a concealed tripwire; detecting nervous body language in a civilian' },
  { dc: 18, label: 'Challenging', desc: 'Complex problem or stressful combat situation requiring skill.', perceptionExample: 'Discerning residual arcane thermal signature; spotting a camouflaged sentry' },
  { dc: 20, label: 'Hard', desc: 'Significant hazard, masterwork obstacle, or high-tier opposition.', perceptionExample: 'Detecting an encrypted radio blip in static; reading an alien micro-expression' },
  { dc: 25, label: 'Extreme', desc: 'Legendary difficulty; nearly impossible without specialized training or traits.', perceptionExample: 'Spotting an active optical-camo cloaked assassin; finding a microscopic wiretap' },
  { dc: 30, label: 'Heroic', desc: 'Feats bordering on miracle; world-class or cinematic actions.', perceptionExample: 'Detecting a planar displacement microsecond before rift opens; sensing subtle air pressure shift' },
  { dc: 35, label: 'Mythic', desc: 'Godlike or cosmic-scale endeavors pushing the boundaries of reality.', perceptionExample: 'Perceiving Progenitor hyper-spatial code strings interwoven with reality' }
];

const SITUATIONAL_PERCEPTION_MODIFIERS = [
  { condition: 'Dim Light / Partial Concealment', mod: '-2', type: 'Penalty', desc: 'Shadows, fog, heavy rain, or foliage obscuring vision' },
  { condition: 'Pitch Darkness / Thick Smoke', mod: '-5', type: 'Severe Penalty', desc: 'Zero ambient light; requires thermal, night vision, or attune senses' },
  { condition: 'Target in Active Stealth', mod: 'Opposed', type: 'Contest', desc: "Perception check opposed by target's Agility + Stealth roll" },
  { condition: 'Extreme Range (>100m)', mod: '-2 / bracket', type: 'Distance', desc: 'Each additional 100 meters imposes cumulative -2 without optical magnification' },
  { condition: 'Sensory Overload / Flashbang', mod: '-4', type: 'Disorientation', desc: 'Sudden high-decibel or blinding flash disorients for 1d4 rounds' },
  { condition: 'Familiar Target / Known Scent', mod: '+2', type: 'Bonus', desc: 'Tracking an ally, familiar scent, or previously analyzed energy resonance' },
  { condition: 'High-Ground Vantage Point', mod: '+2', type: 'Bonus', desc: 'Elevated line-of-sight overlooking open terrain or crowds' }
];

const DETECTION_MODES = [
  {
    id: 'alertness',
    name: 'Alertness',
    subtitle: 'Default Environmental Awareness',
    skillKey: 'alertness',
    icon: Target,
    color: 'cyan',
    badge: 'Base + Alertness',
    description: 'General passive and active situational awareness. Spot visual/auditory anomalies, concealed tripwires, mechanical traps, camouflaged predators, ambush setups, and sudden peripheral movement.'
  },
  {
    id: 'attune',
    name: 'Attune',
    subtitle: 'Metaphysical & Psionic Senses',
    skillKey: 'attune',
    icon: Sparkles,
    color: 'amber',
    badge: 'Base + Attune',
    description: 'Sensing invisible metaphysical flows, psychic emanations, planar distortions, cloaked spirits, active spell signatures, and ancient eldritch relics. Functions as an ethereal sensory radar.'
  },
  {
    id: 'insight',
    name: 'Insight',
    subtitle: 'Social & Psychological Discernment',
    skillKey: 'insight',
    icon: MessageSquare,
    color: 'emerald',
    badge: 'Base + Insight',
    description: 'Reading micro-expressions, tonal inflection, pupil dilation, and nervous body language to determine true intentions, spot fabricated lies, identify blackmail vulnerability, or predict combat feints.'
  },
  {
    id: 'tech',
    name: 'Technical',
    subtitle: 'Hardware, Scans & Electronic Diagnostics',
    skillKey: 'technology',
    icon: Cpu,
    color: 'blue',
    badge: 'Base + Tech',
    description: 'Interpreting active sensor array telemetry, infrared thermography, micro-transmitter frequencies, structural weak points in bulkheads, electronic surveillance bugs, and sabotaged machinery.'
  }
];

export const PerceptionRulesModal = ({ 
  isOpen, 
  onClose, 
  characterData = {}, 
  getAttrTotal = () => 0, 
  derivedStats = {} 
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'modes' | 'modifiers' | 'dcs'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const getNum = (id, defaultVal = 0) => parseInt(characterData[id] || defaultVal, 10);

  // Live Perception calculations
  const intellectTotal = getAttrTotal('attr-intellect');
  const wisdomTotal = getAttrTotal('attr-wisdom');
  const alertnessMod = getNum('skill-mental-alertness-mod');
  const alertnessRank = getNum('skill-mental-alertness-rank');
  const attuneMod = getNum('skill-meta-attune-mod');
  const attuneRank = getNum('skill-meta-attune-rank');
  const insightMod = getNum('skill-social-insight-mod');
  const insightRank = getNum('skill-social-insight-rank');
  const techMod = getNum('skill-mental-technology-mod');
  const techRank = getNum('skill-mental-technology-rank');

  const basePerception = intellectTotal + wisdomTotal;
  const alertPerception = basePerception + alertnessRank + alertnessMod;
  const metaPerception = basePerception + attuneRank + attuneMod;
  const socialPerception = basePerception + insightRank + insightMod;
  const techPerception = basePerception + techRank + techMod;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b111c] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-4 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-slate-100 space-y-6 my-4 sm:my-6">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-500/40 text-cyan-300">
                <Eye size={22} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-200">
                  Perception Rules &amp; Detection Codex
                </h2>
                <p className="text-xs text-slate-400">
                  Canonical Tangent Science Fantasy Roleplay Sensory Mechanics, Detection Modes &amp; DCs
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <X size={14} />
            <span>Close Codex</span>
          </button>
        </div>

        {/* Live Active Hero Perception Telemetry */}
        <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 space-y-3 shadow-inner">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Activity size={14} className="text-cyan-400" />
              Operative Perception Telemetry
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-600/50 text-cyan-300 font-bold">
              Base Formula: INT ({intellectTotal}) + WIS ({wisdomTotal}) = {basePerception}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Base Perception</div>
              <div className="text-xl font-black text-cyan-300">{basePerception}</div>
              <div className="text-[9px] text-slate-500">INT + WIS</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-cyan-600/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <div className="text-[10px] uppercase font-bold text-cyan-300">Alertness (Default)</div>
              <div className="text-xl font-black text-cyan-200">{alertPerception}</div>
              <div className="text-[9px] text-cyan-400/80">Base + {alertnessRank + alertnessMod} Alert</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              <div className="text-[10px] uppercase font-bold text-amber-400">Meta (Attune)</div>
              <div className="text-xl font-black text-amber-300">{metaPerception}</div>
              <div className="text-[9px] text-amber-400/80">Base + {attuneRank + attuneMod} Attune</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-emerald-600/60 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Social (Insight)</div>
              <div className="text-xl font-black text-emerald-300">{socialPerception}</div>
              <div className="text-[9px] text-emerald-400/80">Base + {insightRank + insightMod} Insight</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-blue-600/60 shadow-[0_0_10px_rgba(59,130,246,0.1)] col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-blue-400">Tech (Knowledge)</div>
              <div className="text-xl font-black text-blue-300">{techPerception}</div>
              <div className="text-[9px] text-blue-400/80">Base + {techRank + techMod} Tech</div>
            </div>
          </div>
        </div>

        {/* Navigation & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'Complete Codex', icon: '📋' },
              { id: 'modes', label: '4 Detection Modes', icon: '🎯' },
              { id: 'modifiers', label: 'Situational Modifiers', icon: '⚠️' },
              { id: 'dcs', label: 'Difficulty Benchmarks', icon: '🧭' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search perception rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Core Philosophy Section */}
        {(activeTab === 'all' || activeTab === 'modes') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <BookOpen size={14} className="text-cyan-400" />
              Perception Philosophy &amp; Roll Mechanics
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In Tangent Science Fantasy Roleplay, <strong className="text-cyan-300">Perception</strong> is not an isolated attribute rolled alone. 
              Instead, it represents a character’s innate sensory acuity, mental clarity, and subconscious environmental processing derived from 
              <strong className="text-amber-300"> Intellect</strong> and <strong className="text-emerald-300">Wisdom</strong>.
            </p>
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200">
              <strong className="text-cyan-100">Canonical Roll Formula:</strong> When an operative conducts a sensory detection check, they roll:
              <div className="font-mono font-bold text-cyan-300 mt-1 bg-slate-950/80 p-2.5 rounded border border-cyan-700/40 text-center sm:text-left">
                Check Result = 2d10 + Perception Base (INT + WIS) + Relevant Skill Modifier + Circumstance Modifiers
              </div>
            </div>
          </div>
        )}

        {/* 4 Detection Modes */}
        {(activeTab === 'all' || activeTab === 'modes') && (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>🎯</span> The 4 Canonical Sensory Detection Channels
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {DETECTION_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <div key={mode.id} className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 space-y-2 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Icon size={15} className="text-cyan-400" />
                        <span>{mode.name} — {mode.subtitle}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50 shrink-0">
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Environmental & Situational Modifiers */}
        {(activeTab === 'all' || activeTab === 'modifiers') && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300">
              <AlertTriangle size={14} className="text-amber-400" />
              Environmental &amp; Situational Modifiers
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                    <th className="py-2 px-3">Condition</th>
                    <th className="py-2 px-2 text-center">Modifier</th>
                    <th className="py-2 px-2 text-center">Type</th>
                    <th className="py-2 px-3">Tactical Effect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {SITUATIONAL_PERCEPTION_MODIFIERS.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 font-semibold text-slate-200">{m.condition}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-amber-300">{m.mod}</td>
                      <td className="py-2 px-2 text-center font-mono text-[10px] text-slate-400">{m.type}</td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{m.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Challenge Ratings / DCs */}
        {(activeTab === 'all' || activeTab === 'dcs') && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300">
              <Compass size={14} className="text-cyan-400" />
              Perception Challenge Ratings &amp; Benchmarks (DCs)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                    <th className="py-2 px-3">DC Target</th>
                    <th className="py-2 px-2">Difficulty Tier</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Operational Sample</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {CHALLENGE_RATINGS.map((cr) => (
                    <tr key={cr.dc} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 font-mono font-bold text-cyan-300">DC {cr.dc}</td>
                      <td className="py-2 px-2 font-bold text-slate-200">{cr.label}</td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{cr.desc}</td>
                      <td className="py-2 px-3 text-slate-300 text-[11px] font-sans">{cr.perceptionExample}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default React.memo(PerceptionRulesModal);
