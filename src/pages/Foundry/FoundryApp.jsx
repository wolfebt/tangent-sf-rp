import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppShell from '../../components/Layout/AppShell';
import { CampaignProvider, useCampaign } from '../../context/CampaignContext';
import SyncConflictModal from '../../components/StoryFoundry/SyncConflictModal';

import Dashboard from './Dashboard/Dashboard';
import MapMaker from './MapMaker/MapMaker';
import AIME from './AIME/AIME';
import PlayerSpectatorView from './MapMaker/PlayerSpectatorView';
const ADEStage = lazy(() => import('../../components/VTT/TripartiteStageView'));
const StoryModule = lazy(() => import('./StoryModule/StoryModule'));

const VttOptionsRedirect = () => {
  const location = useLocation();
  const search = location.search;
  const target = `/foundry/stage${search ? (search.includes('options=') ? search : `${search}&options=true`) : '?options=true'}`;
  return <Navigate to={target} replace />;
};

const SearchPreservingRedirect = ({ to }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};

const FoundryAppInner = () => {
  const { syncConflict, resolveConflictOverwrite, resolveConflictPull, resolveConflictCancel } = useCampaign();
  
  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<StoryModule />} />
          <Route path="mission-control" element={<StoryModule defaultView="mission_control" />} />
          <Route path="dashboard" element={<StoryModule defaultView="mission_control" />} />
          <Route path="hub" element={<StoryModule defaultView="mission_control" />} />
          <Route path="live" element={<StoryModule defaultView="scenarios" defaultWorkspaceTab="stage" />} />
          <Route path="live-studio" element={<StoryModule defaultView="scenarios" defaultWorkspaceTab="stage" />} />
          <Route path="ade-stage" element={<StoryModule defaultView="scenarios" defaultWorkspaceTab="stage" />} />
          <Route path="live-studio-standalone" element={<SearchPreservingRedirect to="/foundry/live" />} />
          <Route path="stage" element={<ADEStage />} />
          <Route path="ade" element={<StoryModule />} />
          <Route path="story" element={<StoryModule />} />
          <Route path="interactive" element={<StoryModule defaultView="interactive" />} />
          <Route path="narrative" element={<StoryModule defaultView="scenarios" />} />
          <Route path="scripts" element={<StoryModule defaultView="scripts" />} />
          <Route path="presets" element={<StoryModule defaultView="scripts" />} />
          <Route path="automation" element={<StoryModule defaultView="scripts" />} />
          <Route path="assets" element={<StoryModule defaultView="gallery" />} />
          <Route path="elements" element={<StoryModule defaultView="gallery" />} />
          <Route path="gallery" element={<StoryModule defaultView="gallery" />} />
          <Route path="graph" element={<StoryModule defaultView="graph" />} />
          <Route path="tactical" element={<StoryModule defaultView="control-panel" />} />
          <Route path="catalog" element={<Dashboard />} />
          <Route path="map" element={<MapMaker />} />
          <Route path="map-maker" element={<MapMaker />} />
          <Route path="map-maker-legacy" element={<MapMaker />} />
          <Route path="vtt-options" element={<VttOptionsRedirect />} />
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
