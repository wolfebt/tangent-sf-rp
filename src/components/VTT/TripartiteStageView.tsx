/**
 * @file TripartiteStageView.tsx
 * @description Tripartite VTT Master Viewport for Tangent SF RP.
 * Integrates Left Module Catalog, Center StageViewportWrapper (Breadcrumbs + Canvas + Token Pill),
 * and Right Operative Cockpit inside the responsive TripartiteLayout.
 */

import React from 'react';
import { TripartiteLayout } from './TripartiteLayout';
import { StageViewportWrapper } from './stage/StageViewportWrapper';
import { ModuleCatalogPanel } from './catalog/ModuleCatalogPanel';
import { CockpitPanel } from './cockpit/CockpitPanel';
import type { StageViewProps } from './StageView';
import { useCampaign } from '../../context/CampaignContext';

export const TripartiteStageView: React.FC<StageViewProps> = (props) => {
  const { setActiveMapId } = useCampaign();

  return (
    <TripartiteLayout
      leftPanel={
        <ModuleCatalogPanel
          onSelectMap={(id) => {
            if (setActiveMapId) setActiveMapId(id);
          }}
        />
      }
      centerStage={<StageViewportWrapper {...props} />}
      rightPanel={<CockpitPanel />}
      className="w-full h-full"
    />
  );
};

export default TripartiteStageView;
