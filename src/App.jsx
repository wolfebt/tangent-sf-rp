import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { DBMProvider } from './context/DBMContext';
import { FolioProvider } from './context/FolioContext';
import { SquadProvider, GroupProvider } from './context/SquadContext';
import { ChatProvider } from './context/ChatContext';
import { VoiceChatProvider } from './context/VoiceChatContext';
import { VoiceCommsBar } from './components/Chat/VoiceCommsBar';
import { DiceProvider } from './context/DiceContext';
import { ContextMenuProvider } from './context/ContextMenuContext';
import { GlobalHUD } from './components/Layout/GlobalHUD';
import { GlobalSideRail } from './components/Layout/GlobalSideRail';
import { MobileBottomNav } from './components/Layout/MobileBottomNav';
import { DiceRollerDock } from './components/UI/DiceRollerDock';
import { CommLinkDock } from './components/UI/CommLinkDock';
import BastionDrawer from './components/Folio/BastionDrawer';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { RingedPlanetLogo } from './components/UI/RingedPlanetLogo';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy Loaded Top-Level Routes for Optimal Bundle Performance (Resilient to Deployment Chunk Changes)
const Dashboard = lazyWithRetry(() => import('./pages/Home'));
const Home = Dashboard;
const Compendium = lazyWithRetry(() => import('./pages/Compendium'));
const DBM = lazyWithRetry(() => import('./pages/DBM'));
const Folio = lazyWithRetry(() => import('./pages/Folio'));
const FoundryApp = lazyWithRetry(() => import('./pages/Foundry/FoundryApp'));
const PlayerSpectatorView = lazyWithRetry(() => import('./pages/Foundry/MapMaker/PlayerSpectatorView'));
const NetworkPage = lazyWithRetry(() => import('./pages/NetworkPage'));
const CommsPage = lazyWithRetry(() => import('./pages/CommsPage'));
const SquadsPage = lazyWithRetry(() => import('./pages/SquadsPage'));
const TeamsPage = SquadsPage;
const StageView = lazyWithRetry(() => import('./components/VTT/TripartiteStageView'));

const CodexToCortexRedirect = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const matrixMap = {
    weaponry: 'weaponry',
    armor: 'armoring',
    equipment: 'gear',
    augmentations: 'augmentations',
    mecha: 'mecha',
    architecture: 'architecture',
    'species-traits': 'species',
    invocations: 'invocations',
    factions: 'factions',
    features: 'features',
    companions: 'archetypes',
    'stat-blocks': 'modular_characters',
    planetary: 'planets'
  };
  const matrixParam = params.get('matrix');
  if (matrixParam && !params.has('cat')) {
    params.set('cat', matrixMap[matrixParam] || matrixParam);
    if (!params.has('mode')) {
      params.set('mode', 'studio');
    }
  }
  const qs = params.toString();
  return <Navigate to={`/dbm${qs ? `?${qs}` : ''}`} replace />;
};

const VttOpsRedirect = () => {
  const location = useLocation();
  const search = location.search;
  const target = `/stage${search ? (search.includes('options=') ? search : `${search}&options=true`) : '?options=true'}`;
  return <Navigate to={target} replace />;
};

const SearchPreservingRedirect = ({ to }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};

const NetworkRedirect = ({ defaultView = 'comms' }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (!params.has('view')) {
    params.set('view', defaultView);
  }
  return <Navigate to={`/network?${params.toString()}`} replace />;
};

const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center tangent-grid-bg text-cyan-400 font-mono text-xs tracking-wider h-full w-full select-none">
    <div className="p-6 rounded-2xl bg-[#12161f]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col items-center space-y-3">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <RingedPlanetLogo size={38} className="animate-pulse filter drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
      </div>
      <div className="text-center space-y-1">
        <div className="font-bold tracking-widest text-cyan-300">LOADING SYSTEM MODULE</div>
        <div className="text-[10px] text-slate-400 font-mono">TERRAN DATA NET SYNC ACTIVE</div>
      </div>
    </div>
  </div>
);

