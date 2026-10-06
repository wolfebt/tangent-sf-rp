import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, 
  Sliders, 
  PanelRightClose, 
  PanelRight,
  Sparkles 
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export default function ToolbarQuickActions({
  moduleHealth,
  onToggleCompiler,
  isCompilerOpen,
  studioMode,
  setStudioMode,
  perspectiveMode,
  togglePerspectiveMode,
  targetMapId,
  universeState,
  activeNode,
  pendingCronicleCount,
  isCronicleOpen,
  onToggleCronicle,
  isScratchbookOpen,
  onToggleScratchbook,
  isPrintModalOpen,
  onTogglePrintModal,
  isRightDockOpen,
  onToggleRightDock,
  activeCockpitDeck,
  onSelectCockpitDeck
}) {
  const navigate = useNavigate();

  const handleToggleStudioMode = () => {
    const nextMode = studioMode === 'live_session' ? 'development' : 'live_session';
    AudioService.playTerminalBeep(nextMode === 'live_session' ? 1400 : 1000, 0.04);
    if (setStudioMode) setStudioMode(nextMode);
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0 font-mono">
      {/* Module Health Badge */}
      {moduleHealth && (
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.05);
            onToggleCompiler?.(true);
          }}
          className={`px-2 py-1 rounded-xl text-[11px] font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${moduleHealth.color}`}
          title={`Module Health: ${moduleHealth.score}%\n${[...moduleHealth.issues, ...moduleHealth.warnings].join('\n') || 'All systems nominal'}\nClick to inspect in Compiler / Preflight`}
        >
          <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
          <span>{moduleHealth.score}%</span>
          <span className="hidden xl:inline text-[10px] opacity-75">HEALTH</span>
        </button>
      )}

      {/* Studio Mode Toggle (Development vs Live Session) */}
      <button
        type="button"
        onClick={handleToggleStudioMode}
        className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
          studioMode === 'live_session'
            ? 'bg-rose-950/90 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
            : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
        }`}
        title={studioMode === 'live_session' ? "Live Session Mode Active: Area maximized, stage active. Click to return to Development Mode." : "Development Mode: Creative authoring. Click to switch to Live Session."}
      >
        <span>{studioMode === 'live_session' ? '🔴' : '🛠️'}</span>
        <span className="hidden lg:inline">{studioMode === 'live_session' ? 'LIVE SESSION' : 'DEV MODE'}</span>
      </button>

      {/* Dual Perspective Mode Toggle: ARCHITECT vs OPERATOR */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(perspectiveMode === 'architect' ? 1400 : 900, 0.03);
          togglePerspectiveMode?.();
        }}
        className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
          perspectiveMode === 'operator'
            ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            : 'bg-indigo-950/80 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
        }`}
        title={perspectiveMode === 'operator' ? "Operator Perspective: Focused on live session execution & OSR running. Click to switch to Architect." : "Architect Perspective: Deep authoring, scenario structuring & world-building. Click to switch to Operator."}
      >
        <span>{perspectiveMode === 'operator' ? '🎮' : '📐'}</span>
        <span className="hidden lg:inline">{perspectiveMode === 'operator' ? 'OPERATOR' : 'ARCHITECT'}</span>
      </button>

      {/* Compile / Prep for VTT */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1100, 0.05);
          onToggleCompiler?.(true);
        }}
        className={`px-2.5 py-1 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
          isCompilerOpen
            ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-cyan-500/50 hover:border-cyan-400'
        }`}
        title="Compile Story, Maps, and Elements into a prepped VTT package"
      >
        <span>⚙️</span>
        <span className="hidden xl:inline">PREP VTT MODULE</span>
        <span className="xl:hidden">PREP VTT</span>
      </button>

      {/* AIME Co-Pilot Access Button */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1400, 0.03);
          if (onSelectCockpitDeck) onSelectCockpitDeck('aime');
          if (onToggleRightDock) onToggleRightDock(true);
        }}
        className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
          isRightDockOpen && activeCockpitDeck === 'aime'
            ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
            : 'bg-slate-900/90 text-amber-400 hover:text-amber-200 border-amber-500/50 hover:border-amber-400'
        }`}
        title="Launch AIME Narrative Co-Pilot"
      >
        <Sparkles size={13} className="text-amber-400 animate-pulse" />
        <span>AIME</span>
      </button>

      {/* Deploy to STAGE VTT */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1400, 0.05);
          const mapId = targetMapId || universeState?.maps?.[0]?.id || '';
          navigate(`/stage?mapId=${mapId}&scenarioId=${activeNode?.id || ''}`);
        }}
        className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
        title="Deploy active scenario and elements into The Stage VTT"
      >
        <span>⚔️</span>
        <span className="hidden xl:inline">DEPLOY TO STAGE</span>
        <span className="xl:hidden">STAGE</span>
      </button>

      {/* Fast-Access Modals Cluster */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 gap-0.5 shadow-sm">
        {/* Cronicle */}
        <button
          type="button"
          onClick={() => onToggleCronicle?.(true)}
          className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
            isCronicleOpen
              ? 'bg-amber-950 text-amber-200 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'text-amber-400/90 hover:text-amber-200 hover:bg-slate-800/80 border border-transparent'
          }`}
          title="Cronicle Living Memory Deck"
        >
          <span>📜</span>
          {pendingCronicleCount > 0 && (
            <span className="text-[10px] px-1 rounded-full bg-amber-500 text-black font-mono font-bold animate-pulse">
              {pendingCronicleCount}
            </span>
          )}
        </button>

        {/* Scratchbook */}
        <button
          type="button"
          onClick={() => onToggleScratchbook?.(true)}
          className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
            isScratchbookOpen
              ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'text-emerald-400 hover:text-emerald-200 hover:bg-slate-800/80 border border-transparent'
          }`}
          title="Project Scratchbook & Aggregated Elements Document"
        >
          <span>📓</span>
        </button>

        {/* Print */}
        <button
          type="button"
          onClick={() => onTogglePrintModal?.(true)}
          className={`px-2 py-1 rounded-lg text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
            isPrintModalOpen
              ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-800/80 border border-transparent'
          }`}
          title="Print & PDF Publishing Spread"
        >
          <Printer size={12} />
        </button>
      </div>

      {/* Master Right Cockpit Dock Toggle */}
      {onToggleRightDock && (
        <button
          type="button"
          onClick={onToggleRightDock}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
            isRightDockOpen
              ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
          title={isRightDockOpen ? "Collapse Right Cockpit Dock (])" : "Expand Right Cockpit Dock (])"}
        >
          <Sliders size={12} className={isRightDockOpen ? 'text-cyan-400' : 'text-slate-400'} />
          <span className="hidden md:inline">COCKPIT</span>
          {isRightDockOpen ? <PanelRightClose size={13} /> : <PanelRight size={13} />}
        </button>
      )}
    </div>
  );
}
