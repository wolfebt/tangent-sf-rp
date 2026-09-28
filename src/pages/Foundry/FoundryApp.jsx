import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '../../components/Layout/AppShell';
import { CampaignProvider, useCampaign } from '../../context/CampaignContext';
import SyncConflictModal from '../../components/StoryFoundry/SyncConflictModal';

import Dashboard from './Dashboard/Dashboard';
import MapMaker from './MapMaker/MapMaker';
import AIME from './AIME/AIME';
import PlayerSpectatorView from './MapMaker/PlayerSpectatorView';
import VttOptionsPage from './MapMaker/VttOptionsPage';
const ADEStage = lazy(() => import('../../components/VTT/TripartiteStageView'));
const AdeLiveStudio = lazy(() => import('./LiveStudio/AdeLiveStudio'));
const StoryModule = lazy(() => import('./StoryModule/StoryModule'));

const FoundryAppInner = () => {
  const { syncConflict, resolveConflictOverwrite, resolveConflictPull, resolveConflictCancel } = useCampaign();
  
  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<StoryModule />} />
          <Route path="live-studio" element={<StoryModule defaultView="scenarios" defaultWorkspaceTab="stage" />} />
          <Route path="ade-stage" element={<StoryModule defaultView="scenarios" defaultWorkspaceTab="stage" />} />
          <Route path="live-studio-standalone" element={<AdeLiveStudio defaultSplit="side_by_side" />} />
          <Route path="stage" element={<ADEStage />} />
          <Route path="ade" element={<StoryModule />} />
          <Route path="story" element={<StoryModule />} />
          <Route path="interactive" element={<StoryModule defaultView="interactive" />} />
          <Route path="elements" element={<StoryModule defaultView="gallery" />} />
          <Route path="gallery" element={<StoryModule defaultView="gallery" />} />
          <Route path="graph" element={<StoryModule defaultView="graph" />} />
          <Route path="tactical" element={<StoryModule defaultView="control-panel" />} />
          <Route path="catalog" element={<Dashboard />} />
          <Route path="map-maker" element={<MapMaker />} />
          <Route path="map-maker-legacy" element={<MapMaker />} />
          <Route path="vtt-options" element={<VttOptionsPage />} />
          <Route path="aime" element={<AIME />} />
          <Route path="view/:mapId" element={<PlayerSpectatorView />} />
          <Route path="spectator/:mapId" element={<PlayerSpectatorView />} />
        </Routes>
      </AppShell>
      <SyncConflictModal
        isOpen={!!syncConflict}
        conflictData={syncConflict}
        onOverwrite={resolveConflictOverwrite}
        onPull={resolveConflictPull}
        onCancel={resolveConflictCancel}
      />
    </>
  );
};

const FoundryApp = () => {
  return <FoundryAppInner />;
};

export default FoundryApp;
