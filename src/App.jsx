import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { DBMProvider } from './context/DBMContext';

const Home = lazy(() => import('./pages/Home'));
const Folio = lazy(() => import('./pages/Folio'));
const FoundryApp = lazy(() => import('./pages/Foundry/FoundryApp'));
const DBM = lazy(() => import('./pages/DBM'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0d1117] text-cyan-400 font-mono text-sm tracking-wider">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <span>LOADING SYSTEM MODULE...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <DBMProvider>
        <div className="h-screen w-screen bg-[#0d1117] flex flex-col font-[#f5f5f5] font-sans overflow-hidden">
          {/* Routes */}
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dbm" element={<DBM />} />
                  <Route path="/folio" element={<Folio />} />
                  <Route path="/roster" element={<Folio />} />
                  <Route path="/foundry/*" element={<FoundryApp />} />
                  <Route path="/story-foundry" element={<FoundryApp />} />
                  <Route path="/campaign-builder" element={<FoundryApp />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </DBMProvider>
    </Router>
  );
}

export default App;
