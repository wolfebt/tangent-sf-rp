import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../context/CampaignContext';
import { useFolio } from '../context/FolioContext';
import { useDBM } from '../context/DBMContext';
import { CampaignOpsWidget } from '../components/Hub/CampaignOpsWidget';
import { TransmissionFeed } from '../components/Hub/TransmissionFeed';
import { ModuleLauncherCard } from '../components/Hub/ModuleLauncherCard';
import { LandingDrawerArea } from '../components/Hub/LandingDrawerArea';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { 
  Database, Users, Map, Key, 
  BookOpen, Sparkles, Layers, Dices, Volume2, VolumeX, Settings, LogOut 
} from 'lucide-react';
import { AudioService } from '../services/audioService';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, loginWithGoogle, confirmLogout } = useAuth();
  const { universeState, mapsCatalog, elementsCatalog } = useStory();
  const { personaRoster, roster } = useFolio();
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  // Active Center View Drawer state: null | 'persona-folio' | 'foundry-scenarios' | 'foundry-elements' | 'foundry-maps' | 'foundry-aime'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);

  // Live Metrics
  const heroCount = (personaRoster || roster || []).length;
  const dbmTotalItems = Object.values(dbData).reduce((sum, categoryItems) => {
    return sum + (Array.isArray(categoryItems) ? categoryItems.length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);
  const elementCount = elementsCatalog?.length || 0;
  const aimeCardsCount = universeState?.creativeState?.storyCards?.length || 0;

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser?.displayName || currentUser?.email || 'OPERATOR');

  const handleToggleDrawer = (drawerId) => {
    setActiveDrawer(prev => prev === drawerId ? null : drawerId);
  };

  const handleToggleFoundry = () => {
    setActiveDrawer(prev => ['foundry-scenarios', 'foundry-elements', 'foundry-maps', 'foundry-aime'].includes(prev) ? null : 'foundry-scenarios');
  };

  const toggleAudio = () => {
    const newMuteState = AudioService.toggleMute();
    setIsAudioMuted(newMuteState);
    if (!newMuteState) {
      AudioService.playTerminalBeep(1000, 0.05);
    }
  };

  return (
    <div 
      onClick={() => setActiveDrawer(null)}
      className="h-full w-full relative bg-cover bg-center bg-no-repeat bg-fixed text-slate-100 font-sans overflow-y-auto"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Dark Overlay Gradient */}
      <div className="min-h-full w-full bg-gradient-to-b from-[#0d1117]/85 via-[#0d1117]/65 to-[#0d1117]/90 backdrop-blur-[1px] p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
        <div className="max-w-[1580px] w-full mx-auto space-y-4">
          
          {/* 3-Column Restructured Landing Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
            
            {/* Left Column (3 cols on lg): Vertical Navigation Stack */}
            <div className="lg:col-span-3 space-y-2.5 flex flex-col" onClick={(e) => e.stopPropagation()}>
              
              {/* 1. PERSONA FOLIO */}
              <ModuleLauncherCard
                title="PERSONA FOLIO"
                subtitle="Hero Builder & Roster"
                description="Character creation, augmentations, and operative roster management."
                badge={`${heroCount} ${heroCount === 1 ? 'Operative' : 'Operatives'}`}
                icon={Users}
                theme="cyan"
                frequency={1200}
                isActive={activeDrawer === 'persona-folio'}
                onClick={() => handleToggleDrawer('persona-folio')}
              />

              {/* 2. STORY FOUNDRY with 4 Sub-Options */}
              <ModuleLauncherCard
                title="STORY FOUNDRY"
                subtitle="Campaigns & World Engine"
                description="Scenario trees, element database, tactical battlemaps, and AIME."
                badge={`${scenarioCount} Scenarios`}
                icon={BookOpen}
                theme="purple"
                frequency={1350}
                isActive={['foundry-scenarios', 'foundry-elements', 'foundry-maps', 'foundry-aime'].includes(activeDrawer)}
                onClick={handleToggleFoundry}
                activeSubOptionId={activeDrawer}
                subOptions={[
                  {
                    id: 'foundry-scenarios',
                    label: 'Scenarios & Story Trees',
                    icon: Layers,
                    badge: `${scenarioCount}`,
                    onClick: () => handleToggleDrawer('foundry-scenarios')
                  },
                  {
                    id: 'foundry-elements',
                    label: 'Element Forge Database',
                    icon: Database,
                    badge: `${elementCount}`,
                    onClick: () => handleToggleDrawer('foundry-elements')
                  },
                  {
                    id: 'foundry-maps',
                    label: 'Tactical Maps & VTT',
                    icon: Map,
                    badge: `${mapCount}`,
                    onClick: () => handleToggleDrawer('foundry-maps')
                  },
                  {
                    id: 'foundry-aime',
                    label: 'AIME Creative Engine',
                    icon: Sparkles,
                    badge: `${aimeCardsCount}`,
                    onClick: () => handleToggleDrawer('foundry-aime')
                  }
                ]}
              />

              {/* Thin Divider Line between Story Foundry and Omnicortex */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-700/70 to-transparent my-1"></div>

              {/* 3. OMNICORTEX (Framed in Emerald, Routes directly to /dbm as-is) */}
              <ModuleLauncherCard
                title="OMNICORTEX"
                subtitle="Rules & DBM"
                description="Database manager for species, cyberware, disciplines, and rules."
                badge={dbmTotalItems > 0 ? `${dbmTotalItems.toLocaleString()} Entries` : 'Active Codex'}
                icon={Database}
                path="/dbm"
                theme="emerald"
                frequency={1050}
              />

              {/* 4. CODEX (Framed in Amber, Routes directly to /codex as-is) */}
              <ModuleLauncherCard
                title="CODEX"
                subtitle="Matrix Suite"
                description="Development tools across 12 matrices to create and commit rules."
                badge="12 Matrices"
                icon={BookOpen}
                path="/codex"
                theme="amber"
                frequency={1400}
              />

            </div>

            {/* Center Column (6 cols on lg): Dynamic Open View Area / In-Page Drawers */}
            <div className="lg:col-span-6 min-h-[540px] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <LandingDrawerArea
                activeDrawer={activeDrawer}
                onCloseDrawer={() => setActiveDrawer(null)}
                onOpenDrawer={(drawerKey) => setActiveDrawer(drawerKey)}
              />
            </div>

            {/* Right Column (3 cols on lg): Campaign Ops (Focused on VTT) + Transmission Feed */}
            <div className="lg:col-span-3 space-y-3.5 flex flex-col" onClick={(e) => e.stopPropagation()}>
              
              {/* Campaign Ops Widget (Positioned above Transmission Feed, click toggles/shows Overview) */}
              <CampaignOpsWidget onShowOverview={() => setActiveDrawer(prev => prev === 'overview' ? null : 'overview')} />

              {/* Transmission & Event Feed */}
              <TransmissionFeed />

            </div>

          </div>

        </div>

        {/* Global Settings Modal */}
        <UserSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Footer info */}
        <footer className="max-w-[1580px] w-full mx-auto pt-4 pb-2 border-t border-slate-900/80 mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
          <span>TANGENT SCIENCE FANTASY ROLE PLAYING SYSTEM • HUB V2.0</span>
          <span>CYBERNETIC INTERFACE INITIALIZED</span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
