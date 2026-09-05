/**
 * @file ModuleCatalogRail.tsx
 * @description 48px Vertical Icon Rail for Category Switching across the 7 Module Taxonomies.
 * Displays interactive glowing category icons with tooltips and badge counters.
 */

import React from 'react';
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

export interface CategoryRailItem {
  id: CatalogCategory;
  label: string;
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

  const categories: CategoryRailItem[] = [
    { 
      id: 'scenes', 
      label: 'Scenes & Maps', 
      icon: <Map size={18} />, 
      color: 'text-cyan-400',
      badgeCount: categoryCounts.scenes
    },
    { 
      id: 'story', 
      label: 'Story Arcs', 
      icon: <BookOpen size={18} />, 
      color: 'text-purple-400',
      badgeCount: categoryCounts.story
    },
    { 
      id: 'personae', 
      label: 'Dramatis Personae', 
      icon: <Users size={18} />, 
      color: 'text-emerald-400',
      badgeCount: categoryCounts.personae
    },
    { 
      id: 'encounters', 
      label: 'Encounters & Hazards', 
      icon: <Swords size={18} />, 
      color: 'text-red-400',
      badgeCount: categoryCounts.encounters
    },
    { 
      id: 'factions', 
      label: 'Factions & Orgs', 
      icon: <Shield size={18} />, 
      color: 'text-amber-400',
      badgeCount: categoryCounts.factions
    },
    { 
      id: 'lore', 
      label: 'Lore & Handouts', 
      icon: <Scroll size={18} />, 
      color: 'text-sky-400',
      badgeCount: categoryCounts.lore
    },
    { 
      id: 'armory', 
      label: 'Compendium Armory', 
      icon: <Package size={18} />, 
      color: 'text-indigo-400',
      badgeCount: categoryCounts.armory
    },
    {
      id: 'assets',
      label: 'Assets & Media Library',
      icon: <FolderOpen size={18} />,
      color: 'text-teal-400',
      badgeCount: categoryCounts.assets
    }
  ];

  return (
    <nav 
      className="w-12 shrink-0 h-full border-r border-slate-800/80 bg-[#090d13] flex flex-col items-center py-2.5 gap-2 z-10 select-none"
      aria-label="Module Catalog Categories"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = cat.badgeCount;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer group ${
              isActive
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={`${cat.label}${count !== undefined ? ` (${count})` : ''}`}
          >
            {cat.icon}

            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute -left-1 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400" />
            )}

            {/* Numerical Badge Counter */}
            {count !== undefined && count > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-slate-800 border border-slate-700 text-[8px] font-mono text-slate-300 flex items-center justify-center font-bold">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default ModuleCatalogRail;
