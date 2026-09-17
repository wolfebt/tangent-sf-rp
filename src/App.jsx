import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { DBMProvider } from './context/DBMContext';
import { FolioProvider } from './context/FolioContext';
import { GroupProvider } from './context/GroupContext';
import { ChatProvider } from './context/ChatContext';
import { VoiceChatProvider } from './context/VoiceChatContext';
import { VoiceCommsBar } from './components/Chat/VoiceCommsBar';
import { DiceProvider } from './context/DiceContext';
import { GlobalHUD } from './components/Layout/GlobalHUD';
import { GlobalSideRail } from './components/Layout/GlobalSideRail';
import { DiceRollerDock } from './components/UI/DiceRollerDock';
import { CommLinkDock } from './components/UI/CommLinkDock';
import { CommandPalette } from './components/UI/CommandPalette';
import { ErrorBoundary } from './components/UI/ErrorBoundary';

// Lazy Loaded Top-Level Routes for Optimal Bundle Performance
const Dashboard = lazy(() => import('./pages/Home'));
const Home = Dashboard;
const CodexApp = lazy(() => import('./pages/Codex/CodexApp'));
const Compendium = lazy(() => import('./pages/Compendium'));
const DBM = lazy(() => import('./pages/DBM'));
const Folio = lazy(() => import('./pages/Folio'));
const FoundryApp = lazy(() => import('./pages/Foundry/FoundryApp'));
const VttOptionsPage = lazy(() => import('./pages/Foundry/MapMaker/VttOptionsPage'));
const PlayerSpectatorView = lazy(() => import('./pages/Foundry/MapMaker/PlayerSpectatorView'));
const CommsPage = lazy(() => import('./pages/CommsPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const StageView = lazy(() => import('./components/VTT/TripartiteStageView'));

const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-black text-cyan-400 font-mono text-xs tracking-wider h-full w-full select-none">
    <div className="p-6 rounded-2xl bg-[#12161f]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col items-center space-y-3">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <div className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Alt+D or Option+D for dice dock
      if (e.altKey && (e.key?.toLowerCase() === 'd' || e.code === 'KeyD')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
      }
      // Alt+C or Option+C for comms dock
      if (e.altKey && (e.key?.toLowerCase() === 'c' || e.code === 'KeyC')) {
        e.preventDefault();
        setIsCommsDockOpen(prev => !prev);
      }
      // Ctrl+K or Cmd+K for command palette
      if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'k' || e.code === 'KeyK')) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    const handleCustomToggleComms = () => setIsCommsDockOpen(prev => !prev);
    window.addEventListener('toggle-comms-dock', handleCustomToggleComms);
    window.addEventListener('keydown', handleGlobalKeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeys);
      window.removeEventListener('toggle-comms-dock', handleCustomToggleComms);
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
                    <div className="h-screen h-dvh w-screen bg-black flex flex-col font-sans overflow-hidden text-slate-100 select-none">
                      {/* Persistent Global HUD (Height: 52px on sub-routes) */}
                      <GlobalHUD
                        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                        onToggleDiceDock={() => window.dispatchEvent(new CustomEvent('toggle-dice-dock'))}
                        onToggleCommsDock={() => setIsCommsDockOpen(prev => !prev)}
                        isCommsDockOpen={isCommsDockOpen}
                      />

                      {/* Persistent Body: Side Rail + Routed Workspace */}
                      <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden relative">
                        {/* Persistent Global Guidance Rail */}
                        <GlobalSideRail />

                        {/* Main Routed Area */}
                        <main className="flex-1 min-w-0 h-full overflow-hidden relative">
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/comms" element={<CommsPage />} />
                                <Route path="/chat" element={<CommsPage />} />
                                <Route path="/teams" element={<TeamsPage />} />
                                <Route path="/groups" element={<TeamsPage />} />
                                <Route path="/squads" element={<TeamsPage />} />
                                <Route path="/codex" element={<CodexApp />} />
                                <Route path="/codex/*" element={<CodexApp />} />
                                <Route path="/compendium" element={<Compendium />} />
                                <Route path="/compendium/*" element={<Compendium />} />
                                <Route path="/dbm" element={<DBM />} />
                                <Route path="/folio" element={<Folio />} />
                                <Route path="/roster" element={<Folio />} />
                                <Route path="/vtt-ops" element={<VttOptionsPage />} />
                                <Route path="/stage" element={<StageView defaultRole="architect" />} />
                                <Route path="/vtt" element={<StageView defaultRole="operative" />} />
                                <Route path="/foundry/vtt-options" element={<VttOptionsPage />} />
                                <Route path="/foundry/view/:mapId" element={<PlayerSpectatorView />} />
                                <Route path="/foundry/spectator/:mapId" element={<PlayerSpectatorView />} />
                                <Route path="/spectator/:mapId" element={<PlayerSpectatorView />} />
                                <Route path="/foundry/*" element={<FoundryApp />} />
                                <Route path="/ade/*" element={<FoundryApp />} />
                                <Route path="/ade" element={<FoundryApp />} />
                                <Route path="/ade-studio/*" element={<FoundryApp />} />
                                <Route path="/ade-studio" element={<FoundryApp />} />
                                <Route path="/story-foundry" element={<FoundryApp />} />
                                <Route path="/campaign-builder" element={<FoundryApp />} />
                              </Routes>
                            </Suspense>
                          </ErrorBoundary>
                        </main>
                      </div>

                      {/* Global Live Team Voice Comms Bar (renders automatically when connected) */}
                      <VoiceCommsBar />

                      {/* Persistent Overlay Docks & Command Palette */}
                      <DiceRollerDock />

                      <CommLinkDock
                        isOpen={isCommsDockOpen}
                        onClose={() => setIsCommsDockOpen(false)}
                      />
                      
                      <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                      />
                    </div>
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
