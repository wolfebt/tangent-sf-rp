/**
 * @file ControlPanelStudio.jsx
 * @description OSR Two-Page Control Panel Workspace for Tangent SF RP.
 * Enforces high-scannability 2-column layout, boxed sensory read-alouds,
 * bracketed attribute check badges, and 3-Tier Threat Matrix cards.
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Dices
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export default function ControlPanelStudio({ 
  activeNode, 
  onUpdateContent,
  onExecuteRoll
}) {
  const [readAloud, setReadAloud] = useState(
    activeNode?.fields?.readAloud ||
    'The airlock vents cold nitrogen into the corridor. Flickering amber emergency strobes illuminate scorched hull plating and severed conduit cables swinging from the bulkhead ceiling.'
  );

  const [bulletPoints, setBulletPoints] = useState(
    activeNode?.fields?.bulletPoints || [
      'Bulkhead Blast Door: Heavy reinforced titanium [Athletics DC 16] to pry open manually or [Tech DC 14] to bypass servo control.',
      'Atmospheric Decompression: Hull breach hazard ticking every round. [Reflex DC 15] or suffer 1d6 kinetic puncture damage.',
      'Encrypted Comm Console: Contains flight logs of the fallen syndicate freighter. Requires [Intellect DC 13] to decipher encryption.'
    ]
  );

  const [threats, setThreats] = useState(
    activeNode?.fields?.threats || [
      { name: 'Scythe Vanguard Sentinel', tier: 'High Threat', hp: 28, dr: '6 Kin / 4 Eng', attack: '2d10+4 Plasma Carbine' },
      { name: 'Automated Sentry Drone', tier: 'Medium Threat', hp: 14, dr: '4 Kin / 2 Eng', attack: '1d12+2 Rotary Laser' }
    ]
  );

  const handleRollCheck = (dcText) => {
    AudioService.playTerminalBeep(1400, 0.05);
    if (onExecuteRoll) {
      onExecuteRoll(`/roll 2d10 # Check vs ${dcText}`);
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0e17] text-slate-200 overflow-y-auto p-6 font-sans select-none space-y-6 scrollbar-thin">
      {/* Studio Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-amber-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-300">
            OSR CONTROL PANEL STUDIO &bull; {activeNode?.title || 'SECTOR BRIEFING'}
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
          LAYOUT: 2-PAGE SPREAD ENFORCED
        </span>
      </div>

      {/* Main 2-Column Responsive Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: SENSORY READ-ALOUD & TACTICAL INTERACTION BULLETS */}
        <div className="space-y-4">
          {/* Sensory Read-Aloud Box */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                SENSORY READ-ALOUD (GM SCRIPT)
              </span>
              <span className="text-[10px] text-slate-500">2-3 SENTENCES MAX</span>
            </div>
            <textarea
              value={readAloud}
              onChange={(e) => setReadAloud(e.target.value)}
              className="w-full h-24 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl font-serif italic text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed"
            />
          </div>

          {/* Bulleted Interaction Prompts with Bracketed DCs */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-cyan-400" />
              <span>SCANNABLE BULLET POINTS & BRACKETED DCS</span>
            </div>

            <div className="space-y-2">
              {bulletPoints.map((bp, index) => (
                <div 
                  key={index}
                  className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start justify-between gap-2"
                >
                  <span className="font-sans leading-relaxed">{bp}</span>
                  <button
                    type="button"
                    onClick={() => handleRollCheck(bp.slice(0, 30))}
                    className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-colors shrink-0 cursor-pointer"
                    title="Execute test roll for this DC"
                  >
                    <Dices size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2: 3-TIER THREAT MATRIX & SECRET GM HAZARDS */}
        <div className="space-y-4">
          {/* Threat Matrix Statblocks */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="text-xs font-mono text-red-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-red-400" />
              <span>3-TIER THREAT MATRIX</span>
            </div>

            <div className="space-y-2.5">
              {threats.map((threat, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 font-mono text-xs space-y-1.5 break-inside-avoid shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{threat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                      {threat.tier}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-slate-400">
                    <div>HP: <span className="text-emerald-400 font-bold">{threat.hp}</span></div>
                    <div>DR: <span className="text-cyan-300 font-bold">{threat.dr}</span></div>
                    <div className="col-span-2">ATTACK: <span className="text-amber-300">{threat.attack}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GM Operational Secrets & Discoveries */}
          <div className="p-4 bg-slate-950/80 border border-purple-500/40 rounded-2xl space-y-2">
            <div className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={14} className="text-purple-400" />
              <span>CLASSIFIED GM DISCOVERY / COMPLICATION</span>
            </div>
            <p className="text-xs text-purple-200/90 font-sans italic leading-relaxed">
              If the operatives trigger an unsuppressed kinetic weapon discharge, the acoustic reverberation alerts the patrol in Sub-Level 3. Reinforcements arrive in 3 combat rounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
