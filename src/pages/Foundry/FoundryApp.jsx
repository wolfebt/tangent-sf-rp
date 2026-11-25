import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AppShell from '../../components/Layout/AppShell';
import { useCampaign } from '../../context/CampaignContext';
import SyncConflictModal from '../../components/StoryFoundry/SyncConflictModal';
import CommandPaletteModal from './StoryModule/CommandPaletteModal';
import { useAdeStore } from './store/adeStore';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { ErrorBoundary } from '../../components/UI/ErrorBoundary';

const Dashboard = lazyWithRetry(() => import('./Dashboard/Dashboard'));
const MapMaker = lazyWithRetry(() => import('./MapMaker/MapMaker'));
const AIME = lazyWithRetry(() => import('./AIME/AIME'));
const PlayerSpectatorView = lazyWithRetry(() => import('./MapMaker/PlayerSpectatorView'));
const ADEStage = lazyWithRetry(() => import('../../components/VTT/TripartiteStageView'));
const StoryModule = lazyWithRetry(() => import('./StoryModule/StoryModule'));

const VttOptionsRedirect = () => {
  const location = useLocation();
  const search = location.search;
  const target = `/foundry/stage${search ? (search.includes('options=') ? search : `${search}&options=true`) : '?options=true'}`;
  return <Navigate to={target} replace />;
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
  const {
    syncConflict,
    resolveConflictOverwrite,
    resolveConflictPull,
    resolveConflictCancel,
    universeState,
    elementsCatalog,
    setActiveScenarioId,
    setActiveMapId,
    isStoryReadOnly = false
  } = useCampaign();
  const location = useLocation();
  const navigate = useNavigate();
  const isCommandPaletteOpen = useAdeStore((s) => Boolean(s.modals?.commandPalette));
  const setAdeModal = useAdeStore((s) => s.setModal);
  const setAdeView = useAdeStore((s) => s.setActiveView);
  const setStoryTab = useAdeStore((s) => s.setStoryWorkspaceTab);
  const setStageTab = useAdeStore((s) => s.setStageWorkspaceTab);

  // StoryModule mounts FoundryModalHost which already renders CommandPaletteModal on /foundry, /foundry/ade, /foundry/story
  const normalizedPath = (location.pathname || '').replace(/\/+$/, '');
  const isStoryModuleRoute = /^\/foundry(?:\/(?:ade|story))?$/i.test(normalizedPath);

  React.useEffect(() => {
    if (isStoryModuleRoute) return undefined;
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAdeModal('commandPalette', !useAdeStore.getState().modals?.commandPalette);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isStoryModuleRoute, setAdeModal]);
  
  return (
    <>
      <AppShell>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[240px] text-xs font-mono text-cyan-400 tracking-widest uppercase">
                Initializing Foundry Module...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<StoryModule />} />
              <Route path="mission-control" element={<FoundryRouteRedirect view="mission_control" />} />
              <Route path="dashboard" element={<FoundryRouteRedirect view="mission_control" />} />
              <Route path="hub" element={<FoundryRouteRedirect view="mission_control" />} />
              <Route path="live" element={<FoundryRouteRedirect view="stage" tab="run" />} />
              <Route path="live-studio" element={<FoundryRouteRedirect view="stage" tab="run" />} />
              <Route path="ade-stage" element={<FoundryRouteRedirect view="stage" tab="run" />} />
              <Route path="live-studio-standalone" element={<FoundryRouteRedirect view="stage" tab="run" />} />
              <Route path="vtt" element={<FoundryRouteRedirect view="stage" tab="run" />} />
              <Route path="stage-vtt" element={<FoundryRouteRedirect view="stage" tab="run" />} />
              <Route path="director" element={<FoundryRouteRedirect view="stage" tab="run" />} />
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
              <Route path="*" element={<Navigate to="/foundry" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AppShell>
      <SyncConflictModal
        isOpen={!!syncConflict}
        conflictData={syncConflict}
        onOverwrite={resolveConflictOverwrite}
        onPull={resolveConflictPull}
        onCancel={resolveConflictCancel}
      />
      {!isStoryModuleRoute && isCommandPaletteOpen && (
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setAdeModal('commandPalette', false)}
          universeState={universeState}
          elementsCatalog={elementsCatalog}
          isStoryReadOnly={isStoryReadOnly}
          onSelectScenario={(scId) => {
            setActiveScenarioId?.(scId);
            navigate(`/foundry?view=scenarios&tab=write&scenarioId=${encodeURIComponent(scId)}`);
          }}
          onEditElement={(el) => {
            useAdeStore.getState().openGuidedElementCreator({ element: el, mode: 'sheet' });
            navigate(`/foundry?view=elements${el?.id ? `&elementId=${encodeURIComponent(el.id)}` : ''}`);
          }}
          onOpenNewElement={() => {
            useAdeStore.getState().openGuidedElementCreator({ mode: 'guided' });
            navigate('/foundry?view=elements');
          }}
          onSelectMap={(mapId) => {
            setActiveMapId?.(mapId);
            navigate(`/foundry/stage?mapId=${encodeURIComponent(mapId)}`);
          }}
          onSwitchView={(view, tab) => {
            if (view === 'stage') {
              setAdeView('stage');
              if (tab) setStageTab(tab);
              navigate('/foundry/stage');
            } else {
              if (view) setAdeView(view);
              if (tab) setStoryTab(tab);
              navigate(`/foundry?view=${encodeURIComponent(view || 'scenarios')}${tab ? `&tab=${encodeURIComponent(tab)}` : ''}`);
            }
          }}
          onToggleSplitView={() => {
            useAdeStore.getState().setIsSplitView(!useAdeStore.getState().isSplitView);
            navigate('/foundry?view=scenarios');
          }}
          onOpenModal={(key) => {
            setAdeModal(key, true);
            navigate('/foundry');
          }}
        />
      )}
    </>
  );
};

const FoundryApp = () => {
  return <FoundryAppInner />;
};

export default FoundryApp;
