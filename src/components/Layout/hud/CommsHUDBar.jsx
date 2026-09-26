import React from 'react';
import { Users, Radio, Dices } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const CommsHUDBar = ({
  setIsTeamModalOpen,
  onToggleCommsDock,
  toggleCommsDock,
  onToggleDiceDock
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1200, 0.03);
          setIsTeamModalOpen?.(true);
        }}
        className="px-2 sm:px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
        title="Team Management"
      >
        <Users size={13} className="text-emerald-400" />
        <span className="hidden sm:inline">Teams</span>
      </button>

      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1200, 0.03);
          const handleToggle = onToggleCommsDock ?? toggleCommsDock;
          handleToggle?.();
        }}
        className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
        title="Toggle Floating CommLink Tray (Alt+C)"
      >
        <Radio size={13} className="text-amber-400" />
        <span className="hidden sm:inline">Tray (Alt+C)</span>
      </button>

      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1200, 0.03);
          if (onToggleDiceDock) {
            onToggleDiceDock();
          } else {
            window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
          }
        }}
        className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
        title="Toggle Quick Dice Roller Tray (Alt+D)"
      >
        <Dices size={13} className="text-amber-400" />
        <span className="hidden sm:inline">Dice (Alt+D)</span>
      </button>
    </div>
  );
};
