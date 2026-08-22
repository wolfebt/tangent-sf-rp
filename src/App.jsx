import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { DBMProvider } from './context/DBMContext';
import { FolioProvider } from './context/FolioContext';
import { GroupProvider } from './context/GroupContext';
import { ChatProvider } from './context/ChatContext';
import { GlobalHUD } from './components/Layout/GlobalHUD';
import { DiceRollerDock } from './components/UI/DiceRollerDock';
import { CommLinkDock } from './components/UI/CommLinkDock';
import { CommandPalette } from './components/UI/CommandPalette';
import { ErrorBoundary } from './components/UI/ErrorBoundary';

// Lazy Loaded Top-Level Routes for Optimal Bundle Performance
const Home = lazy(() => import('./pages/Home'));
const CodexApp = lazy(() => import('./pages/Codex/CodexApp'));
const DBM = lazy(() => import('./pages/DBM'));
const Folio = lazy(() => import('./pages/Folio'));
const FoundryApp = lazy(() => import('./pages/Foundry/FoundryApp'));
const VttOptionsPage = lazy(() => import('./pages/Foundry/MapMaker/VttOptionsPage'));
const PlayerSpectatorView = lazy(() => import('./pages/Foundry/MapMaker/PlayerSpectatorView'));
const CommsPage = lazy(() => import('./pages/CommsPage'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0d1117] text-cyan-400 font-mono text-sm tracking-wider h-full w-full">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <span>LOADING SYSTEM MODULE...</span>
    </div>
  </div>
);

export function App() {
  const [isDiceDockOpen, setIsDiceDockOpen] = useState(false);
  const [isCommsDockOpen, setIsCommsDockOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Alt+D or Option+D for dice dock
      if (e.altKey && (e.key?.toLowerCase() === 'd' || e.code === 'KeyD')) {
        e.preventDefault();
        setIsDiceDockOpen(prev => !prev);
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

    const handleCustomToggleDice = () => setIsDiceDockOpen(prev => !prev);
    const handleCustomToggleComms = () => setIsCommsDockOpen(prev => !prev);
    window.addEventListener('toggle-dice-dock', handleCustomToggleDice);
    window.addEventListener('toggle-comms-dock', handleCustomToggleComms);
    window.addEventListener('keydown', handleGlobalKeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeys);
      window.removeEventListener('toggle-dice-dock', handleCustomToggleDice);
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
                <div className="h-screen w-screen bg-[#0d1117] flex flex-col font-sans overflow-hidden text-slate-100 select-none">
                  {/* Persistent Global HUD (Height: 52px on sub-routes) */}
                  <GlobalHUD
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                    onToggleDiceDock={() => setIsDiceDockOpen(prev => !prev)}
                    isDiceDockOpen={isDiceDockOpen}
                    onToggleCommsDock={() => setIsCommsDockOpen(prev => !prev)}
                    isCommsDockOpen={isCommsDockOpen}
                  />

                  {/* Main Routed Area */}
                  <main className="flex-1 w-full overflow-hidden relative">
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/comms" element={<CommsPage />} />
                          <Route path="/chat" element={<CommsPage />} />
                          <Route path="/codex" element={<CodexApp />} />
                          <Route path="/codex/*" element={<CodexApp />} />
                          <Route path="/dbm" element={<DBM />} />
                          <Route path="/folio" element={<Folio />} />
                          <Route path="/roster" element={<Folio />} />
                          <Route path="/vtt-ops" element={<VttOptionsPage />} />
                          <Route path="/foundry/vtt-options" element={<VttOptionsPage />} />
                          <Route path="/foundry/view/:mapId" element={<PlayerSpectatorView />} />
                          <Route path="/foundry/spectator/:mapId" element={<PlayerSpectatorView />} />
                          <Route path="/spectator/:mapId" element={<PlayerSpectatorView />} />
                          <Route path="/foundry/*" element={<FoundryApp />} />
                          <Route path="/story-foundry" element={<FoundryApp />} />
                          <Route path="/campaign-builder" element={<FoundryApp />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>

                  {/* Persistent Overlay Docks & Command Palette */}
                  <DiceRollerDock
                    isOpen={isDiceDockOpen}
                    onClose={() => setIsDiceDockOpen(false)}
                  />

                  <CommLinkDock
                    isOpen={isCommsDockOpen}
                    onClose={() => setIsCommsDockOpen(false)}
                  />
                  
                  <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                  />
                </div>
              </ChatProvider>
            </GroupProvider>
          </FolioProvider>
        </DBMProvider>
      </CampaignProvider>
    </Router>
  );
}

export default App;
