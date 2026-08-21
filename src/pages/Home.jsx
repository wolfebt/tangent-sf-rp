import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../context/CampaignContext';
import { useFolio } from '../context/FolioContext';
import { useDBM } from '../context/DBMContext';
import { ActiveCampaignWidget } from '../components/Hub/ActiveCampaignWidget';
import { PartyStatusWidget } from '../components/Hub/PartyStatusWidget';
import { TransmissionFeed } from '../components/Hub/TransmissionFeed';
import { ModuleLauncherCard } from '../components/Hub/ModuleLauncherCard';
import { Database, Users, Map, ShieldCheck, Key, Terminal } from 'lucide-react';
import { AudioService } from '../services/audioService';

const Home = () => {
  const { currentUser, userHandle, loginWithGoogle } = useAuth();
  const { universeState, mapsCatalog } = useStory();
  const { personaRoster, roster } = useFolio();
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  // Calculate live dynamic metrics
  const heroCount = (personaRoster || roster || []).length;
  
  const dbmTotalItems = Object.values(dbData).reduce((sum, categoryItems) => {
    return sum + (Array.isArray(categoryItems) ? categoryItems.length : 0);
  }, 0);

  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);

  const operatorDisplay = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  return (
    <div 
      className="h-full w-full relative bg-cover bg-center bg-no-repeat bg-fixed text-slate-100 font-sans overflow-y-auto"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Dark Overlay Gradient */}
      <div className="min-h-full w-full bg-gradient-to-b from-[#0d1117]/80 via-[#0d1117]/55 to-[#0d1117]/85 backdrop-blur-[1px] p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header & Command Hub Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  <Terminal size={11} /> Command Center
                </span>
                <span className="text-slate-500 font-mono text-xs">•</span>
                <span className="text-slate-400 font-mono text-xs">REACT 2.0 PROTOCOL</span>
              </div>
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase text-white font-mono select-none"
                style={{ textShadow: "0 0 20px rgba(34,211,238,0.3), 2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                TANGENT <span className="text-cyan-400">SFF RP</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono tracking-wide mt-1">
                SCIENCE FANTASY ROLE PLAYING • TACTICAL OPERATIONS HUB
              </p>
            </div>

            {/* Operator Status & Shortcuts Tip */}
            <div className="flex flex-wrap items-center gap-3">
              {currentUser ? (
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-2.5 text-xs font-mono">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <div>
                    <span className="text-slate-500 text-[10px] block leading-none uppercase">Authorized</span>
                    <span className="text-cyan-300 font-bold leading-none">{operatorDisplay}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.03);
                    loginWithGoogle();
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2 font-mono"
                >
                  <Key size={14} /> Operator Login
                </button>
              )}

              {/* Keyboard Hints Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
                <span>Quick Find: <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">Ctrl+K</kbd></span>
                <span>•</span>
                <span>Dice Tray: <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Alt+D</kbd></span>
              </div>
            </div>
          </div>

          {/* Core Module Launchers Grid (Top Row) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ModuleLauncherCard
              title="OMNICORTEX"
              subtitle="Rules & DBM"
              description="Comprehensive database manager for species, cyberware, disciplines, gear, items, and combat mechanics."
              badge={dbmTotalItems > 0 ? `${dbmTotalItems.toLocaleString()} Entries` : 'Active Codex'}
              icon={Database}
              path="/dbm"
              theme="emerald"
              frequency={1050}
            />

            <ModuleLauncherCard
              title="PERSONA FOLIO"
              subtitle="Hero Builder"
              description="Character creation, cybernetic augmentations, karma, CP economy breakdowns, and operative roster management."
              badge={`${heroCount} ${heroCount === 1 ? 'Operative' : 'Operatives'}`}
              icon={Users}
              path="/folio"
              theme="cyan"
              frequency={1200}
            />

            <ModuleLauncherCard
              title="STORY FOUNDRY"
              subtitle="VTT & Tactical Maps"
              description="Interactive campaign authoring, scenario outlines, fog-of-war battlemaps, and AIME narrative generator."
              badge={`${scenarioCount} Scenarios • ${mapCount} Maps`}
              icon={Map}
              path="/foundry"
              theme="purple"
              frequency={1350}
            />
          </div>

          {/* Operational Roleplay Grid (Active Ops + Party Vitals + Transmission Log - Bottom Row) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ActiveCampaignWidget />
            <PartyStatusWidget />
            <TransmissionFeed />
          </div>

        </div>

        {/* Footer info */}
        <footer className="max-w-7xl w-full mx-auto pt-8 pb-2 border-t border-slate-900/60 mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>TANGENT SCIENCE FANTASY ROLE PLAYING SYSTEM • HUB V2.0</span>
          <span>CYBERNETIC INTERFACE INITIALIZED</span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
