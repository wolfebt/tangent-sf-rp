import React, { useState, useEffect } from 'react';
import { AudioService } from '../../../../services/audioService';
import { generateContent } from '../../../../services/aimeService';
import { 
  Bot, Eye, MapPin, Compass, ShieldAlert, 
  Sparkles, Check, Plus, Trash2, Sliders, MessageSquare, 
  Swords, Shield, Radio, Flame, AlertTriangle 
} from 'lucide-react';

const ROUTINE_TYPES = [
  { id: 'patrol', name: 'Waypoint Patrol Loop', icon: '🚶', desc: 'Advances continuously along assigned coordinate waypoints.' },
  { id: 'sentry', name: 'Stationary Sentry Cone', icon: '👁️', desc: 'Guards an assigned post facing a vision cone; sounds siren on breach.' },
  { id: 'ambush', name: 'Stealth Ambush Stalker', icon: '🥷', desc: 'Remains cloaked until an operative breaches proximity, then ambushes.' },
  { id: 'dialogue_bark', name: 'Interactive Comms Bark', icon: '💬', desc: 'Broadcasts radio comms transmission when operatives enter range.' }
];

const BEHAVIOR_PROFILES = [
  { id: 'tactical', name: 'Tactical / Commando', desc: 'Takes cover (+2/+4 DC), suppresses threats, coordinates fire.' },
  { id: 'aggressive', name: 'Aggressive / Swarm', desc: 'Pushes into effective range, prioritizes wounded targets.' },
  { id: 'guardian', name: 'Guardian / Protector', desc: 'Tethers to VIP ally, intercepts chargers, deploys shields.' },
  { id: 'survivalist', name: 'Survivalist / Skirmisher', desc: 'Maintains max weapon range, hit-and-run, flees if outmatched.' },
  { id: 'sniper', name: 'Sniper / Precision', desc: 'Takes aim (+2), targets vital/head hit locations.' },
  { id: 'bruiser', name: 'Bruiser / Vanguard', desc: 'Rushes front line, forces melee disadvantage on ranged.' },
  { id: 'boss', name: 'Sector Commander', desc: 'Multi-phase tactical command, AoE barrages, emergency shields.' }
];

