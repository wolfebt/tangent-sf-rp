import React from 'react';
import { Database, BookOpen, ExternalLink, Shield, Sparkles, Cpu, Layers } from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const DBMGuideView = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] border border-[#0D5C63]/60 rounded-2xl p-6 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full shadow-2xl space-y-6 text-slate-300 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Database size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                MASTER RULES COMPENDIUM
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">•</span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">OMNICORTEX DBM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white uppercase font-mono tracking-wider mt-0.5">
              Omnicortex System Manual &amp; Operations
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1200, 0.03);
            window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'dbm' } }));
          }}
          className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>Open Full System Guide</span>
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Section 1: Overview */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-bold text-emerald-400 uppercase font-mono tracking-wide flex items-center gap-2">
          <span>🌐</span> 1. Omnicortex System Overview &amp; Compendium
        </h3>
        <p className="text-sm leading-relaxed">
          The <strong className="text-emerald-300 font-mono">Omnicortex (DBM)</strong> is the relational database and rules compendium for Tangent Science Fantasy Roleplay. It acts as the single source of truth for all game rules, species traits, weapon matrices, cybernetics, and psychic disciplines.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 text-xs">
          {[
            { cat: 'Rules Codex', icon: '📜', desc: 'Core game mechanics & combat systems' },
            { cat: 'Species Matrix', icon: '🧬', desc: 'Biological profiles & multi-trait selection' },
            { cat: 'Factions & Cartels', icon: '⚔️', desc: 'Organizations, syndicates & empires' },
            { cat: 'Occupations', icon: '💼', desc: 'Origins, career paths & archetype skills' },
            { cat: 'Skills Compendium', icon: '🎯', desc: 'Proficiencies, ranks & stat links' },
            { cat: 'Features & Talents', icon: '⚡', desc: 'Special powers, perks & flaw point rebates' },
            { cat: 'Weaponry Matrix', icon: '🔫', desc: 'Ballistic, plasma, laser & melee arms' },
            { cat: 'Armor & Shields', icon: '🛡️', desc: 'Protective gear, suits & coverage zones' },
            { cat: 'Mecha Frames', icon: '🤖', desc: 'Heavy chassis, propulsion & hardpoints' },
            { cat: 'Powers & Psionics', icon: '✨', desc: 'Psionic talents & meta-tech disciplines' },
            { cat: 'Prerequisites', icon: '🔑', desc: 'Requirements for high-tier capabilities' },
            { cat: 'Modifiers & Buffs', icon: '📊', desc: 'Global stat modifiers & status conditions' },
          ].map(item => (
            <div key={item.cat} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1 font-mono text-[11px]">
                <span>{item.icon}</span> {item.cat}
              </div>
              <div className="text-slate-400 text-[10px] leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Dual Modes */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-bold text-cyan-400 uppercase font-mono tracking-wide flex items-center gap-2">
          <span>🎮</span> 2. Game Mode vs. Architect Dev Mode
        </h3>
        <p className="text-sm leading-relaxed">
          Toggle operational modes using the top header to control editing privileges:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
            <div className="text-emerald-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Shield size={15} /> Game Mode (Read-Only)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Designed for live gameplay. Displays clean entries with high-speed search and category filters. Protects the compendium against accidental edits.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4 space-y-1.5">
            <div className="text-amber-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles size={15} /> Architect Dev Mode (Full Edit &amp; Schemas)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Unlocks complete content authoring: create new entries, customize JSON schemas, add development fields, and generate content via Bastion AI.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Layout Views */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-bold text-amber-400 uppercase font-mono tracking-wide flex items-center gap-2">
          <span>👁️</span> 3. Wiki Document View vs. Catalog Table Grid
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
          <li><strong className="text-amber-300 font-mono">Wiki View:</strong> Rich, article-style document layout ideal for reading deep worldbuilding lore, full rule codex chapters, and complete species profiles.</li>
          <li><strong className="text-cyan-300 font-mono">Catalog Table View:</strong> High-density data grid for comparing gear stats, sorting by Tech Level, filtering damage formulas, and fast lookup.</li>
        </ul>
      </section>

      {/* Section 4: JSON Backup & Storage */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-bold text-purple-400 uppercase font-mono tracking-wide flex items-center gap-2">
          <span>💾</span> 4. Master JSON Backup &amp; Offline Portability
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Click <strong className="text-cyan-300 font-mono">System Tools → Master Export</strong> to download the entire compendium into a single standalone <code className="text-amber-300 font-mono">.json</code> file. GMs and Administrators can use <strong className="text-emerald-300 font-mono">Master Import</strong> to restore databases with 450-op chunked batch writes to protect Firebase quotas.
        </p>
      </section>
    </div>
  );
};

export default DBMGuideView;
