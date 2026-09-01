import React from 'react';
import FolioRosterDrawer from './drawers/FolioRosterDrawer';
import FolioSheetDrawer from './drawers/FolioSheetDrawer';
import ScenariosDrawer from './drawers/ScenariosDrawer';
import ElementsDrawer from './drawers/ElementsDrawer';
import MapsDrawer from './drawers/MapsDrawer';
import AimeDrawer from './drawers/AimeDrawer';
import CommandOverview from './drawers/CommandOverview';
import GameGroupsDrawer from './drawers/GameGroupsDrawer';
import CommsCenterDrawer from './drawers/CommsCenterDrawer';
import OmnicortexDrawer from './drawers/OmnicortexDrawer';
import CodexDrawer from './drawers/CodexDrawer';
import FoundryWorkspaceDrawer from './drawers/FoundryWorkspaceDrawer';

export const LandingDrawerArea = ({
  activeDrawer,
  onCloseDrawer,
  onOpenDrawer
}) => {
  if (!activeDrawer) {
    return null;
  }

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="bg-slate-900/15 hover:bg-slate-900/85 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border-2 border-slate-800/90 hover:border-slate-700 h-full flex flex-col justify-between shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_24px_rgba(34,211,238,0.2)] relative overflow-hidden transition-all duration-200 animate-fadeIn"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Dynamic Viewport Selection */}
      <div className="relative z-10 h-full flex flex-col min-h-0">
        {activeDrawer === 'overview' && (
          <CommandOverview onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'persona-folio' && (
          <FolioRosterDrawer 
            onClose={onCloseDrawer} 
            onOpenSheet={() => onOpenDrawer('persona-sheet')}
            onOpenDrawer={onOpenDrawer}
          />
        )}
        {activeDrawer === 'persona-sheet' && (
          <FolioSheetDrawer 
            onClose={onCloseDrawer} 
            onOpenRoster={() => onOpenDrawer('persona-folio')} 
          />
        )}
        {(activeDrawer === 'omnicortex' || activeDrawer === 'dbm') && (
          <OmnicortexDrawer onClose={onCloseDrawer} />
        )}
        {activeDrawer === 'codex' && (
          <CodexDrawer onClose={onCloseDrawer} />
        )}
        {(activeDrawer === 'game-groups' || activeDrawer === 'squads') && (
          <GameGroupsDrawer onClose={onCloseDrawer} />
        )}
        {(activeDrawer === 'comms' || activeDrawer === 'comm-center') && (
          <CommsCenterDrawer onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-scenarios' && (
          <ScenariosDrawer onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-scenarios-workspace' && (
          <FoundryWorkspaceDrawer tool="scenarios" onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-elements' && (
          <ElementsDrawer onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-elements-workspace' && (
          <FoundryWorkspaceDrawer tool="elements" onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-maps' && (
          <MapsDrawer onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-maps-workspace' && (
          <FoundryWorkspaceDrawer tool="maps" onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-aime' && (
          <AimeDrawer onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
        {activeDrawer === 'foundry-aime-workspace' && (
          <FoundryWorkspaceDrawer tool="aime" onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />
        )}
      </div>
    </div>
  );
};

export default LandingDrawerArea;
