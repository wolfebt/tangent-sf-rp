import React, { useState } from 'react';
import { categoryConfig } from './categoryConfig';

export const DBMSidebar = ({
  mainCategories,
  devCategories,
  activeCategory,
  currentKey,
  navigateToCategory,
  onOpenBastion
}) => {
  const [isDevExpanded, setIsDevExpanded] = useState(false);

  return (
    <aside className="w-64 h-full bg-[#090d16] border-r border-[#0D5C63]/40 flex flex-col shrink-0 p-2 gap-1 overflow-hidden">
      <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest px-3 py-1 mb-1 border-b border-slate-800 shrink-0">
        Categories
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto pr-1">
        {mainCategories.map(catKey => {
          const config = categoryConfig[catKey];
          const isActive = activeCategory === catKey || categoryConfig[activeCategory]?.parent === catKey;

          return (
            <div key={catKey} className="flex flex-col">
              <button
                onClick={() => navigateToCategory(catKey)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-cyan-950/80 text-[#22d3ee] border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{config.label}</span>
                {(config.isParent || config.subcategories) && <span className="text-[10px] text-slate-500">▼</span>}
              </button>

              {/* Parent subItems rendering (e.g. Personal Property -> Gear, Weaponry, Armoring...) */}
              {config.isParent && isActive && config.subItems && (
                <div className="pl-4 my-1 flex flex-col gap-0.5 border-l-2 border-cyan-500/40 ml-3">
                  {config.subItems.map(subKey => {
                    const subConfig = categoryConfig[subKey];
                    if (!subConfig) return null;
                    const isSubActive = currentKey === subKey || activeCategory === subKey;
                    return (
                      <div key={subKey} className="flex flex-col">
                        <button
                          onClick={() => navigateToCategory(subKey)}
                          className={`w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold uppercase transition-colors ${
                            isSubActive
                              ? 'text-cyan-300 font-bold bg-cyan-900/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          {subConfig.label}
                        </button>
                      
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Direct inline subcategories rendering (e.g. Species -> Types, Sizes, Movements) */}
              {!config.isParent && config.subcategories && isActive && (
                <div className="pl-4 my-1 flex flex-col gap-0.5 border-l-2 border-cyan-500/40 ml-3">
                  <button
                    onClick={() => navigateToCategory(catKey, null)}
                    className={`w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold uppercase transition-colors ${
                      currentKey === catKey
                        ? 'text-cyan-300 font-bold bg-cyan-900/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    Overview
                  </button>
                  {Object.keys(config.subcategories).map(subKey => {
                    const subConfig = config.subcategories[subKey];
                    if (!subConfig) return null;
                    const isSubActive = currentKey === subKey;
                    return (
                      <button
                        key={subKey}
                        onClick={() => navigateToCategory(catKey, subKey)}
                        className={`w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold uppercase transition-colors ${
                          isSubActive
                            ? 'text-cyan-300 font-bold bg-cyan-900/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        {subConfig.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Development Categories — accordion (collapsed by default) */}
        <div className="mt-4 pt-2 border-t border-slate-800 flex flex-col gap-1">
          <button
            onClick={() => setIsDevExpanded(!isDevExpanded)}
            className="w-full flex items-center justify-between px-3 py-1 mb-1 text-[10px] font-bold text-amber-500/90 uppercase tracking-widest hover:text-amber-400 transition-colors"
          >
            <span>Development</span>
            <span>{isDevExpanded ? '▲' : '▼'}</span>
          </button>
          
          {isDevExpanded && devCategories.map(devKey => {
            const config = categoryConfig[devKey];
            const isActive = currentKey === devKey;
            return (
              <button
                key={devKey}
                onClick={() => navigateToCategory(devKey)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bastion AI Toggle Button */}
      <div className="mt-auto pt-3 pb-2 border-t border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onOpenBastion}
          className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 rounded-lg text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2"
        >
          <span>🤖</span> BASTION AI
        </button>
      </div>

      {/* Footer Branding */}
      <div className="pt-2 text-[10px] text-slate-500 font-mono text-center shrink-0">
        WOLFE.BT@TANGENTLLC
      </div>
    </aside>
  );
};

