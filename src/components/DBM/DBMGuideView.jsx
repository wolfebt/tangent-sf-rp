import React from 'react';

export const DBMGuideView = () => {
  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-white mb-6 border-b border-slate-800 pb-4 uppercase tracking-wider">
        User Guide & System Documentation
      </h2>
      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h3 className="text-lg font-bold text-cyan-400 mb-2 uppercase">1. Project Overview</h3>
          <p>
            The <strong>Tangent SFF RPG Omnicortex (DBM)</strong> is the master repository for rules, species,
            factions, occupations, skills, features, weaponry, armoring, mecha, and powers.
          </p>
        </section>
        <section>
          <h3 className="text-lg font-bold text-cyan-400 mb-2 uppercase">2. Game Mode vs. Dev Mode</h3>
          <p>
            Use the <strong>GAME / DEV MODE</strong> toggle in the top header:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li><strong>Game Mode (Read-Only)</strong>: Clean view tailored for live gameplay sessions.</li>
            <li><strong>Dev Mode (Editable)</strong>: Enables item creation, editing, deletion, and access to internal developer categories (Modifiers, Prerequisites, Societies).</li>
          </ul>
        </section>
        <section>
          <h3 className="text-lg font-bold text-cyan-400 mb-2 uppercase">3. Local Data & JSON Export/Import</h3>
          <p>
            All database entries can be exported to offline JSON files or imported into your local session using the DATA controls inside entry windows.
          </p>
        </section>
      </div>
    </div>
  );
};
