/**
 * @file ModuleCatalogRail.tsx
 * @description Standardized Guidance Rail for Category Switching across the 7 Module Taxonomies.
 * Displays interactive glowing category icons with visible monospace labels, tooltips, and badge counters.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  Map, 
  Users, 
  Swords, 
  Shield, 
  Scroll, 
  Package, 
  FolderOpen 
} from 'lucide-react';
import { useUILayoutStore } from '../store/uiLayoutStore';
import type { CatalogCategory } from '../store/uiLayoutStore';
import { AudioService } from '../../../services/audioService';

export interface CategoryRailItem {
  id: CatalogCategory;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  badgeCount?: number;
}

export interface ModuleCatalogRailProps {
  categoryCounts?: Partial<Record<CatalogCategory, number>>;
}

export const ModuleCatalogRail: React.FC<ModuleCatalogRailProps> = ({
  categoryCounts = {}
}) => {
  const { activeCategory, setActiveCategory } = useUILayoutStore();
  const [hoveredCat, setHoveredCat] = useState<{ cat: CategoryRailItem; rect: DOMRect } | null>(null);

  const categories: CategoryRailItem[] = [
    { 
      id: 'scenes', 
      label: 'SCENES', 
      sublabel: 'Scenes & Tactical Maps',
      icon: <Map size={17} />, 
      color: 'text-cyan-400',
      badgeCount: categoryCounts.scenes
    },
    { 
      id: 'story', 
      label: 'STORY', 
      sublabel: 'Story Arcs & Beats',
      icon: <BookOpen size={17} />, 
      color: 'text-purple-400',
      badgeCount: categoryCounts.story
    },
    { 
      id: 'personae', 
      label: 'PERSONAE', 
      sublabel: 'Dramatis Personae & Roster',
      icon: <Users size={17} />, 
      color: 'text-emerald-400',
      badgeCount: categoryCounts.personae
    },
    { 
      id: 'encounters', 
      label: 'COMBAT', 
      sublabel: 'Encounters & Hazards',
      icon: <Swords size={17} />, 
      color: 'text-rose-400',
      badgeCount: categoryCounts.encounters
    },
    { 
      id: 'factions', 
      label: 'FACTIONS', 
      sublabel: 'Factions & Organizations',
      icon: <Shield size={17} />, 
      color: 'text-amber-400',
      badgeCount: categoryCounts.factions
    },
    { 
      id: 'lore', 
      label: 'LORE', 
      sublabel: 'Lore & Handouts',
      icon: <Scroll size={17} />, 
      color: 'text-sky-400',
      badgeCount: categoryCounts.lore
    },
    { 
      id: 'armory', 
      label: 'ARMORY', 
      sublabel: 'Compendium Armory',
      icon: <Package size={17} />, 
      color: 'text-indigo-400',
      badgeCount: categoryCounts.armory
    },
    {
      id: 'assets', 
      label: 'ASSETS', 
      sublabel: 'Media Library & Tokens',
      icon: <FolderOpen size={17} />, 
      color: 'text-teal-400',
      badgeCount: categoryCounts.assets
    }
  ];

  const handleSelect = (id: CatalogCategory) => {
    AudioService.playTerminalBeep(1150, 0.02);
    setActiveCategory(id);
  };

  return (
    <nav 
      className="w-16 sm:w-18 shrink-0 h-full border-r border-slate-800/90 bg-[#070a12]/95 backdrop-blur-md flex flex-col items-center py-2 px-1 gap-1 z-10 select-none overflow-y-auto no-scrollbar font-sans"
      aria-label="Module Catalog Categories"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = cat.badgeCount;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleSelect(cat.id)}
            onMouseEnter={(e) => setHoveredCat({ cat, rect: e.currentTarget.getBoundingClientRect() })}
            onMouseLeave={() => setHoveredCat(null)}
            className={`group relative w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-gradient-to-b from-cyan-500/25 to-blue-950/40 text-cyan-200 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
            }`}
            title={`${cat.sublabel}${count !== undefined ? ` (${count})` : ''}`}
          >
            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}

            {/* Icon Container with Badge */}
            <div className="relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center shrink-0">
              <span className={isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200 transition-colors'}>
                {cat.icon}
              </span>

              {/* Numerical Badge Counter */}
              {count !== undefined && count > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[13px] h-[13px] rounded-full bg-slate-900 border border-cyan-500/40 text-[8px] font-mono text-cyan-300 flex items-center justify-center font-bold shadow-sm">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>

            {/* Visible Monospace Label Underneath Icon */}
            <span
              className={`font-mono text-[8.5px] sm:text-[9px] uppercase tracking-wider text-center mt-0.5 truncate max-w-full leading-tight select-none transition-colors ${
                isActive
                  ? 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.5)]'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {cat.label}
            </span>
          </button>
        );
      })}

      {/* Topmost Portal Floating Tooltip */}
      {hoveredCat && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[999999] pointer-events-none px-2.5 py-1 rounded-lg bg-[#0c1017] border border-slate-700 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-xl animate-in fade-in duration-100 hidden md:block"
          style={{
            left: `${hoveredCat.rect.right + 10}px`,
            top: `${hoveredCat.rect.top + hoveredCat.rect.height / 2}px`,
            transform: 'translateY(-50%)',
            zIndex: 999999
          }}
        >
          <div className="text-cyan-300 font-bold">{hoveredCat.cat.label}</div>
          <div className="text-[9.5px] text-slate-400 font-normal">{hoveredCat.cat.sublabel}</div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default ModuleCatalogRail;
