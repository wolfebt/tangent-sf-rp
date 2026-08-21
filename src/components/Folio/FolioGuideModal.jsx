import React, { useState } from 'react';

const SECTIONS = [
  { id: 'overview', label: '📋 Overview', icon: '📋' },
  { id: 'identity', label: '🪪 Identity', icon: '🪪' },
  { id: 'core-stats', label: '📊 Core Stats', icon: '📊' },
  { id: 'skills', label: '🎯 Skills', icon: '🎯' },
  { id: 'abilities', label: '⚡ Abilities', icon: '⚡' },
  { id: 'combat-gear', label: '⚔️ Combat & Gear', icon: '⚔️' },
  { id: 'narrative', label: '📝 Narrative', icon: '📝' },
  { id: 'other', label: '🗂️ Other', icon: '🗂️' },
  { id: 'roster', label: '📇 Roster & Cloud', icon: '📇' },
  { id: 'cp', label: '💎 CP Economy', icon: '💎' },
];

const CONTENT = {
  overview: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Persona Folio</strong> is your personal character sheet for Tangent Science Fantasy Roleplay. 
        It tracks every aspect of your operative — from their biological identity to their combat loadout and narrative history.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider">Quick Start</h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-sm">
          <li>Sign in with Google to enable cloud save &amp; roster features.</li>
          <li>Use the <strong className="text-amber-300">Identity</strong> tab to set your name, species, origin, and augmentations.</li>
          <li>Allocate your <strong className="text-amber-300">CP Budget</strong> across Core Stats, Skills, and Abilities.</li>
          <li>Fill out <strong className="text-amber-300">Combat &amp; Gear</strong> with your offensive and defensive loadout.</li>
          <li>Save your character to cloud via <strong className="text-amber-300">File Menu → Save to Cloud</strong>.</li>
        </ol>
      </div>
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-4">
        <h4 className="text-amber-400 font-bold uppercase text-xs tracking-wider mb-2">⚠️ CP Budget Rule</h4>
        <p className="text-slate-300 text-sm">
          All character build choices cost <strong>Character Points (CP)</strong>. The default starting budget is <strong className="text-cyan-300">150 CP</strong>. 
          Going over budget makes your sheet <span className="text-red-400 font-bold">illegal</span> — a red alert banner will appear.
        </p>
      </div>
    </div>
  ),
  identity: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Identity</strong> tab captures the core biographical and biological attributes of your operative.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Character Name', desc: 'Your operative\'s in-world name. Appears throughout the Folio header.' },
          { label: 'Species', desc: 'Determines baseline biological traits, size, movement, and species traits. Multiple selected traits and stat modifiers automatically calculate into your attributes and budget.' },
          { label: 'Origin', desc: 'Your operative\'s background story archetype. Provides CP bonuses and starting skills.' },
          { label: 'Augmentations', desc: 'Cybernetic or biological enhancements installed on the operative. Each costs CP and may grant stat modifiers.' },
          { label: 'Age / Height / Weight', desc: 'Descriptive biography fields for roleplay immersion.' },
          { label: 'Portrait', desc: 'Optional image URL or upload for visual character representation.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[130px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'core-stats': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Core Attributes</strong> define your operative's fundamental capabilities. Each attribute point costs CP.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { stat: 'STR', label: 'Strength / Might', desc: 'Physical power, melee force, sub-attribute Might.' },
          { stat: 'AGI', label: 'Agility / Reflex', desc: 'Dexterity, evasion, reaction, sub-attribute Reflex & Initiative.' },
          { stat: 'STA', label: 'Stamina / Fortitude', desc: 'Physical endurance, toxin resistance, sub-attribute Fortitude & Health pool.' },
          { stat: 'INT', label: 'Intellect / Logic', desc: 'Knowledge, tech operations, analysis, sub-attribute Logic.' },
          { stat: 'WIS', label: 'Wisdom / Will', desc: 'Perception, mental focus, psionic attunement, sub-attribute Will & Vitality pool.' },
          { stat: 'CHA', label: 'Charisma / Etiquette', desc: 'Presence, leadership, negotiation, sub-attribute Etiquette.' },
        ].map(s => (
          <div key={s.stat} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-cyan-400 font-bold text-sm font-mono">{s.stat}</span>
              <span className="text-slate-300 font-bold text-xs">{s.label}</span>
            </div>
            <p className="text-slate-400 text-xs">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/60 border border-emerald-500/20 rounded-lg p-4 space-y-1">
        <h4 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-2">Derived Vitals & Pools</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Health', formula: 'Base 30 + Fortitude Bonus', color: 'text-emerald-400' },
            { label: 'Vitality', formula: 'Base 30 + Will Bonus', color: 'text-cyan-400' },
            { label: 'Karma', formula: 'Magic Level / Karma Rank', color: 'text-amber-400' },
          ].map(d => (
            <div key={d.label} className="bg-slate-900/60 rounded p-2">
              <div className={`font-bold ${d.color}`}>{d.label}</div>
              <div className="text-slate-400 font-mono text-[10px]">{d.formula}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  skills: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Skills</strong> represent trained proficiencies your operative has developed. Skills are organized by category and each has a rank (Novice → Expert → Master → Legend).
      </p>
      <div className="space-y-3">
        {[
          { label: 'Adding Skills', desc: 'Use the "+ Add Skill" button to browse and purchase skills from the database. Each skill costs CP based on its rank.' },
          { label: 'Specializations', desc: 'Many skills have Specializations — focused sub-disciplines that provide additional bonuses within a narrow domain.' },
          { label: 'Skill Tabs', desc: 'Skills are grouped by category (Combat, Technical, Social, Psionic, etc.) for easier navigation.' },
          { label: 'Linked Stat', desc: 'Each skill links to a Core Stat, which adds its modifier to rolls when that skill is used.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  abilities: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Abilities</strong> are special powers, features, and flaws that define your operative's unique traits beyond standard skills.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Features', desc: 'Positive passive or active abilities — species traits, trained talents, or unlocked powers. Most cost CP.' },
          { label: 'Flaws', desc: 'Negative traits that grant CP back when taken. Mechanically balance builds and add roleplay depth.' },
          { label: 'Powers', desc: 'Active meta-psionic or tech-based abilities with defined activation costs, ranges, and effects.' },
          { label: 'Custom Entries', desc: 'GMs and players can add freeform custom abilities outside the standard database.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[130px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'combat-gear': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Combat &amp; Gear</strong> tab tracks your operative's weaponry, defensive equipment, and tactical loadout.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Offensive', desc: 'Log weapons with Name, Skill used, Effect/Damage, Type, Range, and Rate of Fire. Add multiple weapons with separate entries.' },
          { label: 'Defensive', desc: 'Record armor and shields with Name, Resistance value, Type, and Coverage area.' },
          { label: 'Encumbrance', desc: 'Total carried gear weight is compared against your STR-based carry capacity. Exceeding it applies penalties.' },
          { label: 'Quick Notes', desc: 'A freeform combat notes field for special tactics, maneuvers, or GM rulings specific to this character.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[120px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  narrative: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Narrative</strong> system provides a comprehensive 31-field story editor organized across four dedicated sub-tabs. 
        You can draft content manually or use <strong className="text-amber-300">Bastion AI</strong> to auto-generate or refine any field.
      </p>
      
      <div className="space-y-3">
        {[
          { 
            tab: '1. Biography & Identity', 
            icon: '📜',
            fields: 'Backstory, Origin Story, Turning Points, Physicality, Speech & Demeanor, Public Profile, Hidden Secrets',
            desc: 'Foundational history, physical presence, social reputation, and classified personal secrets.'
          },
          { 
            tab: '2. Psychology & Persona', 
            icon: '🧠',
            fields: 'Core Beliefs, Moral Boundaries, Motivations, Fears & Phobias, Quirks & Habits, Traumas & Scars, Psychological Flaws',
            desc: 'Internal psyche, moral compass, driving impulses, behavioral quirks, and psychological vulnerabilities.'
          },
          { 
            tab: '3. Factions & Connections', 
            icon: '👥',
            fields: 'Faction Affiliations, Key Allies, Rivals & Enemies, Mentors & Protégés, Family & Heritage, Contacts & Informants, Debts & Obligations',
            desc: 'Social network, faction ties, interpersonal bonds, informants, and financial or moral IOUs.'
          },
          { 
            tab: '4. Logistics & Operations', 
            icon: '🛰️',
            fields: 'Operational Assets, Safehouses & Bases, Vehicles & Mounts, Financial Standing, Mission History, Special Directives, GM Notes & Secrets, Milestones, Goals, Artifacts',
            desc: 'Tactical infrastructure, headquarters, wealth, directives, personal relics, and GM-only secrets.'
          },
        ].map(group => (
          <div key={group.tab} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">{group.icon}</span>
              <span className="text-cyan-300 font-bold text-xs uppercase tracking-wide">{group.tab}</span>
            </div>
            <div className="text-amber-300/90 text-xs font-mono">{group.fields}</div>
            <p className="text-slate-300 text-xs">{group.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3 text-xs text-slate-300">
        🤖 <strong>Bastion AI Assistant:</strong> Click the <strong>🤖 BASTION</strong> button in the narrative tab to open the AI drawer. Bastion can generate custom text snippets for any of the 31 fields based on your character\'s core identity and stats.
      </div>
    </div>
  ),
  other: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Other</strong> tab is a flexible space for additional character data that doesn't fit neatly into the main tabs.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Property & Real Estate', desc: 'Vehicles, real estate, starships, faction assets, and significant possessions not tracked as combat gear.' },
          { label: 'Special Contacts', desc: 'NPCs the operative has active relationships with — informants, vendors, mentors, rivals.' },
          { label: 'Debts & Obligations', desc: 'Mechanical or narrative commitments the character owes to factions or individuals.' },
          { label: 'Custom Tracking Fields', desc: 'Freeform fields for campaign-specific tracking (mission logs, condition tokens, reputation meters).' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[160px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  roster: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Roster</strong> allows you to maintain, switch, and back up multiple operatives across your campaign universe.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Save to Roster', desc: 'Click the 📇 Roster button and use "Save Current to Roster" to store a snapshot of your active character.' },
          { label: 'Switch Operative', desc: 'Open the Roster modal and click any character card to instantly load their complete sheet.' },
          { label: 'Duplicate Character', desc: 'Duplicate any existing roster entry to quickly create character variants, clones, or backup snapshots.' },
          { label: 'Character Deletion', desc: 'Safely remove retired characters from your local roster database with confirmation.' },
          { label: 'Cloud Save & Sync', desc: 'Use File Menu → Save to Cloud to persist your character to your authenticated Google account for access across devices.' },
          { label: 'Public Link Sharing', desc: 'Mark a persona as Public to generate a read-only shareable link. Other players can view and clone it to their own roster.' },
          { label: 'Local JSON File', desc: 'Export character sheets to standalone .JSON files for offline backup and restore.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  cp: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Character Points (CP)</strong> are the universal currency for building your operative. Every choice costs CP drawn from your starting budget.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider">CP Budget Bar &amp; Over-Budget Alert</h4>
        <p className="text-slate-300 text-sm">
          The header bar displays your real-time spent vs. available CP (default 150 CP). If expenditures exceed budget, a red <strong className="text-red-400">ILLEGAL BUILD</strong> banner appears. 
          Click the CP bar to open the full <strong className="text-amber-300">Economy Breakdown</strong> itemization modal.
        </p>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Starting CP Budget', desc: 'Default 150 CP. GMs may award additional CP for campaign milestones or story achievements.' },
          { label: 'Core Stats', desc: 'Each stat point costs a fixed CP amount scaling with value.' },
          { label: 'Skills & Ranks', desc: 'Skill ranks (Novice → Master → Legend) cost CP. Specializations add targeted bonus bonuses for extra CP.' },
          { label: 'Features & Flaws', desc: 'Features cost CP. Flaws grant CP back (negative cost), balancing your build.' },
          { label: 'Augmentations', desc: 'Cybernetic and biological enhancements cost CP based on tier complexity.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FolioGuideModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-6 sm:pt-10 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] border border-[#0D5C63]/60 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-4xl mx-4 flex overflow-hidden"
        style={{ height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="w-52 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Persona Folio</div>
                <div className="text-xs font-bold text-white">User Guide</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                  activeSection === s.id
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-800">
            <div className="text-[9px] text-slate-600 font-mono uppercase tracking-widest text-center">
              Tangent SFF RPG v2.0
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs font-bold uppercase transition-colors border border-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {CONTENT[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
};
