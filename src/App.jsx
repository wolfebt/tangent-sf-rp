import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { DBMProvider } from './context/DBMContext';
import { FolioProvider } from './context/FolioContext';
import { CampaignProvider } from './context/CampaignContext';
import { GlobalHUD } from './components/Layout/GlobalHUD';
import { CommandPalette } from './components/UI/CommandPalette';
import { DiceRollerDock } from './components/UI/DiceRollerDock';

const Home = lazy(() => import('./pages/Home'));
const Folio = lazy(() => import('./pages/Folio'));
const FoundryApp = lazy(() => import('./pages/Foundry/FoundryApp'));
const DBM = lazy(() => import('./pages/DBM'));
const PlayerSpectatorView = lazy(() => import('./pages/Foundry/MapMaker/PlayerSpectatorView'));


const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0d1117] text-cyan-400 font-mono text-sm tracking-wider h-full w-full">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <span>LOADING SYSTEM MODULE...</span>
    </div>
  </div>
);

function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDiceDockOpen, setIsDiceDockOpen] = useState(false);

  // Global Keyboard Shortcuts (Ctrl+K for Search, Alt+D for Dice Dock)
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Alt+D or Option+D for dice dock
      if (e.altKey && (e.key?.toLowerCase() === 'd' || e.code === 'KeyD')) {
        e.preventDefault();
        setIsDiceDockOpen(prev => !prev);
      }
      // Ctrl+K or Cmd+K for command palette
      if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'k' || e.code === 'KeyK')) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  return (
    <Router>
      <CampaignProvider>
        <DBMProvider>
          <FolioProvider>
            <div className="h-screen w-screen bg-[#0d1117] flex flex-col font-sans overflow-hidden text-slate-100 select-none">
              {/* Persistent Global HUD (Height: 56px) */}
              <GlobalHUD
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onToggleDiceDock={() => setIsDiceDockOpen(prev => !prev)}
                isDiceDockOpen={isDiceDockOpen}
              />

              {/* Main Routed Area (Height: calc(100vh - 56px)) */}
              <main className="flex-1 w-full h-[calc(100vh-56px)] overflow-hidden relative">
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/dbm" element={<DBM />} />
                      <Route path="/folio" element={<Folio />} />
                      <Route path="/roster" element={<Folio />} />
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

              {/* Global Modals & Dock Drawers */}
              <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
              />

              <DiceRollerDock
                isOpen={isDiceDockOpen}
                onClose={() => setIsDiceDockOpen(false)}
              />
            </div>
          </FolioProvider>
        </DBMProvider>
      </CampaignProvider>
    </Router>
  );
}

export default App;
