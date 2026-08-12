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
          { label: 'Species', desc: 'Determines baseline biological traits, size, movement, and species-specific bonuses.' },
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
        <strong className="text-cyan-300">Core Stats</strong> define your operative's fundamental capabilities. Each stat point costs CP.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { stat: 'STR', label: 'Strength', desc: 'Physical power, melee damage, carrying capacity.' },
          { stat: 'DEX', label: 'Dexterity', desc: 'Agility, ranged accuracy, evasion, initiative.' },
          { stat: 'CON', label: 'Constitution', desc: 'Endurance, HP pool, resistance to toxins.' },
          { stat: 'INT', label: 'Intelligence', desc: 'Knowledge, tech-use, crafting, hacking.' },
          { stat: 'WIS', label: 'Wisdom', desc: 'Perception, intuition, meta-psionic resonance.' },
          { stat: 'CHA', label: 'Charisma', desc: 'Persuasion, leadership, social manipulation.' },
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
        <h4 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-2">Derived Stats</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'HP', formula: '10 + CON×2 + STR', color: 'text-emerald-400' },
            { label: 'Vitality', formula: 'CON + WIS', color: 'text-cyan-400' },
            { label: 'Karma', formula: 'WIS + CHA', color: 'text-amber-400' },
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
        The <strong className="text-cyan-300">Narrative</strong> tab holds the story-facing elements of your operative — written in first person or third person as suits your play style.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Backstory', desc: 'Long-form biography. Who were they before the campaign began? Key life events, traumas, triumphs.' },
          { label: 'Personality', desc: 'Core behavioral traits, speech patterns, philosophies, and moral compass.' },
          { label: 'Motivations', desc: 'What drives the character? What do they want, fear, or protect?' },
          { label: 'Connections', desc: 'Allies, rivals, enemies, family, faction ties, and obligations.' },
          { label: 'Notes', desc: 'GM and player notes, session logs, evolving story threads.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[130px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-lg p-3 text-xs text-slate-400">
        💡 All narrative fields auto-expand as you type. Single-line by default, they grow to accommodate any length of content.
      </div>
    </div>
  ),
  other: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Other</strong> tab is a flexible space for additional character data that doesn't fit neatly into the other tabs.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Property', desc: 'Vehicles, real estate, faction assets, and significant possessions not tracked as combat gear.' },
          { label: 'Contacts', desc: 'NPCs the operative has relationships with — informants, vendors, mentors, rivals.' },
          { label: 'Debts & Obligations', desc: 'Mechanical or narrative commitments the character owes to factions or individuals.' },
          { label: 'Custom Fields', desc: 'Freeform fields for campaign-specific tracking (mission logs, condition tokens, etc.).' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  roster: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Roster</strong> allows you to maintain multiple characters and switch between them instantly.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Save to Roster', desc: 'Click the 📇 Roster button and use "Save Current to Roster" to snapshot your active character.' },
          { label: 'Switch Characters', desc: 'Open the Roster and click any character card to load them as the active sheet.' },
          { label: 'Duplicate', desc: 'Duplicate any roster entry to quickly create variants or backup copies.' },
          { label: 'Cloud Save', desc: 'File Menu → Save to Cloud persists your character to your authenticated account, accessible from any device.' },
          { label: 'Public Sharing', desc: 'Mark a persona as Public to share a read-only link. Others can view and clone it to their own roster.' },
          { label: 'Local File', desc: 'Export to JSON for offline backup. Import JSON to restore. Files are portable between accounts.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[130px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  cp: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Character Points (CP)</strong> are the universal currency for building your operative. Every meaningful choice costs CP drawn from your starting budget.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider">CP Budget Bar</h4>
        <p className="text-slate-300 text-sm">
          The header bar shows your real-time spent vs. available CP. Click it to open the full <strong>Economy Breakdown</strong> modal, 
          which itemizes every CP expenditure by category.
        </p>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Starting CP', desc: 'Default 150 CP. GMs may award additional CP for campaign milestones or story achievements.' },
          { label: 'Core Stats', desc: 'Each stat point costs a fixed CP amount (scales with value). See the Rules Codex for exact costs.' },
          { label: 'Skills', desc: 'Skill ranks each cost CP. Specializations cost additional CP on top of the base skill.' },
          { label: 'Features', desc: 'Each Feature has a listed CP cost in the OmniCortex database.' },
          { label: 'Flaws', desc: 'Flaws grant CP back (negative cost), allowing you to offset other expenditures.' },
          { label: 'Augmentations', desc: 'Cybernetic and biological augmentations cost CP based on complexity tier.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[130px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
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