export function App() {
  const [isCommsDockOpen, setIsCommsDockOpen] = useState(false);
  const [isBastionOpen, setIsBastionOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Alt+D or Option+D for dice dock
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key?.toLowerCase() === 'd' || e.code === 'KeyD')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
      }
      // Alt+B or Option+B for BASTION AI Assistant
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key?.toLowerCase() === 'b' || e.code === 'KeyB')) {
        e.preventDefault();
        setIsBastionOpen(prev => !prev);
      }
      // Alt+R or Option+R for CommLink Relay dock
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key?.toLowerCase() === 'r' || e.code === 'KeyR')) {
        e.preventDefault();
        setIsCommsDockOpen(prev => !prev);
      }
    };

    const handleCustomToggleComms = () => setIsCommsDockOpen(prev => !prev);
    const handleToggleBastion = (e) => {
      if (e?.detail?.prompt) {
        setIsBastionOpen(true);
      } else {
        setIsBastionOpen(prev => !prev);
      }
    };
    const handleOpenBastion = () => setIsBastionOpen(true);

    window.addEventListener('toggle-comms-dock', handleCustomToggleComms);
    window.addEventListener('toggle-folio-bastion', handleToggleBastion);
    window.addEventListener('toggle-bastion-drawer', handleToggleBastion);
    window.addEventListener('open-bastion-drawer', handleOpenBastion);
    window.addEventListener('keydown', handleGlobalKeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeys);
      window.removeEventListener('toggle-comms-dock', handleCustomToggleComms);
      window.removeEventListener('toggle-folio-bastion', handleToggleBastion);
      window.removeEventListener('toggle-bastion-drawer', handleToggleBastion);
      window.removeEventListener('open-bastion-drawer', handleOpenBastion);
    };
  }, []);

  return (
    <Router>
      <CampaignProvider>
        <DBMProvider>
          <FolioProvider>
            <GroupProvider>
              <ChatProvider>
                <VoiceChatProvider>
                  <DiceProvider>
                    <ContextMenuProvider>
                      <div className="h-screen h-dvh w-screen tangent-grid-bg flex flex-col font-sans overflow-hidden text-slate-100 select-none">
                      {/* Persistent Global HUD (Height: 52px on sub-routes) */}
                      <GlobalHUD
                        onToggleDiceDock={() => window.dispatchEvent(new CustomEvent('toggle-dice-dock'))}
                        onToggleBastion={() => setIsBastionOpen(prev => !prev)}
                        isBastionOpen={isBastionOpen}
                        onToggleCommsDock={() => setIsCommsDockOpen(prev => !prev)}
                        isCommsDockOpen={isCommsDockOpen}
                      />

                      {/* Persistent Body: Left Guide Rail / Landing Drawer + Routed Workspace */}
                      <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden relative">
                        <GlobalSideRail />
                        {/* Main Routed Area */}
                        <main className="flex-1 min-w-0 h-full overflow-hidden relative pb-14 sm:pb-0">
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<SearchPreservingRedirect to="/" />} />
                                <Route path="/network" element={<NetworkPage />} />
                                <Route path="/network/*" element={<NetworkPage />} />
                                <Route path="/comms" element={<NetworkRedirect defaultView="comms" />} />
                                <Route path="/chat" element={<NetworkRedirect defaultView="comms" />} />
                                <Route path="/teams" element={<NetworkRedirect defaultView="squads" />} />
                                <Route path="/groups" element={<NetworkRedirect defaultView="squads" />} />
                                <Route path="/squads" element={<NetworkRedirect defaultView="squads" />} />
                                <Route path="/codex" element={<CodexToCortexRedirect />} />
                                <Route path="/codex/*" element={<CodexToCortexRedirect />} />
                                <Route path="/compendium" element={<Compendium />} />
                                <Route path="/compendium/*" element={<Compendium />} />
                                <Route path="/rules" element={<SearchPreservingRedirect to="/compendium" />} />
                                <Route path="/rules/*" element={<SearchPreservingRedirect to="/compendium" />} />
                                <Route path="/dbm" element={<DBM />} />
                                <Route path="/dbm/*" element={<DBM />} />
                                <Route path="/folio" element={<Folio />} />
                                <Route path="/roster" element={<SearchPreservingRedirect to="/folio" />} />
                                <Route path="/live-studio" element={<SearchPreservingRedirect to="/foundry/live" />} />
                                <Route path="/ade-stage" element={<SearchPreservingRedirect to="/foundry/live" />} />
                                <Route path="/map-maker" element={<SearchPreservingRedirect to="/foundry/map" />} />
                                <Route path="/mapmaker" element={<SearchPreservingRedirect to="/foundry/map" />} />
                                <Route path="/vtt-ops" element={<VttOpsRedirect />} />
                                <Route path="/stage" element={<StageView defaultRole="architect" />} />
                                <Route path="/vtt" element={<StageView defaultRole="operative" />} />
                                <Route path="/spectator/:mapId" element={<PlayerSpectatorView />} />
                                <Route path="/foundry/*" element={<FoundryApp />} />
                                <Route path="/ade/*" element={<SearchPreservingRedirect to="/foundry" />} />
                                <Route path="/ade" element={<SearchPreservingRedirect to="/foundry" />} />
                                <Route path="/ade-studio/*" element={<SearchPreservingRedirect to="/foundry" />} />
                                <Route path="/ade-studio" element={<SearchPreservingRedirect to="/foundry" />} />
                                <Route path="/story-foundry" element={<SearchPreservingRedirect to="/foundry" />} />
                                <Route path="/campaign-builder" element={<SearchPreservingRedirect to="/foundry" />} />
                              </Routes>
                            </Suspense>
                          </ErrorBoundary>
                        </main>
                      </div>

                      {/* Global Live Team Voice Comms Bar (renders automatically when connected) */}
                      <VoiceCommsBar className="mb-14 sm:mb-0" />

                      {/* Mobile Bottom Navigation (< sm screens only) */}
                      <MobileBottomNav />

                      {/* Persistent Overlay Docks & Command Palette */}
                      <DiceRollerDock />

                      <BastionDrawer
                        isOpen={isBastionOpen}
                        onClose={() => setIsBastionOpen(false)}
                      />

                      <CommLinkDock
                        isOpen={isCommsDockOpen}
                        onClose={() => setIsCommsDockOpen(false)}
                      />
                    </div>
                  </ContextMenuProvider>
                </DiceProvider>
                </VoiceChatProvider>
              </ChatProvider>
            </GroupProvider>
          </FolioProvider>
        </DBMProvider>
      </CampaignProvider>
    </Router>
  );
}

export default App;
