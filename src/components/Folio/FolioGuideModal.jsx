import React, { useState } from 'react';
import { BookOpen, ExternalLink, Sparkles, Users } from 'lucide-react';
import { AudioService } from '../../services/audioService';

const SECTIONS = [
  { id: 'overview', label: '📋 Overview & Quickstart', icon: '📋' },
  { id: 'creator', label: '🧙 Guided Creator Wizard', icon: '🧙' },
  { id: 'cp', label: '💎 150 CP Economy & Legality', icon: '💎' },
  { id: 'identity', label: '🪪 Identity & Species', icon: '🪪' },
  { id: 'core-stats', label: '📊 Core Stats & Vitals', icon: '📊' },
  { id: 'skills', label: '🎯 Skills & Specializations', icon: '🎯' },
  { id: 'abilities', label: '⚡ Abilities, Powers & Flaws', icon: '⚡' },
  { id: 'combat-gear', label: '⚔️ Combat & Loadout', icon: '⚔️' },
  { id: 'narrative', label: '📝 31-Field Narrative & AI', icon: '📝' },
  { id: 'other', label: '🗂️ Property & Logistics', icon: '🗂️' },
  { id: 'roster', label: '📇 Roster, Cloud & Sharing', icon: '📇' },
  { id: 'print', label: '🖨️ Printable Folio Export', icon: '🖨️' },
];

