import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '../../components/Layout/AppShell';
import { CampaignProvider, useCampaign } from '../../context/CampaignContext';
import SyncConflictModal from '../../components/StoryFoundry/SyncConflictModal';

import Dashboard from './Dashboard/Dashboard';
import StoryModule from './StoryModule/StoryModule';
import ElementForge from './ElementForge/ElementForge';
import MapMaker from './MapMaker/MapMaker';
import AIME from './AIME/AIME';
import PlayerSpectatorView from './MapMaker/PlayerSpectatorView';
import VttOptionsPage from './MapMaker/VttOptionsPage';

const FoundryAppInner = () => {
  const { syncConflict, resolveConflictOverwrite, resolveConflictPull, resolveConflictCancel } = useCampaign();
  
  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="ade" element={<StoryModule />} />
          <Route path="story" element={<StoryModule />} />
          <Route path="elements" element={<StoryModule defaultView="elements" />} />
          <Route path="map-maker" element={<MapMaker />} />
          <Route path="vtt-options" element={<VttOptionsPage />} />
          <Route path="aime" element={<StoryModule defaultView="aime" />} />
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
