import React, { useState } from 'react';
import {
  CYBER_TARGET_NODES,
  CANONICAL_DECK_PROGRAMS,
  CANONICAL_DATA_SLATES,
  createHackingSession,
  executeDeckProgram
} from '../../services/cyberDeckService';
import AudioService from '../../services/audioService';

const CyberDeckModal = ({
  isOpen,
  onClose,
  heroTokens = [],
  onTriggerFloatingText,
  onBroadcastMessage
}) => {
  const [activeTab, setActiveTab] = useState('intrusion'); // 'intrusion' | 'slates'
  const [selectedTier, setSelectedTier] = useState('tier2');
  const [session, setSession] = useState(() => createHackingSession('tier2'));
  const [selectedProgramId, setSelectedProgramId] = useState('bruteforce_exe');
  const [selectedSlate, setSelectedSlate] = useState(CANONICAL_DATA_SLATES[0]);
  const [decryptedSlates, setDecryptedSlates] = useState({});

  if (!isOpen) return null;

  const handleSelectTier = (tier) => {
    AudioService.playTerminalBeep(880, 0.1);
    setSelectedTier(tier);
    setSession(createHackingSession(tier));
  };

  const handleResetSession = () => {
    AudioService.playTerminalBeep(520, 0.1);
    setSession(createHackingSession(selectedTier));
  };

  const handleRunProgram = (progId) => {
    if (session.isBreached || session.isTraced) return;

    AudioService.playDiceRoll();

    const updated = executeDeckProgram(session, progId, 4);
    setSession(updated);

    if (updated.isBreached) {
      AudioService.playCombatHit(true);
      if (onTriggerFloatingText) {
        onTriggerFloatingText(window.innerWidth / 2, window.innerHeight / 3, '🔓 ROOT PRIVILEGES GRANTED!', 'heal');
      }
    } else if (updated.isTraced) {
      AudioService.playCombatHit(true);
      if (onTriggerFloatingText) {
        onTriggerFloatingText(window.innerWidth / 2, window.innerHeight / 3, '🚨 TRACE 100% — LOCKDOWN!', 'damage');
      }
    } else {
      AudioService.playTerminalBeep(progId === 'stealthghost_exe' ? 1200 : 740, 0.12);
    }

    if (onBroadcastMessage) {
      onBroadcastMessage(`[CYBER-DECK INTRUSION]: Executed ${progId} against ${session.targetNode.label}: ICE [${updated.currentIceHp}/${updated.maxIceHp}] | Trace ${updated.traceLevel}%`);
    }
  };

  const handleDecryptSlate = (slateId) => {
    AudioService.playTerminalBeep(1100, 0.2);
    setDecryptedSlates(prev => ({
      ...prev,
      [slateId]: true
    }));

    const slate = CANONICAL_DATA_SLATES.find(s => s.id === slateId);
    if (onBroadcastMessage && slate) {
      onBroadcastMessage(`[DECRYPTED DATA-SLATE]: ${slate.title} — ${slate.content}`);
    }
  };

  const icePercent = Math.round((session.currentIceHp / session.maxIceHp) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#0e131d] border border-cyan-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              💻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                  Cyber-Deck Intrusion &amp; Encrypted Data-Slates
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
                  v4.8 CYBER-ICE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Active Node Breach, Software Exploits &amp; Classified Intel Decrypter
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('intrusion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'intrusion'
                ? 'bg-cyan-600 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            ⚡ Live Intrusion Grid
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('slates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'slates'
                ? 'bg-cyan-600 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            📂 Encrypted Data-Slates ({CANONICAL_DATA_SLATES.length})
          </button>
        </div>

        {/* Tab 1: Live Intrusion Grid */}
        {activeTab === 'intrusion' && (
          <div className="flex flex-col gap-3">
            {/* Target Node Selector Bar */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Target Node:</span>
                <select
                  value={selectedTier}
                  onChange={(e) => handleSelectTier(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 flex-1 cursor-pointer"
                >
                  {CYBER_TARGET_NODES.map(n => (
                    <option key={n.tier} value={n.tier}>{n.icon} {n.label} (DC {n.baseDc})</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetSession}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
              >
                ↻ Reboot Node
              </button>
            </div>

            {/* Intrusion Telemetry HUD */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              {/* ICE Barrier Integrity */}
              <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-cyan-900/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <span>🛡️</span> ICE Barrier Integrity
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {session.currentIceHp} / {session.maxIceHp} HP
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${icePercent}%` }}
                  />
                </div>
              </div>

              {/* System Trace Telemetry */}
              <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-rose-900/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                    <span>📡</span> System Trace Level
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-300">
                    {session.traceLevel}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    style={{ width: `${session.traceLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Outcome Banner */}
            {(session.isBreached || session.isTraced) && (
              <div className={`p-3 rounded-lg border text-center font-bold text-sm flex items-center justify-center gap-2 animate-fadeIn ${
                session.isBreached
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
              }`}>
                <span>{session.isBreached ? '🏆' : '🚨'}</span>
                <span>
                  {session.isBreached
                    ? `ROOT ACCESS GRANTED: Full control of ${session.targetNode.targetType} achieved!`
                    : 'LOCKDOWN: System trace reached 100%! Physical response team dispatched.'}
                </span>
              </div>
            )}

            {/* Cyber-Deck Program Deck */}
            {!session.isBreached && !session.isTraced && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Execute Cyber-Deck Program:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {CANONICAL_DECK_PROGRAMS.map(prog => (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => handleRunProgram(prog.id)}
                      className="p-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500 text-left flex flex-col gap-0.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{prog.icon}</span>
                        <span className="text-[9px] font-mono text-cyan-400">{prog.category}</span>
                      </div>
                      <span className="font-bold text-xs text-white group-hover:text-cyan-300">{prog.label}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{prog.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal Console Feed */}
            <div className="p-3 rounded-lg bg-black/90 border border-cyan-900/80 font-mono text-[11px] text-cyan-400 overflow-y-auto max-h-[140px] flex flex-col gap-1 shadow-inner">
              {session.logStream.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Encrypted Data-Slates */}
        {activeTab === 'slates' && (
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[420px] pr-1">
            {CANONICAL_DATA_SLATES.map(slate => {
              const isDecrypted = Boolean(decryptedSlates[slate.id]);

              return (
                <div
                  key={slate.id}
                  className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-2 hover:border-cyan-500/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📂</span>
                      <span className="font-bold text-xs text-cyan-300">{slate.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {slate.classification}
                      </span>
                    </div>

                    {!isDecrypted ? (
                      <button
                        type="button"
                        onClick={() => handleDecryptSlate(slate.id)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[10px] uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm"
                      >
                        🔓 Decrypt Slate
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        ✓ DECRYPTED
                      </span>
                    )}
                  </div>

                  <p className={`text-[11px] leading-relaxed p-2.5 rounded bg-black/50 border border-slate-800 font-mono ${
                    isDecrypted ? 'text-slate-200' : 'text-slate-500 blur-[2px]'
                  }`}>
                    {isDecrypted ? slate.content : '🔒 [ENCRYPTED DATA STREAM — DECRYPT VIA MASTERKEY OR INTELLECT HACK]'}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Cyber-Deck Terminal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyberDeckModal;
