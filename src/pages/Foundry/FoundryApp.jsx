import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '../../components/Layout/AppShell';
import { CampaignProvider, useCampaign } from '../../context/CampaignContext';
import SyncConflictModal from '../../components/StoryFoundry/SyncConflictModal';

import Dashboard from './Dashboard/Dashboard';
import StoryModule from './StoryModule/StoryModule';
import ElementForge from './ElementForge/ElementForge';
import MapMaker from './MapMaker/MapMaker';
import AIME from './AIME/AIME';

const FoundryAppInner = () => {
  const { syncConflict, resolveConflictOverwrite, resolveConflictPull, resolveConflictCancel } = useCampaign();
  
  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="story" element={<StoryModule />} />
          <Route path="elements" element={<ElementForge />} />
          <Route path="map-maker" element={<MapMaker />} />
          <Route path="aime" element={<AIME />} />
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
  return (
    <CampaignProvider>
      <FoundryAppInner />
    </CampaignProvider>
  );
};

export default FoundryApp;

