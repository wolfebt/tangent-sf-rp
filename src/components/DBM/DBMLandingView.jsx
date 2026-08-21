import React from 'react';
import { categoryConfig } from './categoryConfig';

export const DBMLandingView = ({ parentKey, onNavigateToSubItem }) => {
  const config = categoryConfig[parentKey] || {};
  const subItems = config.subItems || [];

  const iconsMap = {
    armoring: '🛡️',
    weaponry: '⚔️',
    gear: '🎒',
    mecha: '🤖',
    other: '📦',
    species_type: '🧬',
    species_size: '📏',
    species_movement: '🏃',
    trait: '✨'
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-8 overflow-y-auto max-w-5xl mx-auto w-full">
      <div className="border-b border-slate-800 pb-4 mb-8">
        <span className="text-xs text-amber-500 font-bold uppercase tracking-widest block mb-1">Parent Category</span>
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider">{config.label || parentKey}</h2>
        <p className="text-xs text-slate-400 mt-2">
          Select a sub-category below to manage equipment, inventory, and property items.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {subItems.map(subKey => {
          const subConfig = categoryConfig[subKey];
          if (!subConfig) return null;

          return (
            <div
              key={subKey}
              onClick={() => onNavigateToSubItem(subKey)}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-500/80 p-6 rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] flex flex-col justify-between group"
            >
              <div>
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {iconsMap[subKey] || '📂'}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wide">
                  {subConfig.label}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                  Manage {subConfig.label.toLowerCase()} entries, properties, TL/ML requirements, and mechanics.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-xs text-cyan-400 font-bold uppercase">
                <span>Explore Category</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
