/**
 * @file EpistemicPlayPanel.jsx
 * @description Master Epistemic Interaction Panel for ADE Story Module.
 * Implements mechanics impossible with traditional branching trees:
 *   1. Open-Ended Terminal Hacking Console (CLI-based node exploration, Tech Level checks, slicing DC)
 *   2. Free-Form NPC Interrogation Workbench (Dynamic motive probing, deception checks, secret reveals)
 */

import React, { useState } from 'react';
import { adjudicateActionCheck } from '../../../../services/ade/adeEngineBridge.ts';
import { AudioService } from '../../../../services/audioService.js';
import { Terminal, MessageSquare, Brain, Shield, Send, CheckCircle2, AlertTriangle, XCircle, Copy, CornerDownRight } from 'lucide-react';

export default function EpistemicPlayPanel({
  isOpen,
  onClose,
  activeOperative,
  onInsertToProse
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'interrogation'

  // ── TERMINAL HACKING CONSOLE STATE ──
  const [terminalTL, setTerminalTL] = useState(3);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'sys', text: 'OMNICORTEX SECURE NODE v4.19 INITIALIZED' },
    { type: 'sys', text: 'Sub-System Hardware: TL-3 Optical Encryption Matrix' },
    { type: 'prompt', text: 'Type "help", "ls", "cat logs.dat", or "slice [subsystem]" to probe node.' }
  ]);

  // ── NPC INTERROGATION STATE ──
  const [suspectName, setSuspectName] = useState('Informant Jaxen');
  const [suspectArchetype, setSuspectArchetype] = useState('Syndicate Courier');
  const [interrogationQuery, setInterrogationQuery] = useState('');
  const [interrogationHistory, setInterrogationHistory] = useState([
    { speaker: 'suspect', text: 'I already told your enforcers everything I know. I was just delivering an encrypted drive to the docking bay.' }
  ]);
  const [activeSkill, setActiveSkill] = useState('Etiquette'); // 'Etiquette' | 'Intimidation' | 'Perception'

  // Handle Terminal CLI command execution
  const handleRunTerminalCommand = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    AudioService.playTerminalBeep(1200, 0.03);

    const newLogs = [...terminalLogs, { type: 'input', text: `> ${cmd}` }];

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      newLogs.push({ type: 'sys', text: 'Available commands: ls, cat <file>, slice <target>, status, clear' });
    } else if (lower === 'ls') {
      newLogs.push({ type: 'sys', text: 'FILES: [auth_matrix.key] [comm_intercept.log] [cargo_manifest.enc]' });
    } else if (lower.startsWith('cat')) {
      const fileName = lower.replace('cat', '').trim();
      if (fileName.includes('manifest')) {
        newLogs.push({ type: 'info', text: 'CARGO MANIFEST: 40x Photonic Power Cells bound for Sector 7 Precursor Vault.' });
      } else if (fileName.includes('intercept')) {
        newLogs.push({ type: 'info', text: 'INTERCEPT: "The courier arrived at Docking Ring 4. Suppress the automated sentries before operative sweep."' });
      } else {
        newLogs.push({ type: 'error', text: `Access Denied: ${fileName} requires elevated slicing privileges.` });
      }
    } else if (lower.startsWith('slice') || lower.startsWith('hack') || lower.startsWith('override')) {
      // Execute canonical 2d10 action check with Tech Level verification!
      const targetEntity = { name: 'Secure Terminal', techLevel: terminalTL };
      const mandate = adjudicateActionCheck({
        actionText: cmd,
        operative: activeOperative,
        targetEntity,
        targetDC: 12
      });

      if (mandate.systemIntent === 'REFUSE_ACTION') {
        newLogs.push({ type: 'error', text: `[SYSTEM REFUSAL]: ${mandate.narrativeBounds.refusalReason}. Operative deck is TL-${activeOperative?.techLevel ?? 2}, target is TL-${terminalTL}. Capacitor feedback discharges!` });
      } else if (mandate.systemIntent === 'EXECUTE_SUCCESS' || mandate.systemIntent === 'CRITICAL_TRIUMPH') {
        newLogs.push({ type: 'success', text: `[DECRYPTION SUCCESS (+${mandate.diceSummary.margin})]: Firewall bypassed. Root shell unlocked! Secret keys extracted.` });
      } else {
        newLogs.push({ type: 'warning', text: `[INTRUSION RESISTED (${mandate.diceSummary.margin})]: Trace protocol initiated. Sector alarm counter +1.` });
      }
    } else if (lower === 'clear') {
      setTerminalLogs([{ type: 'sys', text: 'Terminal cleared.' }]);
      return;
    } else {
      newLogs.push({ type: 'error', text: `Command not recognized: "${cmd}". Type "help" for options.` });
    }

    setTerminalLogs(newLogs);
  };

  // Handle Free-Form Interrogation
  const handleAskInterrogation = (e) => {
    e.preventDefault();
    if (!interrogationQuery.trim()) return;
    const query = interrogationQuery.trim();
    setInterrogationQuery('');
    AudioService.playTerminalBeep(1100, 0.03);

    // Roll 2d10 check
    const mandate = adjudicateActionCheck({
      actionText: `${activeSkill} interrogation: "${query}"`,
      operative: activeOperative,
      targetEntity: { name: suspectName },
      targetDC: 13
    });

    const isSuccess = mandate.systemIntent === 'EXECUTE_SUCCESS' || mandate.systemIntent === 'CRITICAL_TRIUMPH';
    let npcReply = '';

    if (isSuccess) {
      npcReply = `[Crack in composure (+${mandate.diceSummary.margin} margin)]: "Alright! Don't involve my family. The drive has coordinates to the syndicate sub-level behind the hydroponics bay. The passcode is 7-0-4-1."`;
    } else {
      npcReply = `[Deception maintained (${mandate.diceSummary.margin} margin)]: "You're bluffing. Your jurisdiction ends at this airlock, operative. You don't have the clearance to hold me."`;
    }

    setInterrogationHistory(prev => [
      ...prev,
      { speaker: 'operative', text: query, skill: activeSkill, margin: mandate.diceSummary.margin, isSuccess },
      { speaker: 'suspect', text: npcReply }
    ]);
  };

  const handleExportToStory = () => {
    if (activeTab === 'terminal') {
      const text = terminalLogs.map(l => `${l.text}`).join('\n');
      onInsertToProse(`<blockquote style="border-left: 3px solid #06b6d4; padding-left: 10px; margin: 10px 0; background: rgba(8,51,68,0.3);"><pre style="font-family: monospace; font-size: 11px;">${text}</pre></blockquote>`);
    } else {
      const text = interrogationHistory.map(h => `<p><strong>${h.speaker === 'operative' ? (activeOperative?.name || 'Operative') : suspectName}:</strong> ${h.text}</p>`).join('');
      onInsertToProse(text);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#090d16] border border-amber-500/60 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 flex items-center justify-center text-sm">
              <Brain size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Epistemic Interaction Workbench
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Dynamic information discovery & mechanics beyond static branching trees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  activeTab === 'terminal' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CLI Slicing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('interrogation')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  activeTab === 'interrogation' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Interrogation
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: Terminal Slicing Console */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Terminal size={13} />
                <span>Target Node: Sec-Terminal #4</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Terminal Tech Level:</span>
                <select
                  value={terminalTL}
                  onChange={e => setTerminalTL(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded px-1.5 py-0.5 outline-none font-bold"
                >
                  <option value={1}>TL-1 (Industrial)</option>
                  <option value={2}>TL-2 (Interstellar)</option>
                  <option value={3}>TL-3 (Advanced)</option>
                  <option value={4}>TL-4 (Hard-Light)</option>
                  <option value={5}>TL-5 (Precursor)</option>
                </select>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="flex-1 overflow-y-auto bg-black p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 scrollbar-thin select-text">
              {terminalLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={
                    log.type === 'input' ? 'text-amber-300 font-bold' :
                    log.type === 'success' ? 'text-emerald-400 font-bold' :
                    log.type === 'error' ? 'text-rose-400 font-bold' :
                    log.type === 'info' ? 'text-cyan-300' : 'text-slate-400'
                  }
                >
                  {log.text}
                </div>
              ))}
            </div>

            {/* Command Input Form */}
            <form onSubmit={handleRunTerminalCommand} className="flex gap-2">
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="Enter command (e.g. ls, cat cargo_manifest.enc, slice firewall)..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-xl text-xs outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Execute
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Free-Form NPC Interrogation */}
        {activeTab === 'interrogation' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-purple-300 font-bold flex items-center gap-1.5">
                <MessageSquare size={13} />
                <span>Interrogating: {suspectName} ({suspectArchetype})</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Social Check:</span>
                <select
                  value={activeSkill}
                  onChange={e => setActiveSkill(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-purple-300 text-xs rounded px-1.5 py-0.5 outline-none font-bold"
                >
                  <option value="Etiquette">Etiquette (Charm/Persuasion)</option>
                  <option value="Intimidation">Intimidation (Threats/Force)</option>
                  <option value="Perception">Perception (Spotting Lies)</option>
                </select>
              </div>
            </div>

            {/* Dialogue History Feed */}
            <div className="flex-1 overflow-y-auto bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2.5 scrollbar-thin select-text">
              {interrogationHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border ${
                    item.speaker === 'operative' 
                      ? 'bg-purple-950/40 border-purple-500/30 text-purple-200 ml-4' 
                      : 'bg-slate-900 border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className={item.speaker === 'operative' ? 'text-purple-400' : 'text-amber-400'}>
                      {item.speaker === 'operative' ? `Operative (${item.skill} Check)` : suspectName}
                    </span>
                    {item.margin !== undefined && (
                      <span className={item.isSuccess ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.isSuccess ? `✓ Margin +${item.margin}` : `✗ Margin ${item.margin}`}
                      </span>
                    )}
                  </div>
                  <p className="font-sans leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Interrogation Query Form */}
            <form onSubmit={handleAskInterrogation} className="flex gap-2">
              <input
                type="text"
                value={interrogationQuery}
                onChange={e => setInterrogationQuery(e.target.value)}
                placeholder="Ask open-ended question or press suspect for intelligence..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-400 text-slate-100 p-2 rounded-xl text-xs outline-none font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Question
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-[10px] text-slate-500">
            Adjudicated via canonical Tangent SFF RPG 2d10 rules engine
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportToStory}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={12} />
              <span>Insert Log into Manuscript</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