const CONTENT = {
  overview: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Persona Folio</strong> is the official digital operative sheet manager for Tangent Science Fantasy Roleplay. 
        It integrates biological lineage accounting, point-buy economy calculation, live derived vitals, combat loadout tracking, and an extensive 31-field narrative story writer.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/30 rounded-xl p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs font-mono tracking-wider">Quick Start Workflow</h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300">
          <li><strong>Sign in with Google:</strong> Enables instant Firestore cloud synchronization and cross-device roster access.</li>
          <li><strong>Launch Guided Creator:</strong> Click <strong className="text-amber-300">🧙 Guided Creator</strong> for an 8-step character generation wizard, or edit tabs manually.</li>
          <li><strong>Tune CP Budget:</strong> Spend your <strong className="text-cyan-300">150 Character Points (CP)</strong> across Core Attributes, Skills, and Abilities.</li>
          <li><strong>Equip Combat Gear:</strong> Add weaponry, kinetic/energy armor suits, and inventory gear.</li>
          <li><strong>Flesh out Backstory:</strong> Use the 31-field Narrative editor with <strong className="text-purple-300">🤖 Bastion AI</strong> to draft deep lore.</li>
          <li><strong>Save &amp; Share:</strong> Use <strong className="text-emerald-300">File → Save to Cloud</strong>, or toggle Public Sharing to distribute your character URL.</li>
        </ol>
      </div>
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 space-y-1">
        <h4 className="text-amber-400 font-bold uppercase text-xs font-mono tracking-wider flex items-center gap-1.5">
          ⚠️ CP Legality Enforcement
        </h4>
        <p className="text-xs text-slate-300">
          All character build choices draw from your <strong className="text-cyan-300 font-mono">150 CP Budget</strong>. 
          Exceeding budget triggers a pulsating red <span className="text-red-400 font-bold font-mono">ILLEGAL BUILD</span> alert. Click the CP meter to inspect line-item costs.
        </p>
      </div>
    </div>
  ),

  creator: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Guided Creator Wizard</strong> provides a streamlined, step-by-step onboarding process to create balanced operatives in minutes:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {[
          { step: '1. Concept & Identity', desc: 'Operative name, general archetype concept, personality style, and motivation.' },
          { step: '2. Species Lineage', desc: 'Select biological species. Automatically applies inherent attribute modifiers and racial traits.' },
          { step: '3. Origin & Faction', desc: 'Choose your home faction or syndicate, granting thematic starting skills.' },
          { step: '4. Occupation & Career', desc: 'Select your operative role (Commando, Hacker, Psion, Medic, Tech-Priest, Smuggler).' },
          { step: '5. Core Attributes', desc: 'Distribute points across STR, AGI, STA, INT, WIS, CHA with real-time CP budget deduction.' },
          { step: '6. Technology Level (TL)', desc: 'Set starting gear tier from TL3 (Modern) to TL7 (High Cybernetic / Meta-Tech).' },
          { step: '7. Skills & Features', desc: 'Allocate background proficiencies, special talents, and optional flaws for CP rebates.' },
          { step: '8. Review & Finalize', desc: 'Inspect full character sheet preview and commit directly to your active roster.' },
        ].map(s => (
          <div key={s.step} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
            <div className="font-bold text-amber-300 font-mono uppercase mb-1">{s.step}</div>
            <p className="text-slate-400 text-[11px]">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  cp: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        <strong className="text-cyan-300 font-mono">Character Points (CP)</strong> are the universal mechanical currency for character balance in Tangent SFF RP.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-xl p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs font-mono tracking-wider">Economy Breakdown Breakdown</h4>
        <div className="space-y-2 text-xs">
          {[
            { item: 'Starting Budget', cost: '150 CP (Standard Campaign Baseline)' },
            { item: 'Core Attributes (STR, AGI, STA, INT, WIS, CHA)', cost: 'Scaling cost per tier above zero base' },
            { item: 'Skill Proficiencies', cost: 'Novice (1 CP), Adept (2 CP), Expert (4 CP), Master (7 CP), Legend (10 CP)' },
            { item: 'Specializations', cost: '+1 CP per sub-discipline specialization focus' },
            { item: 'Features & Talents', cost: 'Positive traits cost 2 to 10 CP based on power level' },
            { item: 'Flaws & Hindrances', cost: 'Grants +2 to +8 CP refund (adds points back to spend)' },
            { item: 'Cybernetics & Augmentations', cost: 'Varies by Tech Level and essence footprint' },
          ].map(e => (
            <div key={e.item} className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="font-bold text-slate-200">{e.item}</span>
              <span className="text-amber-300 font-mono">{e.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  identity: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Identity</strong> tab defines your operative's biological traits, lineage, and physical profile.
      </p>
      <div className="space-y-2.5">
        {[
          { label: 'Character Name & Alias', desc: 'Operative handle and full name displayed across the system header and roster.' },
          { label: 'Species & Lineage', desc: 'Select from canon species (Human, Synthetic, Kitin, Saurian, Eldritch, etc.). Automatically imports trait modifiers.' },
          { label: 'Origin & Faction', desc: 'Your operative\'s cultural background, allegiance, and starting mechanical perks.' },
          { label: 'Augmentations & Cyberware', desc: 'Installed neural links, subdermal armor plates, and cybernetic limbs with tier accounting.' },
          { label: 'Physical Profile', desc: 'Age, gender, height, weight, body style, and portrait artwork URL/upload.' },
        ].map(f => (
          <div key={f.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex gap-3 items-start">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase font-mono">{f.label}</div>
            <div className="text-slate-300 text-xs">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  'core-stats': (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        <strong className="text-cyan-300 font-mono">Core Attributes</strong> govern all dice rolls, difficulty checks, and derived survival pools.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {[
          { stat: 'STR (Strength)', sub: 'Might', desc: 'Physical power, melee strike damage, athletics, and encumbrance limit.' },
          { stat: 'AGI (Agility)', sub: 'Reflex & Initiative', desc: 'Manual dexterity, ranged weapon aim, evasion, acrobatics, and turn speed.' },
          { stat: 'STA (Stamina)', sub: 'Fortitude', desc: 'Endurance, poison/radiation resistance, and basis for total Health pool.' },
          { stat: 'INT (Intellect)', sub: 'Logic', desc: 'Scientific knowledge, cybertech hacking, weapon crafting, and tactical analysis.' },
          { stat: 'WIS (Wisdom)', sub: 'Will', desc: 'Perception, mental fortitude, intuition, and basis for Vitality/Karma pool.' },
          { stat: 'CHA (Charisma)', sub: 'Etiquette', desc: 'Social presence, persuasion, leadership, intimidation, and faction standing.' },
        ].map(s => (
          <div key={s.stat} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-cyan-300 font-mono">{s.stat}</span>
              <span className="text-[10px] text-amber-300 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">Sub: {s.sub}</span>
            </div>
            <p className="text-slate-400 text-[11px]">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/70 border border-emerald-500/30 rounded-xl p-4 space-y-2">
        <h4 className="text-emerald-400 font-bold uppercase text-xs font-mono tracking-wider">Derived Vitals Formulas</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="font-bold text-emerald-300">Health Pool</div>
            <div className="text-slate-400 font-mono text-[10px]">30 + (Fortitude × 2)</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="font-bold text-cyan-300">Vitality Pool</div>
            <div className="text-slate-400 font-mono text-[10px]">30 + (Will × 2)</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="font-bold text-amber-300">Karma Pool</div>
            <div className="text-slate-400 font-mono text-[10px]">Meta Level / Psionic Rank</div>
          </div>
        </div>
      </div>
    </div>
  ),

  skills: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        <strong className="text-cyan-300 font-mono">Skills</strong> represent learned expertise. When rolling skill tests, your operative adds <code className="text-amber-300 font-mono">Linked Attribute Mod + Skill Rank Mod</code> to the 2d10 roll.
      </p>
      <div className="space-y-2">
        {[
          { label: 'Skill Ranks', desc: 'Novice (+1), Adept (+2), Expert (+3), Master (+4), Legend (+5).' },
          { label: 'Specializations', desc: 'Targeted sub-disciplines granting an extra +2 circumstance bonus when acting within that exact niche.' },
          { label: 'Category Filter', desc: 'Browse skills filtered by Combat, Technical, Physical, Social, Psionic, and Academic groups.' },
        ].map(f => (
          <div key={f.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="text-amber-300 font-bold text-xs uppercase font-mono mb-0.5">{f.label}</div>
            <div className="text-slate-300 text-xs">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  abilities: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Abilities</strong> tab tracks supernatural talents, psionic disciplines, species features, and mechanical hindrances:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-emerald-300 font-mono uppercase mb-1">⚡ Features & Talents</div>
          <p className="text-slate-400 text-[11px]">Special combat maneuvers, cybernetic perks, and species adaptations costing CP.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-red-300 font-mono uppercase mb-1">💔 Flaws & Hindrances</div>
          <p className="text-slate-400 text-[11px]">Physical vulnerabilities, psychological phobias, or bounty targets granting CP rebates.</p>
        </div>
      </div>
    </div>
  ),

  'combat-gear': (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Combat & Loadout</strong> tab manages offensive armaments and protective suits:
      </p>
      <div className="space-y-2 text-xs">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono uppercase mb-1">🔫 Weaponry Matrix Loadout</div>
          <p className="text-slate-400 text-[11px]">Track damage formulas (e.g. 2d10+4), Rate of Fire (Single, Burst, Full Auto), optimal range, magazine capacity, and weapon mods.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-cyan-300 font-mono uppercase mb-1">🛡️ Armor & Defense Weave</div>
          <p className="text-slate-400 text-[11px]">Logs Armor Resistance (AR) against Kinetic, Energy, Thermal, and Psionic damage types with coverage area percentages.</p>
        </div>
      </div>
    </div>
  ),

  narrative: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Narrative</strong> system provides a 31-field structured story writer organized into four distinct modules:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-cyan-300 font-mono uppercase mb-1">📜 1. Biography & Identity (7 fields)</div>
          <p className="text-slate-400 text-[11px]">Backstory, Origin Story, Turning Points, Physicality, Speech & Demeanor, Public Profile, Hidden Secrets.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-emerald-300 font-mono uppercase mb-1">🧠 2. Psychology & Persona (7 fields)</div>
          <p className="text-slate-400 text-[11px]">Core Beliefs, Moral Boundaries, Motivations, Fears & Phobias, Quirks & Habits, Traumas, Flaws.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono uppercase mb-1">👥 3. Factions & Connections (7 fields)</div>
          <p className="text-slate-400 text-[11px]">Faction Affiliations, Key Allies, Rivals & Enemies, Mentors & Protégés, Family, Contacts, Debts.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-purple-300 font-mono uppercase mb-1">🛰️ 4. Logistics & Operations (10 fields)</div>
          <p className="text-slate-400 text-[11px]">Operational Assets, Safehouses, Vehicles, Financial Standing, Mission History, Directives, GM Secrets, Milestones, Goals, Artifacts.</p>
        </div>
      </div>
      <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-xs text-slate-300 flex items-center gap-2">
        <Sparkles size={16} className="text-purple-400 shrink-0" />
        <span>Click the <strong className="text-purple-300 font-mono">🤖 BASTION</strong> button in the narrative tab to auto-generate or refine text snippets for any of the 31 fields using AI.</span>
      </div>
    </div>
  ),

  other: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Other</strong> tab tracks starships, vehicles, properties, active bounty contracts, and campaign notes.
      </p>
    </div>
  ),

  roster: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Roster</strong> enables operative management, cross-device cloud persistence, and public character sharing:
      </p>
      <div className="space-y-2 text-xs">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-cyan-300 font-mono uppercase mb-0.5">☁️ Cloud Save & Sync</div>
          <p className="text-slate-400 text-[11px]">Syncs your characters securely to your authenticated account in Google Cloud Firestore.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-emerald-300 font-mono uppercase mb-0.5">🔗 Public Read-Only Share Links</div>
          <p className="text-slate-400 text-[11px]">Toggle public sharing to generate a secure shareable link for other players and GMs to inspect or clone your character.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono uppercase mb-0.5">💾 JSON Export & Import</div>
          <p className="text-slate-400 text-[11px]">Download standalone character JSON backup files or import third-party character sheets.</p>
        </div>
      </div>
    </div>
  ),

  print: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        Click <strong className="text-cyan-300 font-mono">🖨️ Print Folio</strong> in the Folio header to render a clean, high-resolution physical tabletop character sheet formatted for standard letter/A4 paper and PDF printing.
      </p>
    </div>
  ),
};

export const FolioGuideModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] border border-cyan-500/50 rounded-2xl shadow-2xl shadow-black/80 w-full max-w-5xl h-[88vh] flex flex-col font-sans overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-cyan-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Users size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                PERSONA FOLIO
              </div>
              <div className="text-sm font-bold text-white uppercase font-mono">
                Operative Sheet User Guide &amp; Rules
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'folio' } }));
                onClose();
              }}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5"
              title="Open in Comprehensive Master Guide"
            >
              <span>Full System Guide</span>
              <ExternalLink size={12} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-bold uppercase transition-colors border border-slate-700"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* 2-Pane Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-56 sm:w-64 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0">
            <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setActiveSection(s.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all ${
                    activeSection === s.id
                      ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {CONTENT[activeSection]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolioGuideModal;
