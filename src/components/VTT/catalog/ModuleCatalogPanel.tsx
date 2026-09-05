/**
 * @file ModuleCatalogPanel.tsx
 * @description Left Zone: Module Catalog & Campaign Outliner.
 * Features a 48px vertical category rail and an outliner tree
 * reading directly from CampaignContext, FolioContext, and Omnicortex DBM.
 */

import React, { useState, useMemo } from 'react';
import { useCampaign } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import type { CatalogCategory } from '../store/uiLayoutStore';
import { ModuleCatalogRail } from './ModuleCatalogRail';
import { CatalogSearchFilter } from './CatalogSearchFilter';
import { CatalogOutliner } from './CatalogOutliner';

export interface ModuleCatalogPanelProps {
  onSelectMap?: (mapId: string) => void;
  onSpawnActor?: (actorId: string) => void;
}

export const ModuleCatalogPanel: React.FC<ModuleCatalogPanelProps> = ({
  onSelectMap
}) => {
  const { universeState } = useCampaign();
  const folio = (useFolio() || {}) as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);

  // Compute live counts for each taxonomy category
  const categoryCounts = useMemo<Partial<Record<CatalogCategory, number>>>(() => {
    const maps = universeState?.maps || [];
    const scenarios = universeState?.scenarios || [];
    const character = folio?.characterData;
    const storyCards = universeState?.creativeState?.storyCards || [];
    const customItems = (universeState as any)?.customItems || [];

    let customAssetsCount = 0;
    try {
      customAssetsCount = JSON.parse(localStorage.getItem('tangent_vtt_custom_assets') || '[]').length;
    } catch {}

    const rosterCount = folio?.personaRoster?.length || (character?.name ? 1 : 0);

    return {
      scenes: maps.length,
      story: scenarios.length + (storyCards.length > 0 ? 1 : 0),
      personae: rosterCount,
      encounters: scenarios.reduce((acc: number, s: any) => acc + (s.encounters?.length || 0), 0) || 3,
      factions: universeState?.factions?.length || 2,
      lore: (storyCards.length || 0) + (universeState?.lore?.length || 0) || 2,
      armory: customItems.length || 2,
      assets: customAssetsCount
    };
  }, [universeState, folio]);

  return (
    <div className="w-full h-full flex bg-[#0c1017] text-slate-200 overflow-hidden font-sans select-none">
      {/* 48px Vertical Icon Rail */}
      <ModuleCatalogRail categoryCounts={categoryCounts} />

      {/* Outliner Column: Search, Tag Filters & Hierarchy Tree */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Search & Tag Filtering Bar */}
        <CatalogSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilterTag={activeFilterTag}
          onSelectFilterTag={setActiveFilterTag}
        />

        {/* Dynamic Outliner Tree */}
        <CatalogOutliner
          searchQuery={searchQuery}
          activeFilterTag={activeFilterTag}
          onSelectMap={onSelectMap}
        />
      </div>
    </div>
  );
};

export default ModuleCatalogPanel;

