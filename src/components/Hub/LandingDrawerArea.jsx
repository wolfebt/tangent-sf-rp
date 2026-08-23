import React from 'react';
import FolioRosterDrawer from './drawers/FolioRosterDrawer';
import ScenariosDrawer from './drawers/ScenariosDrawer';
import ElementsDrawer from './drawers/ElementsDrawer';
import MapsDrawer from './drawers/MapsDrawer';
import AimeDrawer from './drawers/AimeDrawer';
import CommandOverview from './drawers/CommandOverview';
import GameGroupsDrawer from './drawers/GameGroupsDrawer';
import CommsCenterDrawer from './drawers/CommsCenterDrawer';

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
      className="bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-slate-800/90 h-full flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative overflow-hidden animate-fadeIn"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Dynamic Viewport Selection */}
      <div className="relative z-10 h-full">
        {activeDrawer === 'overview' && <CommandOverview onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />}
        {activeDrawer === 'persona-folio' && <FolioRosterDrawer onClose={onCloseDrawer} />}
        {(activeDrawer === 'game-groups' || activeDrawer === 'squads') && <GameGroupsDrawer onClose={onCloseDrawer} />}
        {(activeDrawer === 'comms' || activeDrawer === 'comm-center') && <CommsCenterDrawer onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />}
        {activeDrawer === 'foundry-scenarios' && <ScenariosDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-elements' && <ElementsDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-maps' && <MapsDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-aime' && <AimeDrawer onClose={onCloseDrawer} />}
      </div>
    </div>
  );
};

export default LandingDrawerArea;
