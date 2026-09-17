/**
 * @file ModuleCatalogPanel.tsx
 * @description Left Zone: Module Catalog & Campaign Outliner.
 * Features a 48px vertical category rail and an outliner tree
 * reading directly from CampaignContext, FolioContext, and Omnicortex DBM.
 */

import React, { useState, useMemo } from 'react';
import { useCampaign } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { useDBM } from '../../../context/DBMContext';
import { DEFAULT_WEAPONRY } from '../../../data/weaponryData';
import { DEFAULT_ARMORING } from '../../../data/armoringData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
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
  const { universeState, elementsCatalog } = useCampaign();
  const folio = (useFolio() || {}) as any;
  const dbm = (useDBM() || {}) as any;
  const dbData = dbm.dbData || {};

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
    const adePersonasCount = (elementsCatalog || []).filter((e: any) => e.type === 'Persona').length;
    const adeItemsCount = (elementsCatalog || []).filter((e: any) => e.type === 'Item').length;
    const adeFactionsCount = (elementsCatalog || []).filter((e: any) => e.type === 'Faction').length;
    const adeLoreCount = (elementsCatalog || []).filter((e: any) => ['Clue', 'Lore', 'Document', 'Location', 'Quest'].includes(e.type)).length;

    const scenarioEncountersCount = scenarios.reduce((acc: number, s: any) => acc + (s.encounters?.length || 0), 0);
    const bestiaryCount = dbData?.bestiary?.length || dbData?.species?.length || DEFAULT_SPECIES.length;
    const factionsCount = (dbData?.factions?.length || DEFAULT_FACTIONS.length) + adeFactionsCount;
    const armoryCount = (dbData?.weaponry?.length || DEFAULT_WEAPONRY.length) +
      (dbData?.armoring?.length || DEFAULT_ARMORING.length) +
      (dbData?.gear?.length || 0) +
      customItems.length +
      adeItemsCount;

    return {
      scenes: maps.length,
      story: scenarios.length + (storyCards.length > 0 ? 1 : 0),
      personae: rosterCount + adePersonasCount,
      encounters: scenarioEncountersCount + bestiaryCount,
      factions: factionsCount,
      lore: (storyCards.length || 0) + (universeState?.lore?.length || 0) + adeLoreCount,
      armory: armoryCount,
      assets: customAssetsCount
    };
  }, [universeState, folio, dbData, elementsCatalog]);

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

