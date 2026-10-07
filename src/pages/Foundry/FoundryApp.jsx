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

const FoundryRouteRedirect = ({ view, tab }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (view && !params.has('view')) {
    if (view === 'mission_control') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
  }
  if (tab && !params.has('tab')) {
    params.set('tab', tab);
  }
  const search = params.toString();
  return <Navigate to={`/foundry${search ? `?${search}` : ''}`} replace />;
};

const FoundryAppInner = () => {
  const { syncConflict, resolveConflictOverwrite, resolveConflictPull, resolveConflictCancel } = useCampaign();
  
  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<StoryModule />} />
          <Route path="mission-control" element={<FoundryRouteRedirect view="mission_control" />} />
          <Route path="dashboard" element={<FoundryRouteRedirect view="mission_control" />} />
          <Route path="hub" element={<FoundryRouteRedirect view="mission_control" />} />
          <Route path="live" element={<FoundryRouteRedirect view="stage" tab="run" />} />
          <Route path="live-studio" element={<FoundryRouteRedirect view="stage" tab="run" />} />
          <Route path="ade-stage" element={<FoundryRouteRedirect view="stage" tab="run" />} />
          <Route path="live-studio-standalone" element={<FoundryRouteRedirect view="stage" tab="run" />} />
          <Route path="stage" element={<ADEStage />} />
          <Route path="ade" element={<StoryModule />} />
          <Route path="story" element={<StoryModule />} />
          <Route path="interactive" element={<FoundryRouteRedirect view="scenarios" tab="play" />} />
          <Route path="gems" element={<FoundryRouteRedirect view="scenarios" tab="gems" />} />
          <Route path="narrative" element={<FoundryRouteRedirect view="scenarios" tab="write" />} />
          <Route path="scripts" element={<FoundryRouteRedirect view="stage" tab="scripts" />} />
          <Route path="presets" element={<FoundryRouteRedirect view="stage" tab="scripts" />} />
          <Route path="automation" element={<FoundryRouteRedirect view="stage" tab="scripts" />} />
          <Route path="assets" element={<FoundryRouteRedirect view="elements" />} />
          <Route path="elements" element={<FoundryRouteRedirect view="elements" />} />
          <Route path="gallery" element={<FoundryRouteRedirect view="elements" />} />
          <Route path="graph" element={<FoundryRouteRedirect view="scenarios" tab="graph" />} />
          <Route path="tactical" element={<FoundryRouteRedirect view="stage" tab="encounters" />} />
          <Route path="control-panel" element={<FoundryRouteRedirect view="stage" tab="encounters" />} />
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
