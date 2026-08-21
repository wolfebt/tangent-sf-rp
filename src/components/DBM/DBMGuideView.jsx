import React from 'react';

export const DBMGuideView = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] border border-[#0D5C63]/60 rounded-xl p-6 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full shadow-2xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <span className="text-3xl">📚</span>
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            Omnicortex User Guide &amp; System Manual
          </h2>
          <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest mt-0.5">
            Tangent SFF RPG Master Database Operations
          </p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <h3 className="text-base font-bold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>🌐</span> 1. Omnicortex System Overview
          </h3>
          <p className="text-slate-300">
            The <strong className="text-cyan-300">Omnicortex (DBM)</strong> is the master rules codex and compendium for Tangent Science Fantasy Roleplay. 
            It contains authoritative reference data across 13 core categories:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
            {[
              { cat: 'Rules Codex', icon: '📜', desc: 'Core game mechanics & combat systems' },
              { cat: 'Species', icon: '🧬', desc: 'Biological species & trait profiles' },
              { cat: 'Factions', icon: '⚔️', desc: 'Organizations, cartels & empires' },
              { cat: 'Occupations', icon: '💼', desc: 'Origins & archetype backgrounds' },
              { cat: 'Skills', icon: '🎯', desc: 'Proficiencies, ranks & stat links' },
              { cat: 'Features', icon: '⚡', desc: 'Special talents, traits & flaw entries' },
              { cat: 'Weaponry', icon: '🔫', desc: 'Ballistic, energy & melee arms' },
              { cat: 'Armoring', icon: '🛡️', desc: 'Protective gear, suits & shields' },
              { cat: 'Mecha', icon: '🤖', desc: 'Heavy frame units & vehicle systems' },
              { cat: 'Powers', icon: '✨', desc: 'Psionic talents & meta-tech powers' },
              { cat: 'Prerequisites', icon: '🔑', desc: 'Requirements for skills & traits' },
              { cat: 'Modifiers', icon: '📊', desc: 'Stat modifiers & mechanical buffs' },
            ].map(item => (
              <div key={item.cat} className="bg-slate-800/60 border border-slate-700/50 rounded p-2">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>{item.icon}</span> {item.cat}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{item.detail || item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Species & Traits Architecture */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <h3 className="text-base font-bold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>🧬</span> 2. Species Builder &amp; Multiple Traits System
          </h3>
          <p className="text-slate-300 mb-3 text-xs leading-relaxed">
            The Species system is composed of modular biological layers designed for deep customization and precise stat mechanics:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-3">
              <div className="font-bold text-cyan-300 uppercase mb-1">🧬 Development Sub-Trait Catalogs</div>
              <p className="text-slate-400">
                In the Dev menu, architects have direct access to define and balance <strong>Types</strong>, <strong>Sizes</strong>, <strong>Movements</strong>, and <strong>Traits</strong>.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded p-3">
              <div className="font-bold text-cyan-300 uppercase mb-1">✨ Multiple Selection Traits</div>
              <p className="text-slate-400">
                Species can select multiple distinct traits (adaptations, resistances, innate abilities) via the relational selector. All trait modifiers automatically propagate into character stats and economy budgets.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <h3 className="text-base font-bold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>🎮</span> 2. Game Mode vs. Dev Mode
          </h3>
          <p className="mb-3">
            Toggle between operational modes using the top header button:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-emerald-500/30 rounded-lg p-4">
              <div className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-1">
                🛡️ Game Mode (Read-Only)
              </div>
              <p className="text-xs text-slate-300">
                Tailored for live gaming sessions. Displays clean, read-only entries with search and filter controls. Prevents accidental modifications during play.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-4">
              <div className="text-amber-400 font-bold uppercase text-xs tracking-wider mb-1">
                ⚙️ Dev Mode (Editable)
              </div>
              <p className="text-xs text-slate-300">
                Enables complete content management: create new entries, edit fields, modify schemas, delete outdated entries, and view developer-only categories (Prerequisites, Modifiers).
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <h3 className="text-base font-bold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>👁️</span> 3. Wiki View vs. Catalog Grid
          </h3>
          <p className="text-slate-300">
            Switch between presentation layouts using the view mode toggle:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300 text-xs">
            <li><strong className="text-amber-300">Wiki View:</strong> Structured document reader style for deep lore reading, full rules codex documentation, and comprehensive entry detail pages.</li>
            <li><strong className="text-amber-300">Catalog Grid:</strong> Responsive card grid view optimal for quickly browsing items, filtering by sub-types, and comparing gear or ability stats.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <h3 className="text-base font-bold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>💾</span> 4. JSON Import / Export &amp; Cloud Storage
          </h3>
          <p className="text-slate-300">
            Omnicortex supports full offline portability and cloud synchronization:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded p-3">
              <div className="font-bold text-cyan-300 uppercase mb-1">📥 JSON Export</div>
              <p className="text-slate-400">Export the entire Omnicortex database or specific categories to standalone .JSON files for offline backup or sharing.</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/40 rounded p-3">
              <div className="font-bold text-cyan-300 uppercase mb-1">📤 JSON Import</div>
              <p className="text-slate-400">Import custom JSON datasets into your session to add third-party homebrew content or restore rules backups.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <h3 className="text-base font-bold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>🔗</span> 5. Integration with Folio &amp; Foundry
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            Omnicortex entries automatically feed into other Tangent applications. When building an operative in <strong className="text-cyan-300">Persona Folio</strong>, skill selections, features, and weapon databases pull directly from the Omnicortex master catalog. Similarly, <strong className="text-cyan-300">Story Foundry</strong> elements link to Omnicortex lore entries for consistent world-building.
          </p>
        </section>
      </div>
    </div>
  );
};

