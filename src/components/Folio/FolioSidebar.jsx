import React from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'identity', label: 'Identity' },
  { id: 'core-stats', label: 'Core Stats' },
  { id: 'skills', label: 'Skills' },
  { id: 'abilities', label: 'Abilities' },
  { id: 'combat-gear', label: 'Combat & Gear' },
  { id: 'narrative', label: 'Narrative' },
  { id: 'other', label: 'Other' }
];

const FolioSidebar = ({ activeTab, setActiveTab, charName, onOpenBastion }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-[#0d1117] border-r border-[#0D5C63]/50 p-4 flex flex-col h-full flex-shrink-0">
      {/* Title Header */}
      <div className="mb-6 border-b border-[#0D5C63]/40 pb-4">
        <div 
          onClick={() => navigate('/')}
          className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse cursor-pointer hover:opacity-80 transition-opacity"
          title="Return to Home"
        >
          <span className="text-[2rem] font-bold leading-none">TANGENT</span>
          <span className="text-[1rem] leading-none">SCIENCE FANTASY ROLEPLAY</span>
          <span className="text-[1.5rem] font-bold leading-none">PERSONA FOLIO</span>
        </div>
        <h2 className="text-sm font-bold font-mono text-amber-400 truncate uppercase mt-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
          {charName ? charName.toUpperCase() : 'UNNAMED'}
        </h2>
      </div>

      {/* Tabs List */}
      <nav className="flex flex-col space-y-1.5 flex-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
              activeTab === tab.id
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Bastion AI Toggle Button */}
      <div className="mt-auto pt-3 pb-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onOpenBastion}
          className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 rounded-lg text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2"
        >
          <span>🤖</span> BASTION AI
        </button>
      </div>

      {/* Footer Branding */}
      <div className="pt-2 text-[10px] text-slate-500 font-mono text-center">
        WOLFE.BT@TANGENTLLC
      </div>
    </div>
  );
};

export default React.memo(FolioSidebar);
