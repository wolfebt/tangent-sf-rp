/**
 * @file CockpitPanel.tsx
 * @description Right Zone: Operational Cockpit (Player) & Dynamic Inspector (GM).
 * Built strictly on Tangent SF RP rules: 4 AP Action Economy, Armor DR,
 * Called Shots & Trauma thresholds, Essence invocations, Mecha sockets,
 * and multi-monitor Popout Portal.
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Target, 
  Activity, 
  Cpu, 
  FileText, 
  Swords,
  ExternalLink
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { TangentActionDeck } from './TangentActionDeck';
import type { CalledShotLocation } from './TangentActionDeck';
import { MechaCompanionDeck } from './MechaCompanionDeck';
import { GMInspector } from './GMInspector';
import { PopoutPortal } from './PopoutPortal';

export const CockpitPanel: React.FC = () => {
  const { 
    activeCockpitTab, 
    setActiveCockpitTab, 
    userRole, 
    setUserRole 
  } = useUILayoutStore();

  const folio = (useFolio() || {}) as any;
  const character = folio?.characterData || {};

  // Tangent Rules State
  const [calledShotTarget, setCalledShotTarget] = useState<CalledShotLocation>('torso');
  const [currentAp, setCurrentAp] = useState<number>(4);
  const maxAp = 4; // Tangent baseline AP

  // Popout state for multi-monitor native window
  const [isPoppedOut, setIsPoppedOut] = useState<boolean>(false);

  // Notes state with persistence
  const [fieldNotes, setFieldNotes] = useState<string>(() => {
    return localStorage.getItem('tangent_vtt_notes') || '';
  });

  const handleNotesChange = (val: string) => {
    setFieldNotes(val);
    localStorage.setItem('tangent_vtt_notes', val);
  };

  const hpCurrent = character?.['hit-points']?.current ?? 28;
  const hpMax = character?.['hit-points']?.max ?? 28;
  const kineticDr = character?.['armor-dr']?.kinetic ?? 6;
  const energyDr = character?.['armor-dr']?.energy ?? 4;
  const characterName = character?.name || 'Operative Echo';

  const cockpitContent = (
    <div className="w-full h-full flex flex-col bg-[#0c1017] text-slate-200 overflow-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* COCKPIT HEADER: Role Switcher & Popout Button                             */}
      {/* ========================================================================= */}
      <div className="h-10 px-3 border-b border-slate-800/80 bg-[#0d121a] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Activity size={13} />
            {userRole === 'gm' ? 'DYNAMIC INSPECTOR' : 'OPERATIVE COCKPIT'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Popout Button for Secondary Display */}
          <button
            type="button"
            onClick={() => setIsPoppedOut(true)}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            title="Pop out into native OS window for secondary monitor"
          >
            <ExternalLink size={13} />
          </button>

          {/* Role Toggle Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                setUserRole('player');
                if (activeCockpitTab === 'inspector') setActiveCockpitTab('vitals');
              }}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                userRole === 'player'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Player
            </button>
            <button
              type="button"
              onClick={() => {
                setUserRole('gm');
                setActiveCockpitTab('inspector');
              }}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                userRole === 'gm'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              GM
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION VITALS BAR: Pinned HP, Armor DR, AP & Trauma Tracker               */}
      {/* ========================================================================= */}
      <div className="p-2.5 border-b border-slate-800/80 bg-[#0a0e14] shrink-0 space-y-2">
        {/* Name & Identity */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-100 truncate">{characterName}</span>
          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
            AP: {currentAp} / {maxAp}
          </span>
        </div>

        {/* HP Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-mono mb-0.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Heart size={10} className="text-red-400" /> VITALITY:
            </span>
            <span className="text-slate-200 font-bold">{hpCurrent} / {hpMax} HP</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (hpCurrent / hpMax) * 100)}%` }}
            />
          </div>
        </div>

        {/* Armor DR & AP Quick Counters */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-[10px] font-mono">
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">KIN DR</span>
            <span className="font-bold text-cyan-300">{kineticDr}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">ENG DR</span>
            <span className="font-bold text-sky-300">{energyDr}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">TRAUMA</span>
            <span className="font-bold text-red-400">0/3</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COCKPIT SUB-TABS STRIP                                                    */}
      {/* ========================================================================= */}
      <div className="h-8 px-2 border-b border-slate-800/80 bg-[#0d121a] flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveCockpitTab('vitals')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'vitals' || activeCockpitTab === 'actions'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords size={11} />
          <span>Actions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('mecha')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'mecha'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={11} />
          <span>Mecha & Sockets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('inspector')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'inspector'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target size={11} />
          <span>Inspector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('notes')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'notes'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={11} />
          <span>Notes</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* COCKPIT TAB BODY                                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
        {/* TAB 1: TANGENT ACTION DECK (4 AP, Called Shots, Weapons, Tactics, Essence) */}
        {(activeCockpitTab === 'vitals' || activeCockpitTab === 'actions') && (
          <TangentActionDeck
            currentAp={currentAp}
            maxAp={maxAp}
            onConsumeAp={(amount) => setCurrentAp(prev => Math.max(0, Math.min(maxAp, prev - amount)))}
            onResetAp={() => setCurrentAp(maxAp)}
            calledShotTarget={calledShotTarget}
            onSetCalledShotTarget={setCalledShotTarget}
          />
        )}

        {/* TAB 2: MECHA & MODULAR SOCKET MATRIX */}
        {activeCockpitTab === 'mecha' && (
          <MechaCompanionDeck />
        )}

        {/* TAB 3: GM DYNAMIC INSPECTOR & MULTI-ENTITY BATCH CONTROLS */}
        {activeCockpitTab === 'inspector' && (
          <GMInspector />
        )}

        {/* TAB 4: PERSISTED FIELD NOTES */}
        {activeCockpitTab === 'notes' && (
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-slate-300 font-bold flex items-center gap-1.5">
              <FileText size={14} className="text-amber-400" />
              <span>FIELD NOTES & REVEALED CLUES</span>
            </div>
            <textarea
              value={fieldNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Record operational coordinates, intercepted transmissions, tactical clues..."
              className="w-full h-48 p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none scrollbar-thin"
            />
            <div className="text-[10px] text-slate-500 text-right">
              Persisted to local storage &bull; {fieldNotes.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PopoutPortal
      title="Tangent SF RP - Operative Cockpit"
      isOpen={isPoppedOut}
      onClose={() => setIsPoppedOut(false)}
    >
      {cockpitContent}
    </PopoutPortal>
  );
};

export default CockpitPanel;
