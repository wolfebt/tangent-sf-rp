import React, { useState, useEffect } from 'react';
import { AudioService } from '../../../../services/audioService';
import { 
  Play, Pause, FastForward, Flame, Eye, MapPin, 
  Shield, Swords, AlertTriangle, CheckCircle, RefreshCw, 
  X, Plus, Trash2, Sliders, Radio, Compass
} from 'lucide-react';
import { TRAP_TYPES, NPC_SCRIPT_TYPES, stepNpcPatrols } from '../../../../services/reactiveVttService';

export const ReactiveAutomationConsole = ({
  isOpen,
  onClose,
  tokens = [],
  objects = [],
  onUpdateTokens,
  onUpdateObjects,
  onTriggerFloatingText,
  isAutomationActive,
  onToggleAutomation
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('traps'); // 'traps' | 'scripted_npcs' | 'ambients'
  const [ambientPatrolInterval, setAmbientPatrolInterval] = useState(null);
  const [selectedTokenForScript, setSelectedTokenForScript] = useState(tokens.find(t => t.type !== 'hero' && t.type !== 'link')?.id || '');
  const [selectedScriptType, setSelectedScriptType] = useState('patrol');

  // Extract all traps on map
  const trapObjects = objects.filter(obj => 
    obj.isTrap || obj.type === 'hazard' || obj.category === 'hazard' || !!TRAP_TYPES[obj.trapType || obj.type]
  );

  // Extract all scripted NPCs on map
  const scriptedNpcs = tokens.filter(t => t.script && t.script.type);

  // Step 1 Simulation Turn (ticks patrols)
  const handleStepSimulationTurn = () => {
    AudioService.playTerminalBeep(980, 0.08);
    const updated = stepNpcPatrols(tokens, 30);
    onUpdateTokens?.(updated);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, 100, '🤖 AUTOMATION STEP: Patrols Advanced by 1 Node', 'heal');
    }
  };

  // Toggle ambient real-time patrol runner
  const toggleAmbientPatrolRunner = () => {
    if (ambientPatrolInterval) {
      clearInterval(ambientPatrolInterval);
      setAmbientPatrolInterval(null);
      AudioService.playTerminalBeep(500, 0.1);
    } else {
      AudioService.playTerminalBeep(1100, 0.15);
      const interval = setInterval(() => {
        onUpdateTokens?.(prevTokens => stepNpcPatrols(prevTokens, 15));
      }, 800);
      setAmbientPatrolInterval(interval);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (ambientPatrolInterval) clearInterval(ambientPatrolInterval);
    };
  }, [ambientPatrolInterval]);

  // Trap Status Quick Toggles
  const handleToggleTrapState = (objId, nextState) => {
    AudioService.playTerminalBeep(850, 0.05);
    const nextObjects = objects.map(o => {
      if (o.id === objId) {
        return { ...o, trapState: nextState };
      }
      return o;
    });
    onUpdateObjects?.(nextObjects);
  };

  // Assign Script to Token
  const handleAssignScript = () => {
    if (!selectedTokenForScript) return;
    const targetToken = tokens.find(t => t.id === selectedTokenForScript);
    if (!targetToken) return;

    AudioService.playTerminalBeep(1200, 0.1);
    const nextTokens = tokens.map(t => {
      if (t.id === selectedTokenForScript) {
        // Create initial patrol waypoints around current position
        const baseX = t.x || 400;
        const baseY = t.y || 400;
        return {
          ...t,
          script: {
            type: selectedScriptType,
            waypoints: [
              { x: baseX, y: baseY },
              { x: baseX + 160, y: baseY },
              { x: baseX + 160, y: baseY + 140 },
              { x: baseX, y: baseY + 140 }
            ],
            currentWaypointIndex: 0,
            isPingPong: false,
            visionRangePx: 250,
            facingAngleDeg: 0,
            visionFovDeg: 90,
            alertBark: `Intruder detected in sector! ${t.label || 'Unit'} engaging!`
          }
        };
      }
      return t;
    });

    onUpdateTokens?.(nextTokens);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, 100, `🤖 SCRIPT ASSIGNED: ${selectedScriptType.toUpperCase()} to ${targetToken.label || 'Unit'}`, 'karma');
    }
  };

  const handleRemoveScript = (tokenId) => {
    AudioService.playCombatHit(false);
    const nextTokens = tokens.map(t => {
      if (t.id === tokenId) {
        const copy = { ...t };
        delete copy.script;
        return copy;
      }
      return t;
    });
    onUpdateTokens?.(nextTokens);
  };

  return (
    <div className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-cyan-300 font-mono uppercase tracking-wider">
                  VTT Reactive Automation & Script Cockpit
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${isAutomationActive ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {isAutomationActive ? 'Engine Online' : 'Engine Standby'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Autonomous Traps, Hazard Collisions, and Scripted NPC Patrol Routines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Global Controls Top Strip */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAutomation}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isAutomationActive
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isAutomationActive ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutomationActive ? 'Autonomous Traps: ON' : 'Autonomous Traps: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleStepSimulationTurn}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Advance NPC Patrols & Hazard Cycles by 1 Turn"
            >
              <FastForward size={13} />
              <span>Step Turn</span>
            </button>

            <button
              type="button"
              onClick={toggleAmbientPatrolRunner}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                ambientPatrolInterval
                  ? 'bg-amber-950 text-amber-300 border-amber-400 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Continuous ambient patrol animations"
            >
              <RefreshCw size={13} className={ambientPatrolInterval ? 'animate-spin' : ''} />
              <span>{ambientPatrolInterval ? 'Ambient Loop: RUNNING' : 'Ambient Loop: IDLE'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>Traps: <strong className="text-orange-400">{trapObjects.length}</strong></span>
            <span>Scripted NPCs: <strong className="text-cyan-400">{scriptedNpcs.length}</strong></span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('traps')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'traps'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame size={13} className="text-orange-400" />
            <span>Reactive Traps & Mines ({trapObjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scripted_npcs')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scripted_npcs'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={13} className="text-cyan-400" />
            <span>Scripted NPCs & Patrols ({scriptedNpcs.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs scrollbar-thin">
          {/* TAB 1: TRAPS */}
          {activeTab === 'traps' && (
            <div className="space-y-3">
              {trapObjects.length === 0 ? (
                <div className="py-10 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
                  <Flame size={24} className="opacity-40 text-orange-400" />
                  <p>No reactive traps or hazard units on current map.</p>
                  <p className="text-[10px] text-slate-600">
                    Open the ADE Story Elements Drawer and drag a Hazard / Trap onto the canvas!
                  </p>
                </div>
              ) : (
                trapObjects.map(trap => {
                  const state = trap.trapState || 'armed';
                  const dc = trap.saveDc || 14;
                  const damage = trap.damageDice || '2d10';

                  return (
                    <div
                      key={trap.id}
                      className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {state === 'armed' && '🔴'}
                          {state === 'disarmed' && '🟢'}
                          {state === 'triggered' && '🟡'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-200 font-mono text-xs">
                            {trap.label || trap.name || 'Proximity Hazard'}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                            <span>Save: Reflex DC {dc}</span>
                            <span>•</span>
                            <span>Damage: {damage}</span>
                            <span>•</span>
                            <span className="capitalize text-cyan-400">{trap.hazard || 'Plasma'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleTrapState(trap.id, state === 'armed' ? 'disarmed' : 'armed')}
                          className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                            state === 'armed'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                              : 'bg-orange-950 text-orange-300 border-orange-500/50 hover:bg-orange-900'
                          }`}
                        >
                          {state === 'armed' ? 'Disarm' : 'Arm'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleTrapState(trap.id, 'triggered')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Detonate Test
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SCRIPTED NPCS */}
          {activeTab === 'scripted_npcs' && (
            <div className="space-y-4">
              {/* Creator Strip */}
              <div className="p-3.5 bg-slate-900/90 border border-cyan-500/40 rounded-xl space-y-3">
                <h4 className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">
                  Attach Script to NPC / Adversary Token
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Target NPC</label>
                    <select
                      value={selectedTokenForScript}
                      onChange={(e) => setSelectedTokenForScript(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                    >
                      <option value="">Select NPC Unit...</option>
                      {tokens.filter(t => t.type !== 'hero' && t.type !== 'link').map(t => (
                        <option key={t.id} value={t.id}>
                          {t.label || t.name || 'Adversary Unit'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Script Type</label>
                    <select
                      value={selectedScriptType}
                      onChange={(e) => setSelectedScriptType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                    >
                      {Object.values(NPC_SCRIPT_TYPES).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAssignScript}
                      disabled={!selectedTokenForScript}
                      className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 disabled:opacity-50 text-cyan-300 border border-cyan-500/50 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Attach Script Routine
                    </button>
                  </div>
                </div>
              </div>

              {/* Scripted Units List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Active Scripted Roster ({scriptedNpcs.length})
                </h4>

                {scriptedNpcs.length === 0 ? (
                  <p className="text-slate-500 font-mono text-xs italic">
                    No NPCs currently executing scripts on this map.
                  </p>
                ) : (
                  scriptedNpcs.map(token => {
                    const script = token.script;
                    const waypoints = script.waypoints || [];
                    const curWp = waypoints[script.currentWaypointIndex || 0];

                    return (
                      <div
                        key={token.id}
                        className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {script.type === 'patrol' && '🚶'}
                            {script.type === 'sentry' && '👁️'}
                            {script.type === 'ambush' && '🥷'}
                            {script.type === 'dialogue_bark' && '💬'}
                            {script.type === 'flee_to_safety' && '🏃'}
                          </span>
                          <div>
                            <div className="font-bold text-slate-200 font-mono text-xs">
                              {token.label || 'Unit'}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                              <span className="text-cyan-400 uppercase font-bold">{script.type}</span>
                              <span>•</span>
                              <span>
                                {waypoints.length > 0 
                                  ? `Waypoint ${(script.currentWaypointIndex || 0) + 1}/${waypoints.length} [x:${curWp?.x || 0}, y:${curWp?.y || 0}]`
                                  : 'Stationary Watch'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => handleRemoveScript(token.id)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                            title="Detach Script"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Autonomous Map Dynamics • Tangent SFF Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Cockpit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactiveAutomationConsole;
