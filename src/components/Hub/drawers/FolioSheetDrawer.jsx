import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Maximize2, X, List } from 'lucide-react';
import FolioContainer from '../../Folio/FolioContainer';
import { AudioService } from '../../../services/audioService';

export const FolioSheetDrawer = ({ onClose, onOpenRoster }) => {
  const navigate = useNavigate();

  const handleOpenFullBrowser = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate('/folio');
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2 select-none">
      {/* Top Banner Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl border border-cyan-500/50 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Users size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                PERSONA FOLIO OPERATIVE SHEET
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold">
                INTERACTIVE SHEET
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Operative builder, attributes, skills, equipment, and point budget pools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenRoster && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenRoster();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              title="Return to Operative Roster Catalog"
            >
              <List size={12} className="text-cyan-400" />
              <span>ROSTER</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenFullBrowser}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            title="Open Persona Folio in Full Browser View (/folio)"
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">FULL BROWSER VIEW</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Folio Drawer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Folio Container Workspace */}
      <div className="flex-1 min-h-[450px] rounded-xl border border-slate-800/90 overflow-hidden bg-[#0d1117]/95 shadow-inner flex flex-col">
        <FolioContainer />
      </div>
    </div>
  );
};

export default FolioSheetDrawer;