export const NpcScriptBuilder = ({
  fields = {},
  onFieldChange,
  elementTitle = '',
  onOpenAimeGuidance = null
}) => {
  // Parse existing vttScript if present
  const initialScript = (() => {
    if (typeof fields.vttScript === 'object' && fields.vttScript !== null) return fields.vttScript;
    if (typeof fields.vttScript === 'string' && fields.vttScript.trim().startsWith('{')) {
      try {
        return JSON.parse(fields.vttScript);
      } catch (e) {
        return null;
      }
    }
    return null;
  })();

  const [isEnabled, setIsEnabled] = useState(Boolean(initialScript || fields.vttScriptActive === 'true'));
  const [routineType, setRoutineType] = useState(initialScript?.type || 'patrol');
  const [behaviorProfile, setBehaviorProfile] = useState(initialScript?.behaviorProfile || fields.mcmRole?.toLowerCase() || 'tactical');
  const [visionRangePx, setVisionRangePx] = useState(initialScript?.visionRangePx || 250);
  const [visionFovDeg, setVisionFovDeg] = useState(initialScript?.visionFovDeg || 90);
  const [facingAngleDeg, setFacingAngleDeg] = useState(initialScript?.facingAngleDeg || 0);
  const [detectionDc, setDetectionDc] = useState(initialScript?.detectionDc || 14);
  const [alertBark, setAlertBark] = useState(initialScript?.alertBark || `Intruder detected in sector! ${elementTitle || 'Unit'} engaging!`);
  const [moraleThreshold, setMoraleThreshold] = useState(initialScript?.moraleThreshold ?? 0.25);
  const [isPingPong, setIsPingPong] = useState(initialScript?.isPingPong || false);
  const [waypoints, setWaypoints] = useState(
    Array.isArray(initialScript?.waypoints) && initialScript.waypoints.length > 0
      ? initialScript.waypoints
      : [
          { x: 300, y: 300 },
          { x: 460, y: 300 },
          { x: 460, y: 440 },
          { x: 300, y: 440 }
        ]
  );

  // Relational Directives
  const [relationsStance, setRelationsStance] = useState(fields.relationsStance || 'Hostile');
  const [vipTarget, setVipTarget] = useState(fields.vipTarget || '');
  const [rivalTarget, setRivalTarget] = useState(fields.rivalTarget || '');
  const [isSynthesizingScript, setIsSynthesizingScript] = useState(false);

  // Serialize script state whenever any parameter changes
  useEffect(() => {
    if (!isEnabled) {
      onFieldChange?.('vttScriptActive', 'false');
      return;
    }

    const scriptObject = {
      type: routineType,
      behaviorProfile,
      moraleThreshold,
      visionRangePx,
      visionFovDeg,
      facingAngleDeg,
      detectionDc,
      alertBark,
      isPingPong,
      waypoints: routineType === 'patrol' ? waypoints : [],
      relationsStance,
      vipTarget: vipTarget.trim() || null,
      rivalTarget: rivalTarget.trim() || null
    };

    onFieldChange?.('vttScriptActive', 'true');
    onFieldChange?.('vttScript', JSON.stringify(scriptObject, null, 2));
    onFieldChange?.('relationsStance', relationsStance);
    onFieldChange?.('vipTarget', vipTarget);
    onFieldChange?.('rivalTarget', rivalTarget);
  }, [
    isEnabled,
    routineType,
    behaviorProfile,
    moraleThreshold,
    visionRangePx,
    visionFovDeg,
    facingAngleDeg,
    detectionDc,
    alertBark,
    isPingPong,
    waypoints,
    relationsStance,
    vipTarget,
    rivalTarget
  ]);

  const handleToggleEnable = () => {
    AudioService.playTerminalBeep(isEnabled ? 600 : 1050, 0.08);
    setIsEnabled(!isEnabled);
  };

  const handleAddWaypoint = () => {
    AudioService.playTerminalBeep(980, 0.04);
    const lastWp = waypoints[waypoints.length - 1] || { x: 300, y: 300 };
    setWaypoints([...waypoints, { x: lastWp.x + 80, y: lastWp.y + 60 }]);
  };

  const handleUpdateWaypoint = (idx, axis, val) => {
    const updated = [...waypoints];
    updated[idx] = {
      ...updated[idx],
      [axis]: parseInt(val, 10) || 0
    };
    setWaypoints(updated);
  };

  const handleRemoveWaypoint = (idx) => {
    AudioService.playTerminalBeep(550, 0.05);
    setWaypoints(waypoints.filter((_, i) => i !== idx));
  };

  // 1-Click AIME Script Routine Architect
  const handleAimeArchitectScript = async () => {
    setIsSynthesizingScript(true);
    AudioService.playTerminalBeep(980, 0.08);

    const prompt = `You are AIME designing an autonomous VTT routine for the character "${elementTitle || 'NPC'}".
Tactical Role: ${behaviorProfile}
Stance: ${relationsStance}
Target VIP: ${vipTarget || 'None'}
Marked Rival: ${rivalTarget || 'None'}

Generate realistic tactical VTT script parameters:
1. Alert radio transmission bark (in-universe comms chatter)
2. Detection DC (Reflex/Stealth check 12-16)
3. Vision Range in pixels (200-400px)
4. Vision FOV angle in degrees (60-120 deg)
5. Morale break percentage (0.15 - 0.35)

Respond in JSON format:
{
  "alertBark": "Evocative radio transmission bark",
  "detectionDc": 14,
  "visionRangePx": 280,
  "visionFovDeg": 90,
  "moraleThreshold": 0.25
}`;

    try {
      const responseText = await generateContent({ prompt });
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.alertBark) setAlertBark(parsed.alertBark);
      if (parsed.detectionDc) setDetectionDc(parsed.detectionDc);
      if (parsed.visionRangePx) setVisionRangePx(parsed.visionRangePx);
      if (parsed.visionFovDeg) setVisionFovDeg(parsed.visionFovDeg);
      if (parsed.moraleThreshold) setMoraleThreshold(parsed.moraleThreshold);

      AudioService.playTerminalBeep(1200, 0.12);
    } catch (err) {
      console.warn('AIME script synthesis error:', err);
    } finally {
      setIsSynthesizingScript(false);
    }
  };

  return (
    <div className="p-4 bg-slate-950/80 border border-purple-500/40 rounded-2xl flex flex-col gap-4 font-sans select-none shadow-xl">
      {/* Header & Enable Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-base shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-300 font-mono flex items-center gap-2">
              <span>Autonomous VTT Script & Relations Engine</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono uppercase border ${
                isEnabled ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {isEnabled ? 'Automation Armed' : 'Static Standby'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Program autonomous patrol routes, sentry vision cones, and relational directives for the live VTT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEnabled && (
            <button
              type="button"
              disabled={isSynthesizingScript}
              onClick={handleAimeArchitectScript}
              className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={12} className={isSynthesizingScript ? 'animate-spin text-amber-400' : 'text-amber-400'} />
              <span>{isSynthesizingScript ? 'Synthesizing...' : 'AIME Script Architect'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleEnable}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isEnabled 
                ? 'bg-purple-950 text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Bot size={13} />
            <span>{isEnabled ? 'Script Enabled' : 'Enable Script'}</span>
          </button>
        </div>
      </div>

      {/* Relational Dynamics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        {/* Default Stance */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Default Relational Stance
          </label>
          <select
            value={relationsStance}
            onChange={(e) => setRelationsStance(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-purple-300 p-1.5 rounded-lg text-xs font-bold outline-none focus:border-purple-400 font-mono"
          >
            <option value="Hostile">Hostile (Aggressive on Sight)</option>
            <option value="Suspicious">Suspicious (Warns then Attacks)</option>
            <option value="Neutral">Neutral (Ignores unless provoked)</option>
            <option value="Friendly">Friendly (Assists Party)</option>
            <option value="Guarding">Guarding (Protects VIP / Post)</option>
          </select>
        </div>

        {/* Protected VIP Target */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1">
            <Shield size={11} />
            <span>Protected VIP / Tether Ally</span>
          </label>
          <input
            type="text"
            value={vipTarget}
            onChange={(e) => setVipTarget(e.target.value)}
            placeholder="E.g. Lord Vane, Dr. Aris (Tethers unit)"
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
          />
        </div>

        {/* Marked Rival / Nemesis */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1">
            <Swords size={11} />
            <span>Marked Rival / Priority Enemy</span>
          </label>
          <input
            type="text"
            value={rivalTarget}
            onChange={(e) => setRivalTarget(e.target.value)}
            placeholder="E.g. Void Infiltrator, Syndicates (Focus fire)"
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* Script Builder Body (Only rendered if enabled) */}
      {isEnabled && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Routine Types Radio Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {ROUTINE_TYPES.map((rt) => {
              const isSelected = routineType === rt.id;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(980, 0.03);
                    setRoutineType(rt.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs font-mono">
                    <span>{rt.icon}</span>
                    <span className="truncate">{rt.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {rt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Routine-Specific Configuration */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            {/* Patrol Waypoints Editor */}
            {routineType === 'patrol' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-cyan-400" />
                    <span className="text-xs font-mono font-bold uppercase text-cyan-300">
                      Patrol Route Waypoints ({waypoints.length} Nodes)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPingPong}
                        onChange={(e) => setIsPingPong(e.target.checked)}
                        className="accent-purple-400"
                      />
                      <span>Ping-Pong Mode</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddWaypoint}
                      className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={10} /> Add Node
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {waypoints.map((wp, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-1 text-[11px] font-mono">
                      <span className="text-purple-400 font-bold">W{idx + 1}:</span>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-slate-500">X:</span>
                        <input
                          type="number"
                          value={wp.x}
                          onChange={(e) => handleUpdateWaypoint(idx, 'x', e.target.value)}
                          className="w-12 bg-slate-900 border border-slate-700 text-slate-100 px-1 py-0.5 rounded text-[10px] outline-none"
                        />
                        <span className="text-slate-500">Y:</span>
                        <input
                          type="number"
                          value={wp.y}
                          onChange={(e) => handleUpdateWaypoint(idx, 'y', e.target.value)}
                          className="w-12 bg-slate-900 border border-slate-700 text-slate-100 px-1 py-0.5 rounded text-[10px] outline-none"
                        />
                      </div>
                      {waypoints.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWaypoint(idx)}
                          className="text-slate-500 hover:text-red-400 p-0.5"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sentry Cone Controls */}
            {routineType === 'sentry' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
                    <span>Vision Range (px)</span>
                    <span className="text-cyan-300">{visionRangePx}px</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="25"
                    value={visionRangePx}
                    onChange={(e) => setVisionRangePx(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
                    <span>Vision Cone Angle</span>
                    <span className="text-purple-300">{visionFovDeg}° FOV</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={visionFovDeg}
                    onChange={(e) => setVisionFovDeg(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
                    <span>Facing Direction</span>
                    <span className="text-amber-300">{facingAngleDeg}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    step="15"
                    value={facingAngleDeg}
                    onChange={(e) => setFacingAngleDeg(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Comms Transmission Bark & Detection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Radio size={11} className="text-emerald-400" />
                  <span>Proximity Alert / Comms Transmission Bark</span>
                </label>
                <input
                  type="text"
                  value={alertBark}
                  onChange={(e) => setAlertBark(e.target.value)}
                  placeholder="Transmission text broadcasted when players breach detection zone..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Morale Break Limit</span>
                  <span className="text-rose-400">{Math.round(moraleThreshold * 100)}% HP</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={moraleThreshold}
                  onChange={(e) => setMoraleThreshold(parseFloat(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-500 block">
                  {moraleThreshold === 0 ? 'Fights to the death' : 'Retreats/surrenders under threshold'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NpcScriptBuilder;
