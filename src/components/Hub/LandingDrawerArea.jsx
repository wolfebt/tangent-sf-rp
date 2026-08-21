import React from 'react';
import FolioRosterDrawer from './drawers/FolioRosterDrawer';
import ScenariosDrawer from './drawers/ScenariosDrawer';
import ElementsDrawer from './drawers/ElementsDrawer';
import MapsDrawer from './drawers/MapsDrawer';
import AimeDrawer from './drawers/AimeDrawer';
import CommandOverview from './drawers/CommandOverview';

export const LandingDrawerArea = ({
  activeDrawer,
  onCloseDrawer,
  onOpenDrawer
}) => {
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="bg-slate-900/20 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-slate-800/80 h-full flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Dynamic Viewport Selection */}
      <div className="relative z-10 h-full">
        {activeDrawer === 'overview' && <CommandOverview onClose={onCloseDrawer} onOpenDrawer={onOpenDrawer} />}
        {activeDrawer === 'persona-folio' && <FolioRosterDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-scenarios' && <ScenariosDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-elements' && <ElementsDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-maps' && <MapsDrawer onClose={onCloseDrawer} />}
        {activeDrawer === 'foundry-aime' && <AimeDrawer onClose={onCloseDrawer} />}
        {!activeDrawer && (
          <div className="h-full flex items-center justify-center pointer-events-none">
            {/* Open empty view area allowing background space artwork to show cleanly */}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingDrawerArea;
