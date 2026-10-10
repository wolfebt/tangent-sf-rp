import React from 'react';
import { categoryConfig } from './categoryConfig';
import { AudioService } from '../../services/audioService';

/**
 * Standardized metadata mapping for Property and World sub-directories.
 * Provides custom iconography, color accents, badges, and crisp high-tech descriptions.
 */
const SUBITEM_METADATA = {
  // --- Property & Armory Subcategories ---
  weaponry: {
    icon: '⚔️',
    color: 'amber',
    pill: 'Combat',
    tagline: 'Offensive armaments, firearms, blades, and heavy ordnance.'
  },
  armoring: {
    icon: '🛡️',
    color: 'emerald',
    pill: 'Defense',
    tagline: 'Body armor, tactical shields, power suits, and carapaces.'
  },
  gear: {
    icon: '🎒',
    color: 'cyan',
    pill: 'Field Gear',
    tagline: 'Field kits, surveillance gadgets, sensors, and persona tools.'
  },
  augmentations: {
    icon: '🦾',
    color: 'rose',
    pill: 'Bionics',
    tagline: 'Cyberware, biomechanical organs, and neural implants.'
  },
  mecha: {
    icon: '🤖',
    color: 'purple',
    pill: 'Vehicles',
    tagline: 'Piloted combat walkers, starcraft, atmospheric hovers, and rigs.'
  },
  architecture: {
    icon: '🏛️',
    color: 'blue',
    pill: 'Facilities',
    tagline: 'Fortifications, safehouses, research laboratories, and orbital bases.'
  },
  other: {
    icon: '📦',
    color: 'slate',
    pill: 'Property',
    tagline: 'Commodities, trade goods, precious relics, and currency stores.'
  },

  // --- World Design & Cosmology Subcategories ---
  planetary_design: {
    icon: '🪐',
    color: 'amber',
    pill: 'Cosmology',
    tagline: 'Planetary specs, UWP ratings, atmosphere, and biosystem data.'
  },
  universe: {
    icon: '🌌',
    color: 'indigo',
    pill: 'Macrocosm',
    tagline: 'Multiverse coordinates, reality frameworks, and cosmic scale.'
  },
  philosophy: {
    icon: '⚖️',
    color: 'purple',
    pill: 'Ideology',
    tagline: 'Belief systems, religions, dogma, cults, and philosophical orders.'
  },
  factions: {
    icon: '🚩',
    color: 'emerald',
    pill: 'Societies',
    tagline: 'Megacorporations, syndicates, military polities, and factions.'
  },
  technology: {
    icon: '💡',
    color: 'cyan',
    pill: 'Tech Matrix',
    tagline: 'Technological profiles, energy matrices, and scientific paradigms.'
  },
  setting: {
    icon: '📍',
    color: 'blue',
    pill: 'Locales',
    tagline: 'Strategic locations, spaceports, districts, and environmental hubs.'
  },
  scene: {
    icon: '🎬',
    color: 'rose',
    pill: 'Narrative',
    tagline: 'AIME narrative beats, dramatic hooks, clues, and encounter scenes.'
  }
};

const DEFAULT_ICONS = {
  armoring: '🛡️',
  weaponry: '⚔️',
  gear: '🎒',
  augmentations: '🦾',
  mecha: '🤖',
  architecture: '🏛️',
  other: '📦',
  planetary_design: '🪐',
  universe: '🌌',
  philosophy: '⚖️',
  factions: '🚩',
  technology: '💡',
  setting: '📍',
  scene: '🎬'
};

export const DBMLandingView = ({ parentKey, onNavigateToSubItem, dbData = {} }) => {
  const config = categoryConfig[parentKey] || {};
  const subItems = config.subItems || [];
  const isProperty = parentKey === 'personal_property';

  // Compute total entries count across all sub-items
  const totalAssetsCount = subItems.reduce((acc, subKey) => {
    return acc + (Array.isArray(dbData[subKey]) ? dbData[subKey].length : 0);
  }, 0);

  const handleCardClick = (subKey) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onNavigateToSubItem) {
      onNavigateToSubItem(subKey);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 sm:p-5 overflow-y-auto w-full no-scrollbar">
      {/* Compact Parent Category Header */}
      <div className="border-b border-slate-800/80 pb-3 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border flex items-center justify-center text-lg ${
            isProperty 
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
              : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
          }`}>
            {isProperty ? '📦' : '🌌'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">
                {config.label || (isProperty ? 'PROPERTY & ARMORY' : 'WORLD DESIGN & COSMOLOGY')}
              </h2>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                isProperty 
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' 
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
              }`}>
                {subItems.length} SUB-DIRECTORIES
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {isProperty 
                ? 'Unified database index for offensive ordnance, armoring, field gear, bionics, and assets.' 
                : 'Planetary specifications, macroscopic cosmology, philosophies, polities, and setting profiles.'}
            </p>
          </div>
        </div>

        {totalAssetsCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0 self-start sm:self-auto">
            <span className="text-slate-500 uppercase font-semibold">Total Records:</span>
            <span className="text-cyan-300 font-bold">{totalAssetsCount}</span>
          </div>
        )}
      </div>

      {/* Compact Responsive Sub-Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {subItems.map(subKey => {
          const subConfig = categoryConfig[subKey];
          if (!subConfig) return null;

          const meta = SUBITEM_METADATA[subKey] || {};
          const count = Array.isArray(dbData[subKey]) ? dbData[subKey].length : null;

          return (
            <div
              key={subKey}
              onClick={() => handleCardClick(subKey)}
              className="bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/70 p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] flex flex-col justify-between group text-left shadow-sm select-none"
            >
              <div>
                {/* Card Top Row: Icon + Title + Count Badge */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-base shrink-0 group-hover:scale-105 group-hover:border-cyan-500/50 transition-all shadow-inner">
                      {meta.icon || DEFAULT_ICONS[subKey] || '📂'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wide truncate">
                        {subConfig.label}
                      </h3>
                      {meta.pill && (
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight block">
                          {meta.pill}
                        </span>
                      )}
                    </div>
                  </div>

                  {count !== null && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-900 text-slate-300 border border-slate-700/80 shrink-0 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors">
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </span>
                  )}
                </div>

                {/* Description Excerpt */}
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-2 font-sans">
                  {meta.tagline || subConfig.description || `Manage ${subConfig.label.toLowerCase()} entries, TL/ML requirements, and mechanics.`}
                </p>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[9.5px]">
                  DIR: {subKey}
                </span>
                <span className="text-cyan-400 group-hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[10px]">
                  <span>Explore</span>
                  <span>➔</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DBMLandingView;
