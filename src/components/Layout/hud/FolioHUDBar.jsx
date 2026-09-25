import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Bot, 
  Save, 
  Eye, 
  Lock, 
  Unlock, 
  Copy, 
  ChevronDown, 
  BookOpen, 
  UserPlus, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  FileText,
  Zap
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const FolioHUDBar = ({
  characterData,
  computeSpentCP,
  isCharacterSelected,
  isBastionOpen,
  setIsBastionOpen,
  cloudSaveStatus,
  isLocked,
  isPlayerOverride,
  isInActiveGame,
  allowPlayerOverride,
  lockPersona,
  unlockPersona,
  clonePersonaVariant,
  handleSaveLocal,
  handleExportAsStoryElement,
  handleOpenGuide,
  confirm
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFolioMenuOpen, setIsFolioMenuOpen] = useState(false);
  const folioMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (folioMenuRef.current && !folioMenuRef.current.contains(event.target)) {
        setIsFolioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isCharacterSelected) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400/80 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
          OPERATIVE CATALOG
        </span>
        <button
          type="button"
          onClick={() => {
            if (setIsBastionOpen) setIsBastionOpen(prev => !prev);
            window.dispatchEvent(new CustomEvent('toggle-folio-bastion'));
          }}
          className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 cyan-shadow-thin shrink-0"
          title="Toggle BASTION AI (Rules assistant & character generator)"
        >
          <Bot size={13} className="text-cyan-400" />
          <span className="hidden sm:inline">BASTION</span>
        </button>
      </div>
    );
  }

  const startingCP = parseInt(characterData?.['starting-cp'] || 150, 10);
  const spentCP = computeSpentCP ? computeSpentCP() : 0;
  const percent = Math.min(100, Math.max(0, (spentCP / startingCP) * 100));
  const isOver = spentCP > startingCP;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Real-time CP Budget Bar (Desktop) */}
      <div
        onClick={() => window.dispatchEvent(new CustomEvent('open-folio-economy'))}
        className={`hidden lg:flex cursor-pointer bg-slate-950 border rounded-lg px-2.5 py-1 flex-col min-w-[130px] sm:min-w-[150px] hover:border-cyan-400 transition-all cyan-shadow-thin ${
          isOver
            ? 'border-red-500 ring-2 ring-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
            : 'border-cyan-500/50'
        }`}
        title="Click to view detailed CP Economy & Point Pools breakdown"
      >
        <div className="flex justify-between items-center text-[9px] font-bold uppercase font-mono">
          <span className="text-slate-400">CP BUDGET:</span>
          <span className={isOver ? 'text-red-400 font-bold' : 'text-amber-400'}>
            {spentCP} / {startingCP} CP
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full transition-all duration-300 ${isOver ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-amber-400'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Compact CP Badge (Mobile) */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('open-folio-economy'))}
        className={`lg:hidden flex items-center gap-1.5 px-2 py-1 bg-slate-950 border rounded-lg font-mono text-[10px] cursor-pointer shrink-0 cyan-shadow-thin ${
          isOver
            ? 'border-red-500 text-red-300 ring-1 ring-red-500/80 animate-pulse'
            : 'border-cyan-500/40 text-cyan-300'
        }`}
        title="Click to inspect CP Economy"
      >
        <span className="text-slate-400 text-[9px]">CP:</span>
        <span className={`font-bold ${isOver ? 'text-red-400' : 'text-amber-400'}`}>{spentCP}/{startingCP}</span>
      </button>

      {/* Operative Catalog Navigation Trigger */}
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1150, 0.03);
          window.dispatchEvent(new CustomEvent('open-folio-catalog'));
        }}
        className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 cyan-shadow-thin shrink-0 max-w-[140px] sm:max-w-[200px]"
        title={characterData?.['char-name'] ? `Operative: ${characterData['char-name']} (Click to switch operative or open catalog)` : "Open Operative Catalog & Persona Roster"}
      >
        <Users size={13} className="text-cyan-400 shrink-0" />
        <span className="truncate">{characterData?.['char-name'] || 'Operative Catalog'}</span>
      </button>

      {/* Bastion AI Trigger */}
      <button
        type="button"
        onClick={() => {
          if (setIsBastionOpen) setIsBastionOpen(prev => !prev);
          window.dispatchEvent(new CustomEvent('toggle-folio-bastion'));
        }}
        className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 cyan-shadow-thin shrink-0"
        title="Toggle BASTION AI (Rules assistant & character generator)"
      >
        <Bot size={13} className="text-cyan-400" />
        <span className="hidden sm:inline">BASTION</span>
      </button>

      {/* Folio File Menu Dropdown */}
      <div className="relative shrink-0" ref={folioMenuRef}>
        <button
          type="button"
          onClick={() => setIsFolioMenuOpen(prev => !prev)}
          className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cyan-shadow-thin cursor-pointer"
          title="Folio System Tools & File Actions Menu"
        >
          <span className="hidden xs:inline">File Menu</span>
          <span className="xs:hidden">Files</span>
          <ChevronDown size={11} className="text-cyan-400" />
        </button>

        {isFolioMenuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-cyan-500/50 rounded-lg shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-1 backdrop-blur-md"
            onClick={() => setIsFolioMenuOpen(false)}
          >
            {/* Save Dossier */}
            <button
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                window.dispatchEvent(new CustomEvent('trigger-folio-save'));
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-emerald-950/80 text-emerald-300 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
              title="Save current persona sheet to Operative Roster and Cloud Storage"
            >
              <span className="flex items-center gap-1.5">
                <Save size={13} className="text-emerald-400" />
                <span>Save Dossier</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {cloudSaveStatus === 'saving' ? 'Saving...' : cloudSaveStatus === 'saved' ? 'Saved' : 'Ready'}
              </span>
            </button>

            {!isLocked ? (
              <>
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.03);
                    window.dispatchEvent(new CustomEvent('set-folio-view-mode', { detail: 'play' }));
                    if (!location.pathname.startsWith('/folio')) {
                      navigate('/folio');
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
                  title="Preview Tactical Play Cockpit without locking the sheet"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} className="text-cyan-400" />
                    <span>Preview Tactical Play</span>
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono">PREVIEW</span>
                </button>

                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.03);
                    if (lockPersona) {
                      const ok = lockPersona();
                      if (ok) window.dispatchEvent(new CustomEvent('set-folio-view-mode', { detail: 'play' }));
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
                  title="Lock and set persona into Tactical Play Mode ready for VTT deployment"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} className="text-cyan-400" />
                    <span>Lock for VTT (Play Mode)</span>
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono">PLAY</span>
                </button>
              </>
            ) : !isPlayerOverride ? (
              !isInActiveGame ? (
                <button
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.03);
                    if (unlockPersona) {
                      unlockPersona();
                      window.dispatchEvent(new CustomEvent('set-folio-view-mode', { detail: 'builder' }));
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-amber-950/80 text-amber-300 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
                  title="Unlock folio to return to Builder Mode"
                >
                  <span className="flex items-center gap-1.5">
                    <Unlock size={13} className="text-amber-400" />
                    <span>Unlock Sheet (Builder Mode)</span>
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono">EDIT</span>
                </button>
              ) : allowPlayerOverride ? (
                <button
                  onClick={async () => {
                    AudioService.playTerminalBeep(1100, 0.03);
                    const res = await confirm({
                      title: 'Player Override Request',
                      message: 'Enter note or reason for modifying this persona sheet during active VTT session (optional, logged for GM review):',
                      inputLabel: 'Reason / Justification',
                      placeholder: 'e.g. GM authorized modification...',
                      confirmLabel: 'Unlock Sheet'
                    });
                    if (res?.confirmed && unlockPersona) {
                      unlockPersona(res.value || '');
                      window.dispatchEvent(new CustomEvent('set-folio-view-mode', { detail: 'builder' }));
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-amber-950/80 text-amber-300 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
                  title="Unlock folio via player override to make changes during active VTT session"
                >
                  <span className="flex items-center gap-1.5">
                    <Unlock size={13} className="text-amber-400" />
                    <span>Player Override (Unlock)</span>
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono">OVERRIDE</span>
                </button>
              ) : (
                <div
                  className="w-full text-left px-3 py-1.5 text-slate-500 uppercase font-bold rounded flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                  title="Player Override is disabled by the GM for this session. Direct sheet modifications are locked."
                >
                  <Lock size={13} className="text-slate-500" />
                  <span>Locked (Override Disallowed)</span>
                </div>
              )
            ) : (
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.03);
                  if (lockPersona) {
                    const ok = lockPersona();
                    if (ok) window.dispatchEvent(new CustomEvent('set-folio-view-mode', { detail: 'play' }));
                  }
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-200 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
                title="Lock sheet again and return to Tactical Play Mode"
              >
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-cyan-400" />
                  <span>Relock for VTT (Play Mode)</span>
                </span>
                <span className="text-[9px] text-cyan-400 font-mono">PLAY</span>
              </button>
            )}

            <button
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                if (clonePersonaVariant) clonePersonaVariant();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
              title="Branch an unlocked development variant of this persona without modifying the set version"
            >
              <Copy size={13} className="text-cyan-400" />
              <span>Clone Variant</span>
            </button>

            <div className="border-t border-slate-800 my-0.5" />
            <button
              onClick={() => handleOpenGuide?.('folio')}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={13} className="text-cyan-400" />
              <span>User Guide &amp; Manual</span>
            </button>
            <div className="border-t border-slate-800 my-0.5" />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-folio-new-character'))}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={13} className="text-cyan-400" />
              <span>New Operative (Manual)</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-folio-guided-creator'))}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={13} className="text-amber-400" />
              <span>New Operative (Guided)</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-folio-delete-character'))}
              className="w-full text-left px-3 py-1.5 hover:bg-red-950/80 text-red-400 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} className="text-red-400" />
              <span>Delete Operative</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-folio-clear-character'))}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-400 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} className="text-slate-400" />
              <span>Clear Sheet Data</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-folio-preview'))}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-slate-200 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={13} className="text-cyan-400" />
              <span>Preview Dossier</span>
            </button>
            <div className="border-t border-slate-800 my-0.5" />
            <button
              onClick={handleSaveLocal}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-amber-300 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} className="text-amber-400" />
              <span>Save to File (.json)</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-folio-load-local'))}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-amber-300 uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={13} className="text-amber-400" />
              <span>Load File / Story Element</span>
            </button>
            <button
              onClick={handleExportAsStoryElement}
              className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/80 text-cyan-300 uppercase font-bold rounded flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-cyan-400" />
                <span>Export Story Element</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">ADE Studio</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
